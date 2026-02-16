"""
Apply, rollback, and analysis utilities for generated timetables.

- apply_generated_timetable: Write generated data into ClassTimetable + TeacherTimetable
- rollback_generated_timetable: Restore from snapshot
- analyze_generated_timetable: Generate conflict/utilization reports
"""

from collections import defaultdict
from django.db import transaction
from django.utils import timezone

from apps.timetable.models import (
    ClassTimetable, TeacherTimetable, TimeSlot, TimetableGenerationRun,
)
from apps.academics.models import Section


def apply_generated_timetable(run):
    """
    Apply a completed generation run to ClassTimetable and TeacherTimetable.

    1. Snapshot current timetable for rollback
    2. Delete existing entries for the affected sections/academic year
    3. Create new entries from generated_timetable

    Args:
        run: TimetableGenerationRun instance (status=COMPLETED)

    Returns:
        dict with result summary
    """
    config = run.config
    academic_year = config.academic_year
    generated = run.generated_timetable

    if not generated or 'sections' not in generated:
        raise ValueError('No generated timetable data to apply.')

    sections_data = generated['sections']

    # Get all period time slots (ordered)
    period_slots = list(
        TimeSlot.objects.filter(
            slot_type='PERIOD', is_active=True
        ).order_by('order')
    )
    slot_by_index = {idx: slot for idx, slot in enumerate(period_slots)}

    with transaction.atomic():
        # Step 1: Snapshot existing timetable for rollback
        snapshot = _create_snapshot(academic_year, sections_data.keys())
        run.rollback_snapshot = snapshot

        # Step 2: Delete existing entries for affected sections
        section_ids = []
        for section_key in sections_data.keys():
            # Try to resolve the section
            try:
                section = Section.objects.get(id=section_key)
                section_ids.append(section.id)
            except (Section.DoesNotExist, ValueError):
                continue

        deleted_class = ClassTimetable.objects.filter(
            academic_year=academic_year,
            section_id__in=section_ids,
            is_active=True,
        ).delete()

        deleted_teacher = TeacherTimetable.objects.filter(
            academic_year=academic_year,
            section_id__in=section_ids,
            is_active=True,
        ).delete()

        # Step 3: Create new entries
        class_entries_created = 0
        teacher_entries_created = 0

        for section_key, section_data in sections_data.items():
            try:
                section = Section.objects.select_related('class_instance').get(id=section_key)
            except (Section.DoesNotExist, ValueError):
                continue

            class_obj = section.class_instance
            days_data = section_data.get('days', {})

            for day, slots in days_data.items():
                for slot_entry in slots:
                    subject_id = slot_entry.get('subject_id')
                    teacher_id = slot_entry.get('teacher_id')
                    slot_idx = slot_entry.get('slot_index', 0)
                    room_id = slot_entry.get('room_id')

                    if not subject_id:
                        continue  # Skip empty slots

                    time_slot = slot_by_index.get(slot_idx)
                    if not time_slot:
                        continue

                    # Determine room_number from room_id
                    room_number = ''
                    if room_id:
                        from apps.timetable.models import RoomAllocation
                        try:
                            room = RoomAllocation.objects.get(id=room_id)
                            room_number = room.room_number
                        except RoomAllocation.DoesNotExist:
                            pass

                    # Create ClassTimetable entry
                    ClassTimetable.objects.create(
                        academic_year=academic_year,
                        class_obj=class_obj,
                        section=section,
                        day_of_week=day,
                        time_slot=time_slot,
                        subject_id=subject_id,
                        teacher_id=teacher_id,
                        room_number=room_number,
                        is_active=True,
                    )
                    class_entries_created += 1

                    # Create TeacherTimetable entry (denormalized)
                    if teacher_id:
                        TeacherTimetable.objects.create(
                            academic_year=academic_year,
                            teacher_id=teacher_id,
                            day_of_week=day,
                            time_slot=time_slot,
                            class_obj=class_obj,
                            section=section,
                            subject_id=subject_id,
                            room_number=room_number,
                            is_active=True,
                        )
                        teacher_entries_created += 1

        # Step 4: Update run status
        run.status = 'APPLIED'
        run.save(update_fields=['status', 'rollback_snapshot'])

    return {
        'message': 'Timetable applied successfully.',
        'class_entries_created': class_entries_created,
        'teacher_entries_created': teacher_entries_created,
        'sections_affected': len(section_ids),
    }


