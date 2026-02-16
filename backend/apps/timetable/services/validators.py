"""
Pre-generation validation for AI timetable generation.

Validates that all required inputs exist and are consistent
before attempting to generate a timetable.
"""

from collections import defaultdict
from apps.timetable.models import (
    TimeSlot, SubjectPeriodRequirement, TeacherAvailability,
    RoomAllocation, TimetableGenerationConfig,
)
from apps.academics.models import Class, Section, Subject, ClassSubject, AcademicYear


class ValidationError(Exception):
    """Raised when pre-generation validation fails."""
    def __init__(self, errors):
        self.errors = errors if isinstance(errors, list) else [errors]
        super().__init__('; '.join(self.errors))


def validate_generation_config(config):
    """
    Comprehensive pre-generation validation.
    Returns list of errors (empty = valid).
    """
    errors = []

    # 1. Academic year must exist and be current
    if not config.academic_year:
        errors.append('No academic year specified.')
        return errors

    # 2. Must have selected classes
    classes = config.classes.all()
    if not classes.exists():
        errors.append('No classes selected for generation.')
        return errors

    # 3. Must have working days
    if not config.working_days:
        errors.append('No working days configured.')
        return errors

    # 4. Validate time slots exist
    period_slots = TimeSlot.objects.filter(slot_type='PERIOD', is_active=True)
    if not period_slots.exists():
        errors.append('No active period time slots found. Create time slots first.')
        return errors

    num_periods = period_slots.count()
    num_days = len(config.working_days)

    # 5. Get sections for selected classes
    sections = _get_sections(config)
    if not sections:
        errors.append('No sections found for the selected classes.')
        return errors

    # 6. Validate subject requirements exist for each class
    req_errors = _validate_subject_requirements(
        config.academic_year, classes, sections, num_periods, num_days
    )
    errors.extend(req_errors)

    # 7. Validate teacher assignments
    teacher_errors = _validate_teacher_assignments(config.academic_year, classes)
    errors.extend(teacher_errors)

    # 8. Validate no obvious over-capacity
    capacity_errors = _validate_capacity(
        config.academic_year, classes, sections, num_periods, num_days
    )
    errors.extend(capacity_errors)

    return errors


def _get_sections(config):
    """Get sections for the generation config."""
    if config.sections.exists():
        return list(config.sections.all())

    sections = []
    for cls in config.classes.all():
        class_sections = Section.objects.filter(
            class_instance=cls,
            academic_year=config.academic_year,
        )
        sections.extend(class_sections)
    return sections


def _validate_subject_requirements(academic_year, classes, sections, num_periods, num_days):
    """Validate subject period requirements for all classes."""
    errors = []
    total_slots_per_week = num_periods * num_days

    for cls in classes:
        requirements = SubjectPeriodRequirement.objects.filter(
            academic_year=academic_year,
            class_obj=cls,
        )

        if not requirements.exists():
            errors.append(
                f'No subject period requirements defined for class {cls.name}. '
                f'Set up requirements before generating.'
            )
            continue

        total_periods_needed = sum(r.periods_per_week for r in requirements)

        if total_periods_needed > total_slots_per_week:
            errors.append(
                f'Class {cls.name} needs {total_periods_needed} periods/week '
                f'but only {total_slots_per_week} slots available '
                f'({num_periods} periods × {num_days} days).'
            )

        # Check for subjects needing more periods per day than available
        for req in requirements:
            if req.consecutive_periods > num_periods:
                errors.append(
                    f'{cls.name}/{req.subject.name}: consecutive_periods '
                    f'({req.consecutive_periods}) exceeds available periods ({num_periods}).'
                )

    return errors


def _validate_teacher_assignments(academic_year, classes):
    """Validate that each subject-class combo has an assigned teacher."""
    errors = []

    for cls in classes:
        requirements = SubjectPeriodRequirement.objects.filter(
            academic_year=academic_year,
            class_obj=cls,
        ).select_related('teacher', 'subject')

        for req in requirements:
            if not req.teacher:
                # Try to find teacher from ClassSubject
                class_subject = ClassSubject.objects.filter(
                    class_instance=cls,
                    subject=req.subject,
                    academic_year=academic_year,
                ).select_related('teacher').first()

                if not class_subject or not class_subject.teacher:
                    errors.append(
                        f'No teacher assigned for {cls.name}/{req.subject.name}. '
                        f'Assign a teacher in requirements or ClassSubject.'
                    )

    return errors


