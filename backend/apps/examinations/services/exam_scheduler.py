"""
AI Exam Schedule Generator using CSP + Backtracking.

Generates a feasible exam schedule that satisfies all hard constraints:
- H1: No student takes two exams at the same time
- H2: Exam hall capacity not exceeded
- H3: Each subject scheduled exactly once per class/section
- H4: Exams only on allowed dates/sessions
- H5: Minimum gap between exams for same students respected
"""

import random
from datetime import date, timedelta
from collections import defaultdict


class ExamScheduleGenerator:
    """
    CSP-based exam schedule generator with MRV heuristic.
    """

    def __init__(self, inputs, progress_callback=None):
        """
        Args:
            inputs: dict from collect_exam_inputs()
            progress_callback: callable(percent, message)
        """
        self.inputs = inputs
        self.progress_callback = progress_callback

        self.exam_slots = inputs['exam_slots']  # list of (date, session) tuples
        self.subjects = inputs['subjects']       # list of subject dicts per class
        self.halls = inputs['halls']             # list of hall dicts
        self.sections = inputs['sections']       # list of section dicts
        self.min_gap = inputs['min_gap']
        self.max_exams_per_day = inputs['max_exams_per_day']
        self.heavy_subject_ids = inputs.get('heavy_subject_ids', set())

        # Build assignment list: each "exam" is a (class_id, subject_id) combo
        self.exams_to_schedule = []
        self.exam_info = {}
        for section in self.sections:
            for subj in self.subjects.get(section['class_id'], []):
                key = (section['class_id'], subj['subject_id'])
                if key not in self.exam_info:
                    self.exam_info[key] = {
                        'class_id': section['class_id'],
                        'class_name': section.get('class_name', ''),
                        'subject_id': subj['subject_id'],
                        'subject_name': subj.get('subject_name', ''),
                        'duration_minutes': subj.get('duration_minutes', 180),
                        'max_marks': subj.get('max_marks', 100),
                        'min_passing_marks': subj.get('min_passing_marks', 33),
                        'section_ids': [],
                        'student_count': 0,
                    }
                self.exam_info[key]['section_ids'].append(section['id'])
                self.exam_info[key]['student_count'] += section.get('student_count', 40)

        self.exams_to_schedule = list(self.exam_info.keys())

        # Build class-to-sections mapping for conflict detection
        self.class_sections = defaultdict(list)
        for section in self.sections:
            self.class_sections[section['class_id']].append(section['id'])

        # Track which classes share students (same class = same students)
        # Different classes don't conflict unless they share sections
        self.class_conflicts = self._build_class_conflict_graph()

        self.max_iterations = 100000
        self.schedule = {}  # (class_id, subject_id) -> (date, session, hall_ids)

    def _build_class_conflict_graph(self):
        """
        Build a graph of which exams conflict (share students).
        Same class exams always conflict. Cross-class: no conflict by default.
        """
        conflicts = defaultdict(set)
        class_ids = set(k[0] for k in self.exams_to_schedule)

        for cid in class_ids:
            class_exams = [k for k in self.exams_to_schedule if k[0] == cid]
            for i, e1 in enumerate(class_exams):
                for e2 in class_exams[i + 1:]:
                    conflicts[e1].add(e2)
                    conflicts[e2].add(e1)

        return conflicts

    def generate(self):
        """
        Generate a feasible exam schedule using CSP backtracking with MRV.

        Returns:
            dict mapping (class_id, subject_id) -> {date, session, hall_ids}
            or None if no feasible schedule found.
        """
        self._report_progress(0, 'Starting CSP exam schedule generation...')

        # Sort exams by most constrained first (MRV heuristic)
        ordered = sorted(
            self.exams_to_schedule,
            key=lambda k: (-len(self.class_conflicts.get(k, set())),
                           -self.exam_info[k]['student_count'])
        )

        self.iterations = 0
        result = self._backtrack(ordered, 0, {})

        if result is not None:
            self._report_progress(100, f'Feasible schedule found after {self.iterations} iterations.')
            return result

        self._report_progress(100, 'No feasible schedule found.')
        return None

    def _backtrack(self, ordered_exams, idx, assignment):
        """Recursive backtracking with forward checking."""
        if idx == len(ordered_exams):
            return dict(assignment)

        self.iterations += 1
        if self.iterations > self.max_iterations:
            return None

        if self.iterations % 5000 == 0:
            pct = min(int((self.iterations / self.max_iterations) * 100), 99)
            self._report_progress(pct, f'CSP iteration {self.iterations}...')

        exam_key = ordered_exams[idx]
        exam = self.exam_info[exam_key]

        # Get valid slots for this exam
        valid_slots = self._get_valid_slots(exam_key, assignment)

        # Shuffle to add randomness for diversity
        random.shuffle(valid_slots)

        for slot_date, session in valid_slots:
            # Find available halls with enough capacity
            halls = self._find_halls(exam, slot_date, session, assignment)
            if halls is None:
                continue

            # Make assignment
            assignment[exam_key] = {
                'date': slot_date,
                'session': session,
                'hall_ids': halls,
            }

            result = self._backtrack(ordered_exams, idx + 1, assignment)
            if result is not None:
                return result

            # Undo
            del assignment[exam_key]

        return None

    def _get_valid_slots(self, exam_key, assignment):
        """Get all valid (date, session) pairs for an exam."""
        valid = []
        class_id = exam_key[0]

        for slot_date, session in self.exam_slots:
            if not self._check_hard_constraints(exam_key, slot_date, session, assignment):
                continue
            valid.append((slot_date, session))

        return valid

    def _check_hard_constraints(self, exam_key, slot_date, session, assignment):
        """Check all hard constraints for placing exam at (date, session)."""
        class_id, subject_id = exam_key

        # H1: No conflicting exam at same date+session
        for other_key, other_val in assignment.items():
            if other_val['date'] == slot_date and other_val['session'] == session:
                if other_key in self.class_conflicts.get(exam_key, set()):
                    return False

        # H4: Max exams per day for same class
        day_count = 0
        for other_key, other_val in assignment.items():
            if other_val['date'] == slot_date and other_key[0] == class_id:
                day_count += 1
        if day_count >= self.max_exams_per_day:
            return False

        # H5: Minimum gap between exams for same class
        if self.min_gap > 0:
            for other_key, other_val in assignment.items():
                if other_key[0] == class_id:
                    other_date = other_val['date']
                    gap = abs((slot_date - other_date).days)
                    if 0 < gap < self.min_gap:
                        return False

        return True

    def _find_halls(self, exam, slot_date, session, assignment):
        """
        Find halls to accommodate the exam at the given slot.
        Returns list of hall IDs or None if not enough capacity.
        """
        # Get halls already used at this slot
        used_halls = set()
        for other_key, other_val in assignment.items():
            if other_val['date'] == slot_date and other_val['session'] == session:
                for hid in other_val.get('hall_ids', []):
                    used_halls.add(hid)

        # Find available halls
        available = [h for h in self.halls if h['id'] not in used_halls]
        if not available:
            return None

        # Greedy: pick halls until we have enough capacity
        needed = exam['student_count']
        selected = []
        capacity_so_far = 0

        # Sort by capacity descending for efficiency
        available.sort(key=lambda h: -h['seating_capacity'])

        for hall in available:
            selected.append(hall['id'])
            capacity_so_far += hall['seating_capacity']
            if capacity_so_far >= needed:
                return selected

        # Not enough capacity
        return None

    def _report_progress(self, percent, message):
        if self.progress_callback:
            self.progress_callback(percent, message)
