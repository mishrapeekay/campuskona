"""
Timetable models for managing school schedules
"""

import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import datetime, time, timedelta
from apps.core.models import BaseModel


class TimeSlot(BaseModel):
    """
    Time slots for timetable periods
    """
    SLOT_TYPE_CHOICES = [
        ('PERIOD', 'Period'),
        ('BREAK', 'Break'),
        ('LUNCH', 'Lunch Break'),
        ('ASSEMBLY', 'Assembly'),
        ('ACTIVITY', 'Activity'),
    ]

    name = models.CharField(max_length=100, help_text='e.g., Period 1, Morning Break')
    slot_type = models.CharField(max_length=20, choices=SLOT_TYPE_CHOICES, default='PERIOD')
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(180)],
        help_text='Duration in minutes (auto-calculated)'
    )
    order = models.IntegerField(
        default=0,
        help_text='Display order in timetable'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'timetable_time_slots'
        ordering = ['order', 'start_time']
        verbose_name = 'Time Slot'
        verbose_name_plural = 'Time Slots'
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['start_time']),
        ]

    def __str__(self):
        return f"{self.name} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"

    def clean(self):
        """Validate time slot"""
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValidationError({
                    'end_time': 'End time must be after start time'
                })

            # Check for overlapping time slots
            overlapping = TimeSlot.objects.filter(
                is_active=True
            ).exclude(id=self.id).filter(
                models.Q(
                    start_time__lt=self.end_time,
                    end_time__gt=self.start_time
                )
            )

            if overlapping.exists():
                raise ValidationError(
                    'This time slot overlaps with an existing time slot'
                )

    def save(self, *args, **kwargs):
        """Calculate duration before saving"""
        if self.start_time and self.end_time:
            # Calculate duration in minutes
            start_dt = datetime.combine(datetime.today(), self.start_time)
            end_dt = datetime.combine(datetime.today(), self.end_time)
            duration = (end_dt - start_dt).total_seconds() / 60
            self.duration_minutes = int(duration)
        
        super().save(*args, **kwargs)


class ClassTimetable(BaseModel):
    """
    Master timetable for a class/section
    """
    DAYS_OF_WEEK = [
        ('MONDAY', 'Monday'),
        ('TUESDAY', 'Tuesday'),
        ('WEDNESDAY', 'Wednesday'),
        ('THURSDAY', 'Thursday'),
        ('FRIDAY', 'Friday'),
        ('SATURDAY', 'Saturday'),
        ('SUNDAY', 'Sunday'),
    ]

    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='class_timetables'
    )
    class_obj = models.ForeignKey(
        'academics.Class',
        on_delete=models.CASCADE,
        related_name='timetables'
    )
    section = models.ForeignKey(
        'academics.Section',
        on_delete=models.CASCADE,
        related_name='timetables'
    )
    day_of_week = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    time_slot = models.ForeignKey(
        TimeSlot,
        on_delete=models.CASCADE,
        related_name='class_timetables'
    )
    subject = models.ForeignKey(
        'academics.Subject',
        on_delete=models.CASCADE,
        related_name='timetable_entries',
        null=True,
        blank=True,
        help_text='Subject for this period (null for breaks)'
    )
    teacher = models.ForeignKey(
        'staff.StaffMember',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='timetable_entries',
        help_text='Teacher assigned to this period'
    )
    room_number = models.CharField(
        max_length=50,
        blank=True,
        help_text='Classroom/Lab number'
    )
    is_active = models.BooleanField(default=True)
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'timetable_class_timetable'
        ordering = ['day_of_week', 'time_slot__order']
        verbose_name = 'Class Timetable'
        verbose_name_plural = 'Class Timetables'
        unique_together = [
            ['academic_year', 'class_obj', 'section', 'day_of_week', 'time_slot']
        ]
        indexes = [
            models.Index(fields=['academic_year', 'class_obj', 'section']),
            models.Index(fields=['day_of_week']),
            models.Index(fields=['teacher']),
        ]

    def __str__(self):
        return f"{self.class_obj.name} {self.section.name} - {self.day_of_week} - {self.time_slot.name}"

    def clean(self):
        """Validate timetable entry"""
        # Check if time slot is a period type
        if self.time_slot and self.time_slot.slot_type != 'PERIOD':
            if self.subject or self.teacher:
                raise ValidationError(
                    'Subject and teacher should not be assigned to non-period slots'
                )

        # Check for teacher conflicts (same teacher, same time, different class)
        if self.teacher and self.time_slot:
            conflicts = ClassTimetable.objects.filter(
                academic_year=self.academic_year,
                day_of_week=self.day_of_week,
                time_slot=self.time_slot,
                teacher=self.teacher,
                is_active=True
            ).exclude(id=self.id)

            if conflicts.exists():
                conflict = conflicts.first()
                raise ValidationError(
                    f'Teacher {self.teacher.get_full_name()} is already assigned to '
                    f'{conflict.class_obj.name} {conflict.section.name} at this time'
                )


