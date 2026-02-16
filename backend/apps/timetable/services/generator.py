"""
CSP Backtracking Solver for timetable generation.

Uses Constraint Satisfaction with backtracking and forward checking
to generate a feasible timetable that satisfies all hard constraints.

Algorithm:
1. Build assignment list: (section, subject, teacher, periods_needed)
2. Sort by Most Constrained Variable (MRV) heuristic
3. Backtrack with constraint propagation to fill slots
"""

import random
from copy import deepcopy
from collections import defaultdict

from .constraints import check_all_hard_constraints


class TimetableGenerator:
    """
    CSP-based timetable generator using backtracking with forward checking.
    """

    def __init__(self, inputs, progress_callback=None):
        """
        Args:
            inputs: dict from collect_generation_inputs()
            progress_callback: callable(percent, message) for progress updates
        """
        self.slots = inputs['slots']
        self.days = inputs['days']
        self.sections = inputs['sections']
        self.requirements = inputs['requirements']
        self.teachers = inputs['teachers']
        self.teacher_availability = inputs['teacher_availability']
        self.rooms = inputs['rooms']
        self.teacher_subject_map = inputs['teacher_subject_map']
        self.progress_callback = progress_callback

        self.num_slots = len(self.slots)
        self.num_days = len(self.days)

        # Build slot info lookup (indexed by position)
        self.slot_info = {}
        for idx, slot in enumerate(self.slots):
            self.slot_info[idx] = slot

        # Build room type lookup
        self.rooms_by_type = defaultdict(list)
        for room in self.rooms:
            self.rooms_by_type[room['room_type']].append(room)
            self.rooms_by_type['ANY'].append(room)

        # Track iterations for progress
        self._iterations = 0
        self._max_iterations = 100000

    def generate(self):
        """
        Generate a feasible timetable.

        Returns:
            dict: timetable mapping (section_id, day, slot_idx) -> assignment dict
                  or None if no feasible solution found.
        """
        # Build the assignment list
        assignments = self._build_assignments()

        if not assignments:
            return None

        # Sort by most constrained first (MRV heuristic)
        assignments = self._sort_by_mrv(assignments)

        # Initialize empty timetable
        timetable = {}

        # Track teacher period counts per day for constraint checking
        self._teacher_day_counts = defaultdict(lambda: defaultdict(int))

        # Start backtracking
        result = self._backtrack(timetable, assignments, 0)

        if result is not None:
            self._report_progress(100, 'Feasible timetable found')

        return result

    def _build_assignments(self):
        """
        Build the list of assignments that need to be placed.
        Each assignment: {section_id, subject_id, teacher_id, requires_lab,
                          preferred_room_type, consecutive_periods, count}

        'count' is the number of individual period-blocks to place.
        For consecutive_periods=2 and periods_per_week=4, count=2 (two double-periods).
        """
        assignments = []

        for section in self.sections:
            sid = section['id']
            reqs = self.requirements.get(sid, [])

            for req in reqs:
                consec = req['consecutive_periods']
                total = req['periods_per_week']

                # Number of placement blocks
                num_blocks = total // consec
                remainder = total % consec

                for _ in range(num_blocks):
                    assignments.append({
                        'section_id': sid,
                        'subject_id': req['subject_id'],
                        'subject_name': req['subject_name'],
                        'teacher_id': req['teacher_id'],
                        'requires_lab': req['requires_lab'],
                        'preferred_room_type': req['preferred_room_type'],
                        'consecutive_periods': consec,
                    })

                # Handle remainder as single periods
                for _ in range(remainder):
                    assignments.append({
                        'section_id': sid,
                        'subject_id': req['subject_id'],
                        'subject_name': req['subject_name'],
                        'teacher_id': req['teacher_id'],
                        'requires_lab': req['requires_lab'],
                        'preferred_room_type': req['preferred_room_type'],
                        'consecutive_periods': 1,
                    })

        return assignments

    def _sort_by_mrv(self, assignments):
        """
        Sort assignments by Most Restrictive Variable first:
        - Lab requirements (fewer rooms)
        - Consecutive period blocks (harder to place)
        - Teacher with less availability
        """
        def mrv_score(a):
            score = 0
            if a['requires_lab']:
                score += 100
            score += a['consecutive_periods'] * 50

            # Count teacher availability
            tid = a['teacher_id']
            if tid:
                available_slots = 0
                for day in self.days:
                    avail = self.teacher_availability.get((tid, day))
                    if avail is None or avail['is_available']:
                        available_slots += self.num_slots
                    # Reduce score if teacher has limited periods
                    if avail:
                        available_slots = min(
                            available_slots,
                            avail.get('max_periods_per_day', self.num_slots) * self.num_days
                        )
                # Fewer available slots = more constrained = higher priority
                score += max(0, 100 - available_slots)

            return -score  # Negative for descending sort

        return sorted(assignments, key=mrv_score)

    def _backtrack(self, timetable, assignments, idx):
        """
        Recursive backtracking with forward checking.
        """
        if idx >= len(assignments):
            return timetable  # All assigned successfully

        self._iterations += 1
        if self._iterations > self._max_iterations:
            return None  # Give up after max iterations

        # Progress reporting
        if self._iterations % 500 == 0:
            pct = min(95, int((idx / max(len(assignments), 1)) * 100))
            self._report_progress(pct, f'Placing assignment {idx+1}/{len(assignments)}')

        assignment = assignments[idx]
        section_id = assignment['section_id']
        teacher_id = assignment['teacher_id']
        consec = assignment['consecutive_periods']
        requires_lab = assignment['requires_lab']
        preferred_room_type = assignment['preferred_room_type']

        # Get valid placements for this assignment
        placements = self._get_valid_placements(
            timetable, section_id, teacher_id, consec,
            requires_lab, preferred_room_type
        )

        # Shuffle to add randomness (helps avoid getting stuck)
        random.shuffle(placements)

        for day, start_slot in placements:
            # Check teacher daily limit
            if teacher_id and not self._check_teacher_daily_limit(teacher_id, day, consec):
                continue

            # Place the assignment
            placed_keys = []
            room_id = self._find_room(timetable, day, start_slot, consec,
                                       requires_lab, preferred_room_type)

            for offset in range(consec):
                slot_idx = start_slot + offset
                key = (section_id, day, slot_idx)
                timetable[key] = {
                    'subject_id': assignment['subject_id'],
                    'subject_name': assignment['subject_name'],
                    'teacher_id': teacher_id,
                    'room_id': room_id,
                    'requires_lab': requires_lab,
                }
                placed_keys.append(key)

                if teacher_id:
                    self._teacher_day_counts[teacher_id][day] += 1

            # Recurse
            result = self._backtrack(timetable, assignments, idx + 1)
            if result is not None:
                return result

            # Backtrack: undo placement
            for key in placed_keys:
                del timetable[key]

            if teacher_id:
                self._teacher_day_counts[teacher_id][day] -= consec

        return None  # No valid placement found

    def _get_valid_placements(self, timetable, section_id, teacher_id,
                               consecutive, requires_lab, preferred_room_type):
        """
        Get all valid (day, start_slot) pairs for an assignment.
        """
        placements = []

        for day in self.days:
            # Check teacher available on this day
            avail = self.teacher_availability.get((teacher_id, day)) if teacher_id else None
            if avail and not avail['is_available']:
                continue

            for start_slot in range(self.num_slots - consecutive + 1):
                valid = True

                for offset in range(consecutive):
                    slot_idx = start_slot + offset
                    slot_info = self.slot_info.get(slot_idx, {})

                    is_valid, _ = check_all_hard_constraints(
                        timetable, section_id, day, slot_idx, teacher_id,
                        None,  # room_id checked separately
                        False,  # lab checked separately
                        self.teacher_availability, slot_info
                    )

                    if not is_valid:
                        valid = False
                        break

                if valid:
                    placements.append((day, start_slot))

        return placements

    def _check_teacher_daily_limit(self, teacher_id, day, additional):
        """Check if adding more periods would exceed teacher's daily limit."""
        avail = self.teacher_availability.get((teacher_id, day))
        max_per_day = avail['max_periods_per_day'] if avail else 6
        current = self._teacher_day_counts[teacher_id][day]
        return (current + additional) <= max_per_day

    def _find_room(self, timetable, day, start_slot, consecutive,
                    requires_lab, preferred_room_type):
        """
        Find an available room for the given slot range.
        Returns room_id or None.
        """
        if not requires_lab and not preferred_room_type:
            return None  # Regular classroom, no specific room needed

        # Determine which rooms to consider
        if preferred_room_type:
            candidate_rooms = self.rooms_by_type.get(preferred_room_type, [])
        elif requires_lab:
            candidate_rooms = (
                self.rooms_by_type.get('LAB', []) +
                self.rooms_by_type.get('SCIENCE_LAB', []) +
                self.rooms_by_type.get('COMPUTER_LAB', [])
            )
        else:
            candidate_rooms = self.rooms_by_type.get('ANY', [])

        for room in candidate_rooms:
            room_id = room['id']
            available = True

            for offset in range(consecutive):
                slot_idx = start_slot + offset
                # Check if room is already used at this time
                for key, assignment in timetable.items():
                    if assignment is None:
                        continue
                    k_section, k_day, k_slot = key
                    if k_day == day and k_slot == slot_idx and assignment.get('room_id') == room_id:
                        available = False
                        break
                if not available:
                    break

            if available:
                return room_id

        return None

    def _report_progress(self, percent, message):
        """Report progress if callback is available."""
        if self.progress_callback:
            self.progress_callback(percent, message)
