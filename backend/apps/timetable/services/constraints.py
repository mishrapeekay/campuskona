"""
Constraint definitions for AI timetable generation.

Hard constraints MUST be satisfied for a valid timetable.
Soft constraints are optimized by the genetic algorithm.
"""

from collections import defaultdict


# ============================================================================
# HARD CONSTRAINTS — Must all pass for a valid timetable
# ============================================================================

def check_teacher_no_double_booking(timetable, day, slot_idx, teacher_id):
    """
    H1: No teacher teaches two classes at the same time slot.

    Args:
        timetable: dict keyed by (section_id, day, slot_idx) -> assignment
        day: day string (e.g. 'MONDAY')
        slot_idx: integer slot index
        teacher_id: teacher to check

    Returns:
        True if no conflict, False if teacher is already booked.
    """
    if teacher_id is None:
        return True

    for key, assignment in timetable.items():
        if assignment is None:
            continue
        k_section, k_day, k_slot = key
        if k_day == day and k_slot == slot_idx and assignment.get('teacher_id') == teacher_id:
            return False
    return True


def check_section_no_double_booking(timetable, section_id, day, slot_idx):
    """
    H2: No class section has two subjects in the same time slot.
    """
    key = (section_id, day, slot_idx)
    return key not in timetable or timetable[key] is None


def check_lab_room_available(timetable, day, slot_idx, room_id, requires_lab):
    """
    H4: Lab subjects must be assigned to lab rooms.
    If requires_lab is True and room_id is None, this fails.
    Also ensures room is not double-booked.
    """
    if not requires_lab:
        return True

    if room_id is None:
        return False

    # Check room not already used at this time
    for key, assignment in timetable.items():
        if assignment is None:
            continue
        k_section, k_day, k_slot = key
        if k_day == day and k_slot == slot_idx and assignment.get('room_id') == room_id:
            return False
    return True


def check_teacher_available(teacher_availability_map, teacher_id, day, slot_time):
    """
    H5: Teachers are only assigned when they are available.

    Args:
        teacher_availability_map: dict of (teacher_id, day) -> availability info
        teacher_id: teacher to check
        day: day string
        slot_time: (start_time, end_time) tuple

    Returns:
        True if teacher is available.
    """
    if teacher_id is None:
        return True

    avail = teacher_availability_map.get((teacher_id, day))
    if avail is None:
        # No availability record = assume available
        return True

    if not avail['is_available']:
        return False

    # Check partial day availability
    if avail.get('available_from') and avail.get('available_until'):
        start, end = slot_time
        if start < avail['available_from'] or end > avail['available_until']:
            return False

    return True


def check_slot_is_period(slot_info):
    """
    H6: Break/lunch slots cannot have teaching assignments.
    """
    return slot_info.get('slot_type') == 'PERIOD'


def check_all_hard_constraints(
    timetable, section_id, day, slot_idx, teacher_id,
    room_id, requires_lab, teacher_availability_map, slot_info
):
    """
    Check all hard constraints for a proposed assignment.
    Returns (is_valid, violation_reason).
    """
    if not check_slot_is_period(slot_info):
        return False, 'Slot is not a period type'

    if not check_section_no_double_booking(timetable, section_id, day, slot_idx):
        return False, 'Section already has assignment at this slot'

    if not check_teacher_no_double_booking(timetable, day, slot_idx, teacher_id):
        return False, 'Teacher already teaching at this slot'

    slot_time = (slot_info.get('start_time'), slot_info.get('end_time'))
    if not check_teacher_available(teacher_availability_map, teacher_id, day, slot_time):
        return False, 'Teacher not available at this time'

    if not check_lab_room_available(timetable, day, slot_idx, room_id, requires_lab):
        return False, 'Lab room not available'

    return True, None


# ============================================================================
# SOFT CONSTRAINTS — Scored by fitness function
# ============================================================================