class TeacherTimetable(BaseModel):
    """
    Teacher's weekly timetable (denormalized for quick access)
    """
    DAYS_OF_WEEK = ClassTimetable.DAYS_OF_WEEK

    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='teacher_timetables'
    )
    teacher = models.ForeignKey(
        'staff.StaffMember',
        on_delete=models.CASCADE,
        related_name='my_timetable'
    )
    day_of_week = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    time_slot = models.ForeignKey(
        TimeSlot,
        on_delete=models.CASCADE,
        related_name='teacher_timetables'
    )
    class_obj = models.ForeignKey(
        'academics.Class',
        on_delete=models.CASCADE,
        related_name='teacher_timetables'
    )
    section = models.ForeignKey(
        'academics.Section',
        on_delete=models.CASCADE,
        related_name='teacher_timetables'
    )
    subject = models.ForeignKey(
        'academics.Subject',
        on_delete=models.CASCADE,
        related_name='teacher_timetables'
    )
    room_number = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'timetable_teacher_timetable'
        ordering = ['day_of_week', 'time_slot__order']
        verbose_name = 'Teacher Timetable'
        verbose_name_plural = 'Teacher Timetables'
        unique_together = [
            ['academic_year', 'teacher', 'day_of_week', 'time_slot']
        ]
        indexes = [
            models.Index(fields=['academic_year', 'teacher']),
            models.Index(fields=['day_of_week']),
        ]

    def __str__(self):
        return f"{self.teacher.get_full_name()} - {self.day_of_week} - {self.time_slot.name}"


