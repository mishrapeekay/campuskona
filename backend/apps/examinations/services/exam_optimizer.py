"""
Genetic Algorithm optimizer for exam schedule soft constraints.

Takes a feasible schedule from the CSP solver and optimizes for:
- S1: Even spacing between exams for students
- S2: Heavy subjects spread apart
- S3: Optimal hall utilization (minimize wasted capacity)
- S4: Avoid heavy subjects on consecutive exam days
"""

import random
from copy import deepcopy
from collections import defaultdict


class ExamScheduleOptimizer:
    """
    GA optimizer for exam scheduling soft constraints.
    """

    def __init__(self, feasible_schedule, inputs, config, progress_callback=None):
        """
        Args:
            feasible_schedule: dict from ExamScheduleGenerator
            inputs: dict from collect_exam_inputs()
            config: ExamScheduleConfig model instance
            progress_callback: callable(percent, message)
        """
        self.initial_schedule = feasible_schedule
        self.inputs = inputs
        self.config = config
        self.progress_callback = progress_callback

        self.exam_slots = inputs['exam_slots']
        self.halls = inputs['halls']
        self.sections = inputs['sections']
        self.heavy_subject_ids = inputs.get('heavy_subject_ids', set())
        self.subjects = inputs['subjects']
        self.min_gap = inputs['min_gap']
        self.max_exams_per_day = inputs['max_exams_per_day']

        # Exam info for conflict checking
        self.exam_info = {}
        for section in self.sections:
            for subj in self.subjects.get(section['class_id'], []):
                key = (section['class_id'], subj['subject_id'])
                if key not in self.exam_info:
                    self.exam_info[key] = {
                        'class_id': section['class_id'],
                        'subject_id': subj['subject_id'],
                        'student_count': 0,
                        'section_ids': [],
                    }
                self.exam_info[key]['section_ids'].append(section['id'])
                self.exam_info[key]['student_count'] += section.get('student_count', 40)

        self.exam_keys = list(feasible_schedule.keys())

        # Class conflict graph
        self.class_conflicts = defaultdict(set)
        for i, k1 in enumerate(self.exam_keys):
            for k2 in self.exam_keys[i + 1:]:
                if k1[0] == k2[0]:  # Same class
                    self.class_conflicts[k1].add(k2)
                    self.class_conflicts[k2].add(k1)

        self.weights = {
            'gap_balance': config.weight_gap_balance,
            'heavy_spread': config.weight_heavy_subject_spread,
            'hall_utilization': config.weight_hall_utilization,
            'invigilator_balance': config.weight_invigilator_balance,
        }

        self.population_size = config.population_size
        self.max_iterations = config.max_iterations

    def optimize(self):
        """
        Run GA optimization.
        Returns (optimized_schedule, fitness_score).
        """
        population = self._generate_population()

        best_score = -1
        best_solution = None
        no_improvement = 0
        plateau_threshold = 40

        for gen in range(self.max_iterations):
            scored = [(sol, self.fitness(sol)) for sol in population]
            scored.sort(key=lambda x: x[1], reverse=True)

            current_best = scored[0][1]

            if current_best > best_score:
                best_score = current_best
                best_solution = deepcopy(scored[0][0])
                no_improvement = 0
            else:
                no_improvement += 1

            if gen % 15 == 0:
                pct = int((gen / self.max_iterations) * 100)
                self._report_progress(pct, f'Gen {gen}/{self.max_iterations}, score: {best_score:.1f}')

            if no_improvement >= plateau_threshold:
                self._report_progress(100, f'Converged at gen {gen}. Score: {best_score:.1f}')
                break

            if best_score >= 95.0:
                self._report_progress(100, f'Excellent score ({best_score:.1f}).')
                break

            # Selection + Crossover + Mutation
            new_pop = []

            elite_count = max(2, self.population_size // 10)
            for i in range(elite_count):
                new_pop.append(deepcopy(scored[i][0]))

            while len(new_pop) < self.population_size:
                p1 = self._tournament_select(scored)
                p2 = self._tournament_select(scored)
                child = self._crossover(p1, p2)
                child = self._mutate(child)

                if self._verify_hard_constraints(child):
                    new_pop.append(child)
                else:
                    new_pop.append(deepcopy(p1))

            population = new_pop

        self._report_progress(100, f'Optimization complete. Score: {best_score:.1f}')
        return best_solution if best_solution else self.initial_schedule, best_score

    def fitness(self, schedule):
        """Calculate fitness score 0-100."""
        score = 100.0

        # S1: Gap balance — exams should be evenly spaced per class
        score -= self.weights['gap_balance'] * self._calc_gap_penalty(schedule)

        # S2: Heavy subject spread
        score -= self.weights['heavy_spread'] * self._calc_heavy_spread_penalty(schedule)

        # S3: Hall utilization
        score -= self.weights['hall_utilization'] * self._calc_hall_penalty(schedule)

        # S4: Invigilator balance (proxy: exams per day balance)
        score -= self.weights['invigilator_balance'] * self._calc_daily_balance_penalty(schedule)

        return max(0.0, score)

    def _calc_gap_penalty(self, schedule):
        """Penalty for uneven gaps between exams for same class."""
        class_dates = defaultdict(list)
        for key, val in schedule.items():
            class_dates[key[0]].append(val['date'])

        penalty = 0.0
        for cid, dates in class_dates.items():
            if len(dates) < 2:
                continue
            sorted_dates = sorted(dates)
            gaps = [(sorted_dates[i + 1] - sorted_dates[i]).days
                    for i in range(len(sorted_dates) - 1)]
            if not gaps:
                continue
            mean_gap = sum(gaps) / len(gaps)
            variance = sum((g - mean_gap) ** 2 for g in gaps) / len(gaps)
            penalty += variance * 0.3

        return min(penalty, 10.0)

    def _calc_heavy_spread_penalty(self, schedule):
        """Penalty for heavy subjects on consecutive days for same class."""
        if not self.heavy_subject_ids:
            return 0.0

        class_heavy_dates = defaultdict(list)
        for key, val in schedule.items():
            if key[1] in self.heavy_subject_ids:
                class_heavy_dates[key[0]].append(val['date'])

        penalty = 0
        for cid, dates in class_heavy_dates.items():
            sorted_dates = sorted(dates)
            for i in range(len(sorted_dates) - 1):
                gap = (sorted_dates[i + 1] - sorted_dates[i]).days
                if gap <= 1:
                    penalty += 2
                elif gap == 2:
                    penalty += 0.5

        return min(penalty * 1.5, 10.0)

    def _calc_hall_penalty(self, schedule):
        """Penalty for wasted hall capacity."""
        hall_map = {h['id']: h['seating_capacity'] for h in self.halls}
        total_waste = 0

        for key, val in schedule.items():
            info = self.exam_info.get(key, {})
            needed = info.get('student_count', 0)
            capacity = sum(hall_map.get(hid, 0) for hid in val.get('hall_ids', []))
            if capacity > 0:
                waste_ratio = (capacity - needed) / capacity
                total_waste += waste_ratio

        num_exams = len(schedule) or 1
        avg_waste = total_waste / num_exams
        return min(avg_waste * 10.0, 10.0)

    def _calc_daily_balance_penalty(self, schedule):
        """Penalty for unbalanced number of exams per day."""
        day_counts = defaultdict(int)
        for val in schedule.values():
            day_counts[val['date']] += 1

        if not day_counts:
            return 0.0

        counts = list(day_counts.values())
        mean = sum(counts) / len(counts)
        variance = sum((c - mean) ** 2 for c in counts) / len(counts)
        return min(variance * 0.5, 10.0)

    def _generate_population(self):
        """Generate initial population from feasible schedule."""
        population = [deepcopy(self.initial_schedule)]
        for _ in range(self.population_size - 1):
            variant = deepcopy(self.initial_schedule)
            for _ in range(random.randint(2, 6)):
                variant = self._mutate(variant)
                if not self._verify_hard_constraints(variant):
                    variant = deepcopy(self.initial_schedule)
                    break
            population.append(variant)
        return population

    def _tournament_select(self, scored, k=3):
        candidates = random.sample(scored, min(k, len(scored)))
        candidates.sort(key=lambda x: x[1], reverse=True)
        return deepcopy(candidates[0][0])

    def _crossover(self, parent1, parent2):
        """Crossover: for each class, take schedule from one parent."""
        child = {}
        class_ids = set(k[0] for k in self.exam_keys)

        for cid in class_ids:
            source = parent1 if random.random() < 0.5 else parent2
            for key in self.exam_keys:
                if key[0] == cid and key in source:
                    child[key] = deepcopy(source[key])

        return child

    def _mutate(self, schedule, mutation_rate=0.15):
        """Mutation: move a random exam to a different valid slot."""
        if random.random() > mutation_rate:
            return schedule

        schedule = deepcopy(schedule)
        if not self.exam_keys:
            return schedule

        key = random.choice(self.exam_keys)
        if key not in schedule:
            return schedule

        # Try to find a new valid slot
        current = schedule[key]
        available_slots = [s for s in self.exam_slots
                          if s != (current['date'], current['session'])]

        random.shuffle(available_slots)

        for new_date, new_session in available_slots[:10]:
            # Quick feasibility check
            old_val = schedule[key]
            schedule[key] = {
                'date': new_date,
                'session': new_session,
                'hall_ids': old_val['hall_ids'],
            }

            if self._verify_hard_constraints(schedule):
                return schedule

            schedule[key] = old_val

        return schedule

    def _verify_hard_constraints(self, schedule):
        """Verify all hard constraints are satisfied."""
        for key, val in schedule.items():
            class_id = key[0]
            slot_date = val['date']
            session = val['session']

            # Check no same-class exam at same date+session
            for other_key, other_val in schedule.items():
                if other_key == key:
                    continue
                if (other_val['date'] == slot_date and
                        other_val['session'] == session and
                        other_key in self.class_conflicts.get(key, set())):
                    return False

            # Check max exams per day
            day_count = sum(1 for ok, ov in schedule.items()
                          if ok[0] == class_id and ov['date'] == slot_date)
            if day_count > self.max_exams_per_day:
                return False

            # Check min gap
            if self.min_gap > 0:
                for other_key, other_val in schedule.items():
                    if other_key == key:
                        continue
                    if other_key[0] == class_id:
                        gap = abs((slot_date - other_val['date']).days)
                        if 0 < gap < self.min_gap:
                            return False

            # Check hall not double-booked
            for other_key, other_val in schedule.items():
                if other_key == key:
                    continue
                if (other_val['date'] == slot_date and
                        other_val['session'] == session):
                    overlap = set(val.get('hall_ids', [])) & set(other_val.get('hall_ids', []))
                    if overlap:
                        return False

        return True

    def _report_progress(self, percent, message):
        if self.progress_callback:
            self.progress_callback(percent, message)