def _validate_capacity(academic_year, classes, sections, num_periods, num_days):
    """
    Check that teachers are not over-subscribed across all classes.
    A teacher cannot teach more periods than available.
    """
    errors = []
    teacher_load = defaultdict(int)
    teacher_names = {}

    for cls in classes:
        requirements = SubjectPeriodRequirement.objects.filter(
            academic_year=academic_year,
            class_obj=cls,
        ).select_related('teacher')

        # Count periods per teacher across all sections of this class
        class_sections = [s for s in sections if s.class_instance_id == cls.id]
        num_class_sections = len(class_sections) if class_sections else 1

        for req in requirements:
            if req.teacher:
                teacher_load[req.teacher_id] += req.periods_per_week * num_class_sections
                teacher_names[req.teacher_id] = req.teacher.get_full_name()

    total_slots = num_periods * num_days

    for tid, load in teacher_load.items():
        if load > total_slots:
            errors.append(
                f'Teacher {teacher_names.get(tid, tid)} has {load} periods/week '
                f'across all sections but only {total_slots} slots available. '
                f'Reduce assignments or add more teachers.'
            )

    return errors


def collect_generation_inputs(config):
    """
    Collect and structure all inputs needed for timetable generation.

    Returns a dict with:
        - slots: list of period slot dicts (ordered)
        - days: list of working day strings
        - sections: list of section dicts
        - requirements: dict of section_id -> list of requirement dicts
        - teachers: set of teacher IDs
        - teacher_availability: dict of (teacher_id, day) -> availability dict
        - rooms: list of room dicts
        - teacher_subject_map: dict of teacher_id -> set of subject_ids
    """
    from apps.staff.models import StaffMember

    academic_year = config.academic_year
    days = config.working_days

    # Time slots (periods only, ordered)
    period_slots = list(
        TimeSlot.objects.filter(
            slot_type='PERIOD', is_active=True
        ).order_by('order').values('id', 'name', 'start_time', 'end_time', 'slot_type', 'order')
    )

    # Sections
    sections_qs = _get_sections(config)
    sections = []
    for s in sections_qs:
        sections.append({
            'id': s.id,
            'class_id': s.class_instance_id,
            'class_name': s.class_instance.name if hasattr(s, 'class_instance') else '',
            'name': s.name,
            'max_students': getattr(s, 'max_students', 40),
        })

    # Requirements per class (shared across sections of the same class)
    requirements = {}
    all_teachers = set()
    teacher_subject_map = defaultdict(set)

    for section in sections:
        class_id = section['class_id']
        reqs = SubjectPeriodRequirement.objects.filter(
            academic_year=academic_year,
            class_obj_id=class_id,
        ).select_related('subject', 'teacher')

        section_reqs = []
        for req in reqs:
            teacher_id = req.teacher_id

            # Fallback to ClassSubject if no teacher on requirement
            if not teacher_id:
                cs = ClassSubject.objects.filter(
                    class_instance_id=class_id,
                    subject=req.subject,
                    academic_year=academic_year,
                ).first()
                if cs:
                    teacher_id = cs.teacher_id

            if teacher_id:
                all_teachers.add(teacher_id)
                teacher_subject_map[teacher_id].add(req.subject_id)

            section_reqs.append({
                'subject_id': req.subject_id,
                'subject_name': req.subject.name,
                'teacher_id': teacher_id,
                'periods_per_week': req.periods_per_week,
                'requires_lab': req.requires_lab,
                'preferred_room_type': req.preferred_room_type,
                'consecutive_periods': req.consecutive_periods,
                'preferred_time_slots': req.preferred_time_slots or [],
            })

        requirements[section['id']] = section_reqs

    # Teacher availability
    teacher_availability = {}
    avail_qs = TeacherAvailability.objects.filter(
        academic_year=academic_year,
        teacher_id__in=all_teachers,
    )
    for avail in avail_qs:
        teacher_availability[(avail.teacher_id, avail.day_of_week)] = {
            'is_available': avail.is_available,
            'available_from': avail.available_from,
            'available_until': avail.available_until,
            'max_periods_per_day': avail.max_periods_per_day,
            'max_consecutive_periods': avail.max_consecutive_periods,
            'preferred_time_slots': avail.preferred_time_slots or [],
        }

    # Rooms
    rooms = list(
        RoomAllocation.objects.filter(
            is_available=True
        ).values('id', 'room_number', 'room_name', 'room_type', 'capacity')
    )

    return {
        'slots': period_slots,
        'days': days,
        'sections': sections,
        'requirements': requirements,
        'teachers': all_teachers,
        'teacher_availability': teacher_availability,
        'rooms': rooms,
        'teacher_subject_map': dict(teacher_subject_map),
    }
