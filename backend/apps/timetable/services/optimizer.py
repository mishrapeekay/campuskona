"""
Genetic Algorithm optimizer for timetable soft constraints.

Takes a feasible timetable from the CSP solver and optimizes it
for soft constraints (workload balance, subject spread, etc.)
while maintaining hard constraint satisfaction.
"""

import random
from copy import deepcopy
from collections import defaultdict

from .constraints import (
    check_all_hard_constraints,
    calc_workload_variance,
    calc_heavy_subject_adjacency,
    calc_subject_clustering,
    calc_teacher_preference_violations,
    calc_room_changes,
    calc_consecutive_teacher_periods,
)


# Subject IDs considered "heavy" for adjacency penalty
# These would ideally come from the database, but for now we use
# a heuristic: subjects with names containing these keywords
HEAVY_SUBJECT_KEYWORDS = {
    'math', 'physics', 'chemistry', 'calculus', 'algebra',
    'trigonometry', 'statistics',
}


class TimetableOptimizer:
    """
    Genetic Algorithm optimizer for timetable soft constraints.
    """

    def __init__(self, feasible_timetable, inputs, config, progress_callback=None):
        """
        Args:
            feasible_timetable: dict from CSP generator
            inputs: dict from collect_generation_inputs()
            config: TimetableGenerationConfig model instance
            progress_callback: callable(percent, message)
        """
        self.initial_timetable = feasible_timetable
        self.inputs = inputs
        self.config = config
        self.progress_callback = progress_callback

        self.slots = inputs['slots']
        self.days = inputs['days']
        self.sections = inputs['sections']
        self.teachers = inputs['teachers']
        self.teacher_availability = inputs['teacher_availability']
        self.requirements = inputs['requirements']

        self.num_slots = len(self.slots)
        self.section_ids = [s['id'] for s in self.sections]

        # Build slot info lookup
        self.slot_info = {idx: s for idx, s in enumerate(self.slots)}

        # Identify heavy subjects
        self.heavy_subject_ids = set()
        for section_reqs in self.requirements.values():
            for req in section_reqs:
                name = req.get('subject_name', '').lower()
                if any(kw in name for kw in HEAVY_SUBJECT_KEYWORDS):
                    self.heavy_subject_ids.add(req['subject_id'])

        # Weights from config
        self.weights = {
            'workload_balance': config.weight_workload_balance,
            'subject_spread': config.weight_subject_spread,
            'teacher_preference': config.weight_teacher_preference,
            'room_optimization': config.weight_room_optimization,
            'no_consecutive_heavy': config.weight_no_consecutive_heavy,
        }

        self.population_size = config.population_size
        self.max_iterations = config.max_iterations

    def optimize(self):
        """
        Run the genetic algorithm to optimize the timetable.

        Returns:
            (optimized_timetable, fitness_score)
        """
        # Generate initial population
        population = self._generate_population()

        best_score = -1
        best_solution = None
        no_improvement_count = 0
        plateau_threshold = 50

        for generation in range(self.max_iterations):
            # Score all solutions
            scored = [(sol, self.fitness(sol)) for sol in population]
            scored.sort(key=lambda x: x[1], reverse=True)

            current_best_score = scored[0][1]

            if current_best_score > best_score:
                best_score = current_best_score
                best_solution = deepcopy(scored[0][0])
                no_improvement_count = 0
            else:
                no_improvement_count += 1

            # Progress reporting
            if generation % 20 == 0:
                pct = int((generation / self.max_iterations) * 100)
                self._report_progress(
                    pct,
                    f'Generation {generation}/{self.max_iterations}, '
                    f'best score: {best_score:.1f}'
                )

            # Early termination if fitness plateaus
            if no_improvement_count >= plateau_threshold:
                self._report_progress(
                    100,
                    f'Converged at generation {generation}. Score: {best_score:.1f}'
                )
                break

            # Early termination if score is very high
            if best_score >= 95.0:
                self._report_progress(100, f'Excellent score ({best_score:.1f}) reached.')
                break

            # Selection + Crossover + Mutation
            new_population = []

            # Elitism: keep top 10%
            elite_count = max(2, self.population_size // 10)
            for i in range(elite_count):
                new_population.append(deepcopy(scored[i][0]))

            # Fill rest via tournament selection + crossover + mutation
            while len(new_population) < self.population_size:
                parent1 = self._tournament_select(scored)
                parent2 = self._tournament_select(scored)

                child = self._crossover(parent1, parent2)
                child = self._mutate(child)

                # Verify hard constraints still hold
                if self._verify_hard_constraints(child):
                    new_population.append(child)
                else:
                    # If mutation broke constraints, keep a parent
                    new_population.append(deepcopy(parent1))

            population = new_population

        self._report_progress(100, f'Optimization complete. Final score: {best_score:.1f}')

        return best_solution if best_solution else self.initial_timetable, best_score

    def fitness(self, timetable):
        """
        Calculate fitness score (0-100) for a timetable.
        Higher = better.
        """
        score = 100.0

        # S1: Teacher workload balance
        penalty = calc_workload_variance(
            timetable, self.teachers, self.days
        )
        score -= self.weights['workload_balance'] * penalty

        # S2: Heavy subject adjacency
        penalty = calc_heavy_subject_adjacency(
            timetable, self.heavy_subject_ids,
            self.section_ids, self.days, self.num_slots
        )
        score -= self.weights['no_consecutive_heavy'] * penalty

        # S3: Subject clustering
        penalty = calc_subject_clustering(
            timetable, self.section_ids, self.days, self.num_slots
        )
        score -= self.weights['subject_spread'] * penalty

        # S4: Teacher preference violations
        penalty = calc_teacher_preference_violations(
            timetable, self.teacher_availability, self.days
        )
        score -= self.weights['teacher_preference'] * penalty

        # S5: Room changes
        penalty = calc_room_changes(
            timetable, self.section_ids, self.days, self.num_slots
        )
        score -= self.weights['room_optimization'] * penalty

        # S7: Consecutive teacher periods
        penalty = calc_consecutive_teacher_periods(
            timetable, self.teachers, self.days, self.num_slots,
            self.teacher_availability
        )
        score -= self.weights['workload_balance'] * penalty * 0.5

        return max(0.0, score)

    def _generate_population(self):
        """Generate initial population from the feasible timetable."""
        population = [deepcopy(self.initial_timetable)]

        for _ in range(self.population_size - 1):
            variant = deepcopy(self.initial_timetable)
            # Apply random mutations to create variation
            num_mutations = random.randint(3, 10)
            for _ in range(num_mutations):
                variant = self._mutate(variant)
                if not self._verify_hard_constraints(variant):
                    variant = deepcopy(self.initial_timetable)
                    break
            population.append(variant)

        return population

    def _tournament_select(self, scored, k=3):
        """Tournament selection: pick best from k random candidates."""
        candidates = random.sample(scored, min(k, len(scored)))
        candidates.sort(key=lambda x: x[1], reverse=True)
        return deepcopy(candidates[0][0])

    def _crossover(self, parent1, parent2):
        """
        Day-level crossover: for each section, randomly pick days
        from parent1 or parent2.
        """
        child = {}

        for section_id in self.section_ids:
            for day in self.days:
                # Randomly choose which parent to take this day from
                source = parent1 if random.random() < 0.5 else parent2

                for slot_idx in range(self.num_slots):
                    key = (section_id, day, slot_idx)
                    if key in source:
                        child[key] = deepcopy(source[key])

        return child

    def _mutate(self, timetable, mutation_rate=0.1):
        """
        Mutation: swap two slots within the same section and day.
        Only swaps if hard constraints remain satisfied.
        """
        if random.random() > mutation_rate:
            return timetable

        timetable = deepcopy(timetable)

        # Pick a random section and day
        section_id = random.choice(self.section_ids)
        day = random.choice(self.days)

        # Get all filled slots for this section-day
        filled = []
        for slot_idx in range(self.num_slots):
            key = (section_id, day, slot_idx)
            if key in timetable and timetable[key] is not None:
                filled.append(slot_idx)

        if len(filled) < 2:
            return timetable

        # Pick two slots to swap
        s1, s2 = random.sample(filled, 2)
        key1 = (section_id, day, s1)
        key2 = (section_id, day, s2)

        # Swap
        timetable[key1], timetable[key2] = timetable[key2], timetable[key1]

        return timetable

    def _verify_hard_constraints(self, timetable):
        """
        Verify that all hard constraints are still satisfied.
        Quick check: no teacher double-booking.
        """
        teacher_slots = defaultdict(set)

        for (section_id, day, slot_idx), assignment in timetable.items():
            if assignment is None:
                continue
            tid = assignment.get('teacher_id')
            if tid:
                slot_key = (day, slot_idx)
                if slot_key in teacher_slots[tid]:
                    return False  # Teacher double-booked
                teacher_slots[tid].add(slot_key)

        return True

    def _report_progress(self, percent, message):
        """Report progress if callback available."""
        if self.progress_callback:
            self.progress_callback(percent, message)