def calc_workload_variance(timetable, all_teachers, days):
    """
    S1: Teacher workload balance — variance of periods per day.
    Lower variance = better balance = lower penalty.
    """
    teacher_daily = defaultdict(lambda: defaultdict(int))

    for (section_id, day, slot_idx), assignment in timetable.items():
        if assignment is None:
            continue
        tid = assignment.get('teacher_id')
        if tid:
            teacher_daily[tid][day] += 1

    total_variance = 0.0
    teacher_count = 0

    for tid in all_teachers:
        counts = [teacher_daily[tid].get(d, 0) for d in days]
        if not counts:
            continue
        mean = sum(counts) / len(counts)
        variance = sum((c - mean) ** 2 for c in counts) / len(counts)
        total_variance += variance
        teacher_count += 1

    if teacher_count == 0:
        return 0.0

    # Normalize: average variance across teachers, scaled to 0-10
    avg_variance = total_variance / teacher_count
    return min(avg_variance * 2.0, 10.0)


def calc_heavy_subject_adjacency(timetable, heavy_subject_ids, sections, days, num_slots):
    """
    S2: Penalty for consecutive heavy subjects (e.g. Math → Physics → Chemistry).
    """
    penalty = 0

    for section_id in sections:
        for day in days:
            prev_heavy = False
            for slot_idx in range(num_slots):
                assignment = timetable.get((section_id, day, slot_idx))
                if assignment is None:
                    prev_heavy = False
                    continue

                is_heavy = assignment.get('subject_id') in heavy_subject_ids
                if is_heavy and prev_heavy:
                    penalty += 1
                prev_heavy = is_heavy

    return min(penalty * 1.5, 10.0)


def calc_subject_clustering(timetable, sections, days, num_slots):
    """
    S3: Penalty for clustering all periods of a subject on one day.
    Each subject's periods should be spread across the week.
    """
    penalty = 0.0

    for section_id in sections:
        subject_day_counts = defaultdict(lambda: defaultdict(int))
        subject_totals = defaultdict(int)

        for day in days:
            for slot_idx in range(num_slots):
                assignment = timetable.get((section_id, day, slot_idx))
                if assignment is None:
                    continue
                sid = assignment.get('subject_id')
                if sid:
                    subject_day_counts[sid][day] += 1
                    subject_totals[sid] += 1

        for sid, total in subject_totals.items():
            if total <= 1:
                continue
            day_counts = list(subject_day_counts[sid].values())
            # Ideal: total / num_days per day. Penalty for deviation.
            ideal_per_day = total / len(days)
            for c in day_counts:
                penalty += (c - ideal_per_day) ** 2

    return min(penalty * 0.3, 10.0)


def calc_teacher_preference_violations(timetable, teacher_availability_map, days):
    """
    S4: Penalty for not respecting teacher time preferences.
    """
    violations = 0

    for (section_id, day, slot_idx), assignment in timetable.items():
        if assignment is None:
            continue
        tid = assignment.get('teacher_id')
        if not tid:
            continue

        avail = teacher_availability_map.get((tid, day))
        if avail and avail.get('preferred_time_slots'):
            if slot_idx not in avail['preferred_time_slots']:
                violations += 1

    return min(violations * 0.5, 10.0)


def calc_room_changes(timetable, sections, days, num_slots):
    """
    S5: Penalty for room changes within a day for a section.
    """
    changes = 0

    for section_id in sections:
        for day in days:
            prev_room = None
            for slot_idx in range(num_slots):
                assignment = timetable.get((section_id, day, slot_idx))
                if assignment is None:
                    prev_room = None
                    continue
                room = assignment.get('room_id')
                if room and prev_room and room != prev_room:
                    changes += 1
                prev_room = room

    return min(changes * 0.5, 10.0)


def calc_consecutive_teacher_periods(timetable, all_teachers, days, num_slots,
                                     teacher_availability_map):
    """
    S7: Penalty for exceeding max consecutive periods per teacher.
    """
    penalty = 0

    for tid in all_teachers:
        for day in days:
            avail = teacher_availability_map.get((tid, day))
            max_consecutive = 3
            if avail:
                max_consecutive = avail.get('max_consecutive_periods', 3)

            consecutive = 0
            for slot_idx in range(num_slots):
                teaching = False
                for key, assignment in timetable.items():
                    if assignment is None:
                        continue
                    k_section, k_day, k_slot = key
                    if k_day == day and k_slot == slot_idx and assignment.get('teacher_id') == tid:
                        teaching = True
                        break

                if teaching:
                    consecutive += 1
                    if consecutive > max_consecutive:
                        penalty += 1
                else:
                    consecutive = 0

    return min(penalty * 1.0, 10.0)