def rollback_generated_timetable(run):
    """
    Rollback to the timetable state before a generation run was applied.

    Args:
        run: TimetableGenerationRun instance (status=APPLIED)

    Returns:
        dict with rollback summary
    """
    config = run.config
    academic_year = config.academic_year
    snapshot = run.rollback_snapshot

    if not snapshot or 'entries' not in snapshot:
        raise ValueError('No rollback snapshot available.')

    with transaction.atomic():
        # Delete current entries for affected sections
        section_ids = snapshot.get('section_ids', [])

        ClassTimetable.objects.filter(
            academic_year=academic_year,
            section_id__in=section_ids,
            is_active=True,
        ).delete()

        TeacherTimetable.objects.filter(
            academic_year=academic_year,
            section_id__in=section_ids,
            is_active=True,
        ).delete()

        # Restore from snapshot
        restored_class = 0
        restored_teacher = 0

        for entry in snapshot.get('entries', []):
            time_slot = TimeSlot.objects.filter(id=entry['time_slot_id']).first()
            if not time_slot:
                continue

            ClassTimetable.objects.create(
                academic_year_id=entry['academic_year_id'],
                class_obj_id=entry['class_obj_id'],
                section_id=entry['section_id'],
                day_of_week=entry['day_of_week'],
                time_slot=time_slot,
                subject_id=entry.get('subject_id'),
                teacher_id=entry.get('teacher_id'),
                room_number=entry.get('room_number', ''),
                is_active=True,
            )
            restored_class += 1

            if entry.get('teacher_id'):
                TeacherTimetable.objects.create(
                    academic_year_id=entry['academic_year_id'],
                    teacher_id=entry['teacher_id'],
                    day_of_week=entry['day_of_week'],
                    time_slot=time_slot,
                    class_obj_id=entry['class_obj_id'],
                    section_id=entry['section_id'],
                    subject_id=entry.get('subject_id'),
                    room_number=entry.get('room_number', ''),
                    is_active=True,
                )
                restored_teacher += 1

        # Update run status
        run.status = 'ROLLED_BACK'
        run.save(update_fields=['status'])

    return {
        'message': 'Timetable rolled back successfully.',
        'class_entries_restored': restored_class,
        'teacher_entries_restored': restored_teacher,
    }


def analyze_generated_timetable(run):
    """
    Generate analysis report for a completed generation run.

    Returns:
        dict with analysis data including:
        - teacher_utilization: periods per teacher per day
        - room_utilization: periods per room per day
        - subject_distribution: how subjects are spread
        - potential_issues: list of observations
    """
    generated = run.generated_timetable
    if not generated or 'sections' not in generated:
        return {'error': 'No generated timetable data.'}

    sections_data = generated['sections']
    config = run.config
    days = config.working_days

    teacher_periods = defaultdict(lambda: defaultdict(int))
    teacher_total = defaultdict(int)
    room_periods = defaultdict(lambda: defaultdict(int))
    subject_per_section = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    issues = []

    for section_key, section_data in sections_data.items():
        class_name = section_data.get('class_name', '')
        section_name = section_data.get('section_name', '')
        label = f"{class_name} {section_name}"

        for day, slots in section_data.get('days', {}).items():
            for slot in slots:
                tid = slot.get('teacher_id')
                rid = slot.get('room_id')
                sid = slot.get('subject_id')

                if tid:
                    teacher_periods[tid][day] += 1
                    teacher_total[tid] += 1
                if rid:
                    room_periods[rid][day] += 1
                if sid:
                    subject_per_section[section_key][sid][day] += 1

    # Teacher utilization summary
    teacher_utilization = {}
    for tid, day_counts in teacher_periods.items():
        teacher_utilization[str(tid)] = {
            'daily': dict(day_counts),
            'total': teacher_total[tid],
            'avg_per_day': round(teacher_total[tid] / max(len(days), 1), 1),
        }

    # Check for unbalanced teacher loads
    for tid, total in teacher_total.items():
        day_vals = list(teacher_periods[tid].values())
        if day_vals:
            max_day = max(day_vals)
            min_day = min(day_vals) if len(day_vals) == len(days) else 0
            if max_day - min_day > 3:
                issues.append(
                    f'Teacher {tid}: uneven load ({min_day}-{max_day} periods/day).'
                )

    # Room utilization summary
    room_utilization = {}
    for rid, day_counts in room_periods.items():
        room_utilization[str(rid)] = dict(day_counts)

    # Subject distribution check
    subject_distribution = {}
    for section_key, subjects in subject_per_section.items():
        section_dist = {}
        for sid, day_counts in subjects.items():
            section_dist[str(sid)] = dict(day_counts)
            # Check clustering
            vals = list(day_counts.values())
            if max(vals) > 2 and sum(vals) > 3:
                section_data = sections_data.get(section_key, {})
                label = f"{section_data.get('class_name', '')} {section_data.get('section_name', '')}"
                issues.append(
                    f'{label}: Subject {sid} has {max(vals)} periods on one day.'
                )
        subject_distribution[section_key] = section_dist

    return {
        'fitness_score': run.fitness_score,
        'teacher_utilization': teacher_utilization,
        'room_utilization': room_utilization,
        'subject_distribution': subject_distribution,
        'potential_issues': issues,
        'summary': {
            'total_teachers': len(teacher_total),
            'total_sections': len(sections_data),
            'working_days': len(days),
        }
    }


def _create_snapshot(academic_year, section_keys):
    """
    Create a snapshot of existing timetable entries for rollback.
    """
    section_ids = list(section_keys)
    entries = ClassTimetable.objects.filter(
        academic_year=academic_year,
        section_id__in=section_ids,
        is_active=True,
    ).values(
        'academic_year_id', 'class_obj_id', 'section_id',
        'day_of_week', 'time_slot_id', 'subject_id',
        'teacher_id', 'room_number',
    )

    # Convert to serializable format
    snapshot_entries = []
    for e in entries:
        entry = dict(e)
        # Convert UUIDs/IDs to strings for JSON serialization
        for key in entry:
            if entry[key] is not None and hasattr(entry[key], 'hex'):
                entry[key] = str(entry[key])
        snapshot_entries.append(entry)

    return {
        'section_ids': [str(sid) for sid in section_ids],
        'entries': snapshot_entries,
        'created_at': timezone.now().isoformat(),
    }