class TimetableSubstitution(BaseModel):
    """
    Temporary teacher substitutions
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('COMPLETED', 'Completed'),
    ]

    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='substitutions'
    )
    original_entry = models.ForeignKey(
        ClassTimetable,
        on_delete=models.CASCADE,
        related_name='substitutions',
        help_text='Original timetable entry'
    )
    date = models.DateField(help_text='Date of substitution')
    original_teacher = models.ForeignKey(
        'staff.StaffMember',
        on_delete=models.CASCADE,
        related_name='original_classes',
        help_text='Teacher who is absent'
    )
    substitute_teacher = models.ForeignKey(
        'staff.StaffMember',
        on_delete=models.CASCADE,
        related_name='substitute_classes',
        help_text='Teacher who will substitute'
    )
    reason = models.TextField(help_text='Reason for substitution')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    requested_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='requested_substitutions'
    )
    approved_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_substitutions'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'timetable_substitutions'
        ordering = ['-date', 'original_entry__time_slot__order']
        verbose_name = 'Timetable Substitution'
        verbose_name_plural = 'Timetable Substitutions'
        indexes = [
            models.Index(fields=['date', 'status']),
            models.Index(fields=['original_teacher']),
            models.Index(fields=['substitute_teacher']),
        ]

    def __str__(self):
        return f"{self.original_teacher.get_full_name()} → {self.substitute_teacher.get_full_name()} on {self.date}"

    def clean(self):
        """Validate substitution"""
        if self.original_teacher == self.substitute_teacher:
            raise ValidationError('Original and substitute teacher cannot be the same')

        # Check if substitute teacher is available at this time
        if self.date and self.original_entry:
            day_of_week = self.date.strftime('%A').upper()
            conflicts = ClassTimetable.objects.filter(
                academic_year=self.academic_year,
                day_of_week=day_of_week,
                time_slot=self.original_entry.time_slot,
                teacher=self.substitute_teacher,
                is_active=True
            )

            if conflicts.exists():
                raise ValidationError(
                    f'{self.substitute_teacher.get_full_name()} is already scheduled '
                    f'for another class at this time'
                )

    def approve(self, user):
        """Approve substitution"""
        self.status = 'APPROVED'
        self.approved_by = user
        self.approved_at = timezone.now()
        self.save()

    def reject(self, user, remarks=''):
        """Reject substitution"""
        self.status = 'REJECTED'
        self.approved_by = user
        self.approved_at = timezone.now()
        self.remarks = remarks
        self.save()


class RoomAllocation(BaseModel):
    """
    Room/Lab allocation for classes
    """
    ROOM_TYPE_CHOICES = [
        ('CLASSROOM', 'Classroom'),
        ('LAB', 'Laboratory'),
        ('LIBRARY', 'Library'),
        ('AUDITORIUM', 'Auditorium'),
        ('SPORTS', 'Sports Facility'),
        ('COMPUTER_LAB', 'Computer Lab'),
        ('SCIENCE_LAB', 'Science Lab'),
        ('OTHER', 'Other'),
    ]

    room_number = models.CharField(max_length=50, unique=True)
    room_name = models.CharField(max_length=200)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES)
    floor = models.CharField(max_length=50, blank=True)
    building = models.CharField(max_length=100, blank=True)
    capacity = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text='Maximum seating capacity'
    )
    facilities = models.JSONField(
        default=list,
        blank=True,
        help_text='List of available facilities (projector, AC, etc.)'
    )
    is_available = models.BooleanField(default=True)
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'timetable_room_allocation'
        ordering = ['building', 'floor', 'room_number']
        verbose_name = 'Room Allocation'
        verbose_name_plural = 'Room Allocations'
        indexes = [
            models.Index(fields=['room_type']),
            models.Index(fields=['is_available']),
        ]

    def __str__(self):
        return f"{self.room_number} - {self.room_name} ({self.get_room_type_display()})"


class TimetableTemplate(BaseModel):
    """
    Reusable timetable templates
    """
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    template_data = models.JSONField(
        help_text='JSON structure containing the timetable template'
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_templates'
    )

    class Meta:
        db_table = 'timetable_templates'
        ordering = ['-created_at']
        verbose_name = 'Timetable Template'
        verbose_name_plural = 'Timetable Templates'

    def __str__(self):
        return self.name


# ============================================================================
# AI TIMETABLE GENERATION MODELS
# ============================================================================

DAYS_OF_WEEK_CHOICES = [
    ('MONDAY', 'Monday'),
    ('TUESDAY', 'Tuesday'),
    ('WEDNESDAY', 'Wednesday'),
    ('THURSDAY', 'Thursday'),
    ('FRIDAY', 'Friday'),
    ('SATURDAY', 'Saturday'),
]


class SubjectPeriodRequirement(BaseModel):
    """
    Defines how many periods per week each subject needs for a class.
    Used as input for AI timetable generation.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='subject_period_requirements'
    )
    class_obj = models.ForeignKey(
        'academics.Class',
        on_delete=models.CASCADE,
        related_name='period_requirements'
    )
    subject = models.ForeignKey(
        'academics.Subject',
        on_delete=models.CASCADE,
        related_name='period_requirements'
    )
    teacher = models.ForeignKey(
        'staff.StaffMember',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='period_requirements',
        help_text='Preferred teacher for this subject-class combination'
    )
    periods_per_week = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(20)],
        help_text='Number of periods per week for this subject'
    )
    requires_lab = models.BooleanField(
        default=False,
        help_text='Whether this subject requires a lab room'
    )
    preferred_room_type = models.CharField(
        max_length=20,
        choices=RoomAllocation.ROOM_TYPE_CHOICES,
        null=True,
        blank=True,
        help_text='Preferred room type for this subject'
    )
    consecutive_periods = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(4)],
        help_text='Number of consecutive periods (e.g., 2 for double-period labs)'
    )
    preferred_time_slots = models.JSONField(
        default=list,
        blank=True,
        help_text='Preferred time of day: ["MORNING", "AFTERNOON"]'
    )

    class Meta:
        db_table = 'timetable_subject_period_requirements'
        ordering = ['class_obj__name', 'subject__name']
        verbose_name = 'Subject Period Requirement'
        verbose_name_plural = 'Subject Period Requirements'
        unique_together = ['academic_year', 'class_obj', 'subject']
        indexes = [
            models.Index(fields=['academic_year', 'class_obj']),
        ]

    def __str__(self):
        return f"{self.class_obj.name} - {self.subject.name}: {self.periods_per_week} periods/week"


