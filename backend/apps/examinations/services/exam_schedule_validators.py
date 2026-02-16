"""
Pre-generation validation and input collection for AI exam scheduling.
"""

from datetime import timedelta
from collections import defaultdict

from apps.academics.models import Section, ClassSubject


def validate_exam_schedule_config(config):
    """
    Validate the exam schedule generation configuration.
    Returns list of errors (empty = valid).
    """
    errors = []

    # 1. Examination must exist
    if not config.examination:
        errors.append('No examination specified.')
        return errors

    # 2. Must have classes selected
    classes = config.classes.all()
    if not classes.exists():
        errors.append('No classes selected for scheduling.')
        return errors

    # 3. Must have exam halls
    halls = config.exam_halls.all()
    if not halls.exists():
        errors.append('No exam halls selected. Add at least one exam hall.')
        return errors

    # 4. Date range must be valid
    if not config.start_date or not config.end_date:
        errors.append('Start and end dates are required.')
        return errors

    if config.start_date > config.end_date:
        errors.append('Start date must be before end date.')
        return errors

    # 5. Must have exam days
    if not config.exam_days:
        errors.append('No exam days configured.')
        return errors

    # 6. Calculate available exam slots
    exam_slots = _calculate_exam_slots(config)
    if not exam_slots:
        errors.append(
            'No valid exam slots available in the given date range and days.'
        )
        return errors

    # 7. Get sections
    sections = _get_sections(config)
    if not sections:
        errors.append('No sections found for the selected classes.')
        return errors

    # 8. Check subjects exist for each class
    academic_year = config.examination.academic_year
    subjects_per_class = {}
    for cls in classes:
        class_subjects = ClassSubject.objects.filter(
            class_instance=cls,
            academic_year=academic_year,
        ).select_related('subject')

        if not class_subjects.exists():
            errors.append(
                f'No subjects assigned to class {cls.name} for the current academic year.'
            )
            continue

        subjects_per_class[cls.id] = class_subjects

    # 9. Check if enough slots for all exams
    total_exams = sum(qs.count() for qs in subjects_per_class.values())
    sessions_per_day = 1
    if config.afternoon_start and config.afternoon_end:
        sessions_per_day = 2

    total_slots = len(exam_slots)

    if total_exams > total_slots:
        errors.append(
            f'Need {total_exams} exam slots but only {total_slots} available '
            f'({len(set(d for d, s in exam_slots))} days x {sessions_per_day} session(s)). '
            f'Extend the date range or add more exam days.'
        )

    # 10. Check hall capacity
    total_hall_capacity = sum(h.seating_capacity for h in halls)
    max_students_per_exam = 0
    for section in sections:
        count = getattr(section, 'max_students', 40)
        max_students_per_exam = max(max_students_per_exam, count)

    if total_hall_capacity < max_students_per_exam:
        errors.append(
            f'Total hall capacity ({total_hall_capacity}) is less than '
            f'the largest section size (~{max_students_per_exam}). '
            f'Add more exam halls.'
        )

    return errors


def collect_exam_inputs(config):
    """
    Collect all inputs needed for exam schedule generation.

    Returns dict with:
        - exam_slots: list of (date, session) tuples
        - subjects: dict of class_id -> list of subject dicts
        - halls: list of hall dicts
        - sections: list of section dicts
        - min_gap: int
        - max_exams_per_day: int
        - heavy_subject_ids: set
    """
    examination = config.examination
    academic_year = examination.academic_year

    # Exam slots
    exam_slots = _calculate_exam_slots(config)

    # Sections
    sections_qs = _get_sections(config)
    sections = []
    for s in sections_qs:
        sections.append({
            'id': s.id,
            'class_id': s.class_instance_id,
            'class_name': s.class_instance.name if hasattr(s, 'class_instance') else '',
            'name': s.name,
            'student_count': getattr(s, 'max_students', 40),
        })

    # Subjects per class
    subjects = {}
    for cls in config.classes.all():
        class_subjects = ClassSubject.objects.filter(
            class_instance=cls,
            academic_year=academic_year,
        ).select_related('subject')

        subj_list = []
        for cs in class_subjects:
            subj_list.append({
                'subject_id': cs.subject_id,
                'subject_name': cs.subject.name,
                'duration_minutes': 180,  # default exam duration
                'max_marks': 100,
                'min_passing_marks': 33,
            })
        subjects[cls.id] = subj_list

    # Halls
    halls = list(
        config.exam_halls.filter(is_available=True).values(
            'id', 'name', 'code', 'seating_capacity', 'building', 'floor',
            'has_cctv', 'has_ac', 'is_accessible'
        )
    )

    # Heavy subjects
    heavy_ids = set(config.heavy_subjects.values_list('id', flat=True))

    return {
        'exam_slots': exam_slots,
        'subjects': subjects,
        'halls': halls,
        'sections': sections,
        'min_gap': config.min_gap_between_exams,
        'max_exams_per_day': config.max_exams_per_day,
        'heavy_subject_ids': heavy_ids,
        'examination': {
            'id': examination.id,
            'name': examination.name,
            'academic_year_id': academic_year.id,
            'academic_year_name': academic_year.name,
            'grade_scale_id': examination.grade_scale_id,
        },
    }


def _calculate_exam_slots(config):
    """
    Calculate all available (date, session) tuples within the config range.
    """
    DAY_MAP = {
        'MONDAY': 0, 'TUESDAY': 1, 'WEDNESDAY': 2,
        'THURSDAY': 3, 'FRIDAY': 4, 'SATURDAY': 5, 'SUNDAY': 6,
    }

    allowed_days = set(DAY_MAP.get(d, -1) for d in config.exam_days)
    slots = []

    current = config.start_date
    while current <= config.end_date:
        if current.weekday() in allowed_days:
            slots.append((current, 'MORNING'))
            if config.afternoon_start and config.afternoon_end:
                slots.append((current, 'AFTERNOON'))
        current += timedelta(days=1)

    return slots


def _get_sections(config):
    """Get sections for the config."""
    if config.sections.exists():
        return list(config.sections.select_related('class_instance').all())

    sections = []
    for cls in config.classes.all():
        qs = Section.objects.filter(
            class_instance=cls,
            academic_year=config.examination.academic_year,
        ).select_related('class_instance')
        sections.extend(qs)
    return sections