class TeacherAvailability(BaseModel):
    """
    Per-day teacher availability and preferences for AI scheduling.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='teacher_availabilities'
    )
    teacher = models.ForeignKey(
        'staff.StaffMember',
        on_delete=models.CASCADE,
        related_name='availabilities'
    )
    day_of_week = models.CharField(max_length=10, choices=DAYS_OF_WEEK_CHOICES)
    is_available = models.BooleanField(
        default=True,
        help_text='Whether the teacher is available on this day'
    )
    available_from = models.TimeField(
        null=True,
        blank=True,
        help_text='Partial-day availability start time'
    )
    available_until = models.TimeField(
        null=True,
        blank=True,
        help_text='Partial-day availability end time'
    )
    max_periods_per_day = models.IntegerField(
        default=6,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='Maximum teaching periods this teacher can have on this day'
    )
    max_consecutive_periods = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(8)],
        help_text='Maximum consecutive periods without a break'
    )
    preferred_time_slots = models.JSONField(
        default=list,
        blank=True,
        help_text='Preferred period IDs for this day'
    )
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'timetable_teacher_availability'
        ordering = ['teacher', 'day_of_week']
        verbose_name = 'Teacher Availability'
        verbose_name_plural = 'Teacher Availabilities'
        unique_together = ['academic_year', 'teacher', 'day_of_week']
        indexes = [
            models.Index(fields=['academic_year', 'teacher']),
        ]

    def __str__(self):
        status = 'Available' if self.is_available else 'Unavailable'
        return f"{self.teacher.get_full_name()} - {self.get_day_of_week_display()} ({status})"

    def clean(self):
        if self.available_from and self.available_until:
            if self.available_from >= self.available_until:
                raise ValidationError({
                    'available_until': 'Available until must be after available from.'
                })


class TimetableGenerationConfig(BaseModel):
    """
    Stores the full configuration for an AI timetable generation run.
    """
    ALGORITHM_CHOICES = [
        ('CSP_BACKTRACK', 'Constraint Satisfaction + Backtracking'),
        ('GENETIC', 'Genetic Algorithm'),
        ('HYBRID', 'Hybrid CSP + Optimization'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, help_text='Configuration name')
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='generation_configs'
    )
    classes = models.ManyToManyField(
        'academics.Class',
        related_name='generation_configs',
        help_text='Classes to generate timetable for'
    )
    sections = models.ManyToManyField(
        'academics.Section',
        related_name='generation_configs',
        blank=True,
        help_text='Specific sections (if empty, all sections for selected classes)'
    )
    working_days = models.JSONField(
        default=list,
        help_text='Working days for generation, e.g. ["MONDAY","TUESDAY",...]'
    )

    # Algorithm parameters
    algorithm = models.CharField(
        max_length=20,
        choices=ALGORITHM_CHOICES,
        default='HYBRID'
    )
    max_iterations = models.IntegerField(
        default=1000,
        validators=[MinValueValidator(100), MaxValueValidator(10000)],
        help_text='Maximum iterations for optimization'
    )
    population_size = models.IntegerField(
        default=50,
        validators=[MinValueValidator(10), MaxValueValidator(200)],
        help_text='Population size for genetic algorithm'
    )

    # Soft constraint weights (0.0 to 1.0)
    weight_workload_balance = models.FloatField(
        default=0.8,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text='Weight for teacher workload balance across days'
    )
    weight_subject_spread = models.FloatField(
        default=0.7,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text='Weight for spreading subject periods across the week'
    )
    weight_teacher_preference = models.FloatField(
        default=0.6,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text='Weight for teacher time preference satisfaction'
    )
    weight_room_optimization = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text='Weight for minimizing room changes'
    )
    weight_no_consecutive_heavy = models.FloatField(
        default=0.7,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text='Weight for avoiding consecutive heavy subjects'
    )

    # Custom rules
    custom_rules = models.JSONField(
        default=list,
        blank=True,
        help_text='Custom scheduling rules in JSON format'
    )

    created_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='generation_configs'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'timetable_generation_configs'
        ordering = ['-created_at']
        verbose_name = 'Timetable Generation Config'
        verbose_name_plural = 'Timetable Generation Configs'
        indexes = [
            models.Index(fields=['academic_year']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_algorithm_display()})"

    def save(self, *args, **kwargs):
        if not self.working_days:
            self.working_days = [
                'MONDAY', 'TUESDAY', 'WEDNESDAY',
                'THURSDAY', 'FRIDAY', 'SATURDAY'
            ]
        super().save(*args, **kwargs)


class TimetableGenerationRun(BaseModel):
    """
    Tracks each AI timetable generation attempt with status, progress, and results.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('VALIDATING', 'Validating Input'),
        ('GENERATING', 'Generating'),
        ('OPTIMIZING', 'Optimizing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('APPLIED', 'Applied to Timetable'),
        ('ROLLED_BACK', 'Rolled Back'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    config = models.ForeignKey(
        TimetableGenerationConfig,
        on_delete=models.CASCADE,
        related_name='runs'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    # Progress tracking
    progress_percent = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    progress_message = models.CharField(max_length=500, blank=True)

    # Results
    generated_timetable = models.JSONField(
        default=dict,
        blank=True,
        help_text='Full generated timetable data in JSON'
    )
    fitness_score = models.FloatField(
        null=True,
        blank=True,
        help_text='Optimization fitness score (0-100)'
    )
    conflicts_found = models.IntegerField(default=0)
    warnings = models.JSONField(
        default=list,
        blank=True,
        help_text='List of warning messages from generation'
    )

    # Metadata
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.FloatField(null=True, blank=True)
    celery_task_id = models.CharField(max_length=255, blank=True)
    error_message = models.TextField(blank=True)

    # Rollback data
    rollback_snapshot = models.JSONField(
        default=dict,
        blank=True,
        help_text='Snapshot of previous timetable before applying generation results'
    )

    triggered_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='generation_runs'
    )

    class Meta:
        db_table = 'timetable_generation_runs'
        ordering = ['-created_at']
        verbose_name = 'Timetable Generation Run'
        verbose_name_plural = 'Timetable Generation Runs'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['config']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"Run #{str(self.id)[:8]} - {self.get_status_display()} ({self.config.name})"
