"""
Examinations models for managing exams, marks, and grading
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
import uuid
from apps.core.models import BaseModel, TenantManager


class GradeScale(BaseModel):
    """
    Grading scale configuration (e.g., A+, A, B+, etc.)
    """
    objects = TenantManager()

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'examinations_grade_scale'
        ordering = ['name']
        verbose_name = 'Grade Scale'
        verbose_name_plural = 'Grade Scales'

    def __str__(self):
        return self.name


class Grade(BaseModel):
    """
    Individual grade definition (e.g., A+ = 90-100)
    """
    objects = TenantManager()

    grade_scale = models.ForeignKey(
        GradeScale,
        on_delete=models.CASCADE,
        related_name='grades'
    )
    grade = models.CharField(max_length=10, help_text='e.g., A+, A, B+')
    min_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    max_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    grade_point = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        help_text='GPA value for this grade'
    )
    description = models.CharField(
        max_length=100,
        blank=True,
        help_text='e.g., Excellent, Good, Average'
    )
    order = models.IntegerField(default=0, help_text='Display order')

    class Meta:
        db_table = 'examinations_grades'
        ordering = ['grade_scale', 'order', '-min_percentage']
        verbose_name = 'Grade'
        verbose_name_plural = 'Grades'
        unique_together = [['grade_scale', 'grade']]
        indexes = [
            models.Index(fields=['grade_scale', 'min_percentage', 'max_percentage']),
        ]

    def __str__(self):
        return f"{self.grade} ({self.min_percentage}% - {self.max_percentage}%)"

    def clean(self):
        """Validate grade ranges"""
        if self.min_percentage >= self.max_percentage:
            raise ValidationError('Minimum percentage must be less than maximum percentage')


class ExamType(BaseModel):
    """
    Types of examinations (e.g., Mid-term, Final, Quiz)
    """
    objects = TenantManager()

    TYPE_CHOICES = [
        ('FORMATIVE', 'Formative Assessment'),
        ('SUMMATIVE', 'Summative Assessment'),
        ('DIAGNOSTIC', 'Diagnostic Test'),
        ('BENCHMARK', 'Benchmark Test'),
    ]

    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    exam_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)
    weightage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=100.00,
        help_text='Percentage weightage in final grade'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'examinations_exam_types'
        ordering = ['name']
        verbose_name = 'Exam Type'
        verbose_name_plural = 'Exam Types'

    def __str__(self):
        return f"{self.name} ({self.weightage}%)"


class Examination(BaseModel):
    """
    Examination/Test schedule
    """
    objects = TenantManager()

    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('ONGOING', 'Ongoing'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('POSTPONED', 'Postponed'),
    ]

    name = models.CharField(max_length=200)
    exam_type = models.ForeignKey(
        ExamType,
        on_delete=models.PROTECT,
        related_name='examinations'
    )
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='examinations'
    )
    grade_scale = models.ForeignKey(
        GradeScale,
        on_delete=models.PROTECT,
        related_name='examinations'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    result_date = models.DateField(
        null=True,
        blank=True,
        help_text='Date when results will be published'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='SCHEDULED'
    )
    description = models.TextField(blank=True)
    instructions = models.TextField(
        blank=True,
        help_text='General instructions for students'
    )
    is_published = models.BooleanField(
        default=False,
        help_text='Whether results are published to students'
    )

    class Meta:
        db_table = 'examinations_examinations'
        ordering = ['-start_date']
        verbose_name = 'Examination'
        verbose_name_plural = 'Examinations'
        indexes = [
            models.Index(fields=['academic_year', 'status']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return f"{self.name} - {self.academic_year.name}"

    def clean(self):
        """Validate examination dates"""
        if self.start_date and self.end_date:
            if self.start_date > self.end_date:
                raise ValidationError('Start date must be before end date')
        
        if self.result_date and self.end_date:
            if self.result_date < self.end_date:
                raise ValidationError('Result date must be after exam end date')


class ExamSchedule(BaseModel):
    """
    Subject-wise exam schedule
    """
    objects = TenantManager()

    examination = models.ForeignKey(
        Examination,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    class_obj = models.ForeignKey(
        'academics.Class',
        on_delete=models.CASCADE,
        related_name='exam_schedules'
    )
    section = models.ForeignKey(
        'academics.Section',
        on_delete=models.CASCADE,
        related_name='exam_schedules'
    )
    subject = models.ForeignKey(
        'academics.Subject',
        on_delete=models.CASCADE,
        related_name='exam_schedules'
    )
    exam_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text='Exam duration in minutes'
    )
    max_marks = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    min_passing_marks = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    room_number = models.CharField(max_length=50, blank=True)
    instructions = models.TextField(blank=True)

    class Meta:
        db_table = 'examinations_exam_schedule'
        ordering = ['exam_date', 'start_time']
        verbose_name = 'Exam Schedule'
        verbose_name_plural = 'Exam Schedules'
        unique_together = [
            ['examination', 'class_obj', 'section', 'subject']
        ]
        indexes = [
            models.Index(fields=['examination', 'class_obj', 'section']),
            models.Index(fields=['exam_date']),
        ]

    def __str__(self):
        return f"{self.subject.name} - {self.class_obj.name} {self.section.name} - {self.exam_date}"

    def clean(self):
        """Validate schedule"""
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValidationError('Start time must be before end time')
        
        if self.min_passing_marks and self.max_marks:
            if self.min_passing_marks > self.max_marks:
                raise ValidationError('Passing marks cannot exceed maximum marks')


class StudentMark(BaseModel):
    """
    Individual student marks for each subject
    """
    objects = TenantManager()

    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('EXEMPTED', 'Exempted'),
    ]

    exam_schedule = models.ForeignKey(
        ExamSchedule,
        on_delete=models.CASCADE,
        related_name='student_marks'
    )
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='exam_marks'
    )
    marks_obtained = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PRESENT'
    )
    is_passed = models.BooleanField(default=False)
    grade = models.CharField(max_length=10, blank=True)
    grade_point = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True
    )
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    remarks = models.TextField(blank=True)
    entered_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='marks_entered'
    )
    entered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'examinations_student_marks'
        ordering = ['exam_schedule', 'student']
        verbose_name = 'Student Mark'
        verbose_name_plural = 'Student Marks'
        unique_together = [['exam_schedule', 'student']]
        indexes = [
            models.Index(fields=['student', 'exam_schedule']),
            models.Index(fields=['is_passed']),
        ]

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.exam_schedule.subject.name} - {self.marks_obtained}/{self.exam_schedule.max_marks}"

    def clean(self):
        """Validate marks"""
        if self.marks_obtained is not None and self.exam_schedule:
            if self.marks_obtained > self.exam_schedule.max_marks:
                raise ValidationError('Marks obtained cannot exceed maximum marks')

    def save(self, *args, **kwargs):
        """Calculate grade and percentage before saving"""
        if self.status == 'PRESENT' and self.marks_obtained is not None:
            # Calculate percentage
            self.percentage = (self.marks_obtained / self.exam_schedule.max_marks) * 100
            
            # Check if passed
            self.is_passed = self.marks_obtained >= self.exam_schedule.min_passing_marks
            
            # Calculate grade
            grade_scale = self.exam_schedule.examination.grade_scale
            grade_obj = grade_scale.grades.filter(
                min_percentage__lte=self.percentage,
                max_percentage__gte=self.percentage
            ).first()
            
            if grade_obj:
                self.grade = grade_obj.grade
                self.grade_point = grade_obj.grade_point
        
        super().save(*args, **kwargs)


class ExamResult(BaseModel):
    """
    Overall exam result for a student
    """
    objects = TenantManager()

    examination = models.ForeignKey(
        Examination,
        on_delete=models.CASCADE,
        related_name='results'
    )
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='exam_results'
    )
    class_obj = models.ForeignKey(
        'academics.Class',
        on_delete=models.CASCADE,
        related_name='exam_results'
    )
    section = models.ForeignKey(
        'academics.Section',
        on_delete=models.CASCADE,
        related_name='exam_results'
    )
    total_marks_obtained = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )
    total_max_marks = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    cgpa = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Cumulative Grade Point Average'
    )
    overall_grade = models.CharField(max_length=10, blank=True)
    rank = models.IntegerField(
        null=True,
        blank=True,
        help_text='Rank in class'
    )
    is_passed = models.BooleanField(default=False)
    subjects_passed = models.IntegerField(default=0)
    subjects_failed = models.IntegerField(default=0)
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'examinations_exam_results'
        ordering = ['-percentage']
        verbose_name = 'Exam Result'
        verbose_name_plural = 'Exam Results'
        unique_together = [['examination', 'student']]
        indexes = [
            models.Index(fields=['examination', 'class_obj', 'section']),
            models.Index(fields=['percentage']),
            models.Index(fields=['rank']),
        ]

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.examination.name} - {self.percentage}%"

    def calculate_result(self):
        """Calculate overall result from individual marks"""
        marks = StudentMark.objects.filter(
            exam_schedule__examination=self.examination,
            student=self.student,
            status='PRESENT'
        )
        
        self.total_marks_obtained = sum(m.marks_obtained or 0 for m in marks)
        self.total_max_marks = sum(m.exam_schedule.max_marks for m in marks)
        
        if self.total_max_marks > 0:
            self.percentage = (self.total_marks_obtained / self.total_max_marks) * 100
        
        # Calculate CGPA
        grade_points = [m.grade_point for m in marks if m.grade_point]
        if grade_points:
            self.cgpa = sum(grade_points) / len(grade_points)
        
        # Calculate overall grade
        grade_scale = self.examination.grade_scale
        grade_obj = grade_scale.grades.filter(
            min_percentage__lte=self.percentage,
            max_percentage__gte=self.percentage
        ).first()
        
        if grade_obj:
            self.overall_grade = grade_obj.grade
        
        # Count passed/failed subjects
        self.subjects_passed = marks.filter(is_passed=True).count()
        self.subjects_failed = marks.filter(is_passed=False).count()
        self.is_passed = self.subjects_failed == 0
        
        self.save()


# ============================================================================
# AI EXAM SCHEDULING MODELS
# ============================================================================

EXAM_DAYS_CHOICES = [
    ('MONDAY', 'Monday'),
    ('TUESDAY', 'Tuesday'),
    ('WEDNESDAY', 'Wednesday'),
    ('THURSDAY', 'Thursday'),
    ('FRIDAY', 'Friday'),
    ('SATURDAY', 'Saturday'),
]


class ExamHall(BaseModel):
    """
    Exam halls / rooms available for conducting exams.
    Unlike timetable rooms, these are specifically configured for exams
    with seating capacity and invigilation info.
    """
    objects = TenantManager()

    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    building = models.CharField(max_length=100, blank=True)
    floor = models.CharField(max_length=50, blank=True)
    seating_capacity = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text='Maximum students that can sit for an exam'
    )
    has_cctv = models.BooleanField(default=False)
    has_ac = models.BooleanField(default=False)
    is_accessible = models.BooleanField(
        default=True,
        help_text='Wheelchair accessible'
    )
    is_available = models.BooleanField(default=True)
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'examinations_exam_halls'
        ordering = ['building', 'floor', 'name']
        verbose_name = 'Exam Hall'
        verbose_name_plural = 'Exam Halls'

    def __str__(self):
        return f"{self.code} - {self.name} (Cap: {self.seating_capacity})"


class ExamScheduleConfig(BaseModel):
    """
    Configuration for AI exam schedule generation.
    Stores all parameters needed to generate an optimal exam schedule.
    """
    objects = TenantManager()

    ALGORITHM_CHOICES = [
        ('CSP_BACKTRACK', 'Constraint Satisfaction + Backtracking'),
        ('GENETIC', 'Genetic Algorithm'),
        ('HYBRID', 'Hybrid CSP + Optimization'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    examination = models.ForeignKey(
        Examination,
        on_delete=models.CASCADE,
        related_name='schedule_configs',
        help_text='The examination to generate schedule for'
    )
    classes = models.ManyToManyField(
        'academics.Class',
        related_name='exam_schedule_configs',
        help_text='Classes to schedule exams for'
    )
    sections = models.ManyToManyField(
        'academics.Section',
        related_name='exam_schedule_configs',
        blank=True,
        help_text='Specific sections (if empty, all sections of selected classes)'
    )
    exam_halls = models.ManyToManyField(
        ExamHall,
        related_name='schedule_configs',
        help_text='Available exam halls'
    )

    # Schedule dates
    start_date = models.DateField(help_text='First possible exam date')
    end_date = models.DateField(help_text='Last possible exam date')
    exam_days = models.JSONField(
        default=list,
        help_text='Days of week when exams can be held, e.g. ["MONDAY","WEDNESDAY","FRIDAY"]'
    )

    # Time slots for exams
    morning_start = models.TimeField(
        default='09:00',
        help_text='Morning session start time'
    )
    morning_end = models.TimeField(
        default='12:00',
        help_text='Morning session end time'
    )
    afternoon_start = models.TimeField(
        null=True, blank=True,
        help_text='Afternoon session start (null = single session/day)'
    )
    afternoon_end = models.TimeField(
        null=True, blank=True,
        help_text='Afternoon session end'
    )

    # Constraints
    min_gap_between_exams = models.IntegerField(
        default=1,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text='Minimum days gap between exams for same student'
    )
    max_exams_per_day = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(3)],
        help_text='Maximum exams a student can have per day'
    )
    avoid_back_to_back_heavy = models.BooleanField(
        default=True,
        help_text='Avoid scheduling heavy subjects on consecutive days'
    )
    heavy_subjects = models.ManyToManyField(
        'academics.Subject',
        blank=True,
        related_name='heavy_exam_configs',
        help_text='Subjects considered "heavy" (Math, Physics, etc.)'
    )

    # Algorithm parameters
    algorithm = models.CharField(
        max_length=20,
        choices=ALGORITHM_CHOICES,
        default='HYBRID'
    )
    max_iterations = models.IntegerField(
        default=500,
        validators=[MinValueValidator(50), MaxValueValidator(5000)],
    )
    population_size = models.IntegerField(
        default=40,
        validators=[MinValueValidator(10), MaxValueValidator(200)],
    )

    # Soft constraint weights
    weight_gap_balance = models.FloatField(
        default=0.8,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text='Weight for even spacing between exams'
    )
    weight_heavy_subject_spread = models.FloatField(
        default=0.7,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text='Weight for spreading heavy subjects apart'
    )
    weight_hall_utilization = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text='Weight for optimal hall capacity usage'
    )
    weight_invigilator_balance = models.FloatField(
        default=0.6,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text='Weight for balanced invigilator workload'
    )

    created_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='exam_schedule_configs'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'examinations_exam_schedule_configs'
        ordering = ['-created_at']
        verbose_name = 'Exam Schedule Config'
        verbose_name_plural = 'Exam Schedule Configs'

    def __str__(self):
        return f"{self.name} ({self.examination.name})"

    def save(self, *args, **kwargs):
        if not self.exam_days:
            self.exam_days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
        super().save(*args, **kwargs)

    def clean(self):
        if self.start_date and self.end_date:
            if self.start_date > self.end_date:
                raise ValidationError('Start date must be before end date')
        if self.afternoon_start and not self.afternoon_end:
            raise ValidationError('Afternoon end time is required if afternoon start is set')
        if self.afternoon_end and not self.afternoon_start:
            raise ValidationError('Afternoon start time is required if afternoon end is set')


class ExamScheduleRun(BaseModel):
    """
    Tracks each AI exam schedule generation attempt.
    """
    objects = TenantManager()

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('VALIDATING', 'Validating Input'),
        ('GENERATING', 'Generating'),
        ('OPTIMIZING', 'Optimizing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('APPLIED', 'Applied to Schedule'),
        ('ROLLED_BACK', 'Rolled Back'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    config = models.ForeignKey(
        ExamScheduleConfig,
        on_delete=models.CASCADE,
        related_name='runs'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    # Progress
    progress_percent = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    progress_message = models.CharField(max_length=500, blank=True)

    # Results
    generated_schedule = models.JSONField(
        default=dict,
        blank=True,
        help_text='Generated exam schedule data'
    )
    fitness_score = models.FloatField(null=True, blank=True)
    conflicts_found = models.IntegerField(default=0)
    warnings = models.JSONField(default=list, blank=True)

    # Metadata
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.FloatField(null=True, blank=True)
    celery_task_id = models.CharField(max_length=255, blank=True)
    error_message = models.TextField(blank=True)

    # Rollback
    rollback_snapshot = models.JSONField(
        default=dict,
        blank=True,
        help_text='Snapshot of previous schedule before applying'
    )

    triggered_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='exam_schedule_runs'
    )

    class Meta:
        db_table = 'examinations_exam_schedule_runs'
        ordering = ['-created_at']
        verbose_name = 'Exam Schedule Run'
        verbose_name_plural = 'Exam Schedule Runs'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"Run #{str(self.id)[:8]} - {self.get_status_display()} ({self.config.name})"

class ReportCardTemplate(BaseModel):
    """
    Customizable report card template for a school.
    Defines layout, fields, grading display, and branding.
    """
    objects = TenantManager()

    LAYOUT_CHOICES = [
        ('STANDARD', 'Standard'),
        ('CBSE', 'CBSE Pattern'),
        ('ICSE', 'ICSE Pattern'),
        ('COMPACT', 'Compact Single Page'),
    ]

    name = models.CharField(max_length=200)
    layout = models.CharField(max_length=20, choices=LAYOUT_CHOICES, default='STANDARD')
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='report_card_templates'
    )

    # Branding
    school_logo = models.ImageField(upload_to='report_card_templates/logos/', null=True, blank=True)
    header_text = models.CharField(max_length=500, blank=True, help_text='Custom header line')
    footer_text = models.CharField(max_length=500, blank=True, help_text='Custom footer line')
    watermark_text = models.CharField(max_length=100, blank=True)

    # Display config
    show_rank = models.BooleanField(default=True)
    show_percentage = models.BooleanField(default=True)
    show_grade = models.BooleanField(default=True)
    show_cgpa = models.BooleanField(default=True)
    show_attendance = models.BooleanField(default=True)
    show_teacher_remarks = models.BooleanField(default=True)
    show_principal_signature = models.BooleanField(default=True)
    show_parent_signature_line = models.BooleanField(default=True)
    show_grade_scale = models.BooleanField(default=True)

    # Multi-exam support
    include_exam_types = models.ManyToManyField(
        ExamType,
        blank=True,
        help_text='Exam types to include in cumulative report card'
    )

    # Extra fields config (JSON array of custom field definitions)
    custom_fields = models.JSONField(
        default=list,
        blank=True,
        help_text='Custom fields: [{"label": "Co-curricular", "type": "text"}, ...]'
    )

    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='report_card_templates_created'
    )

    class Meta:
        db_table = 'examinations_report_card_templates'
        ordering = ['-is_default', 'name']
        verbose_name = 'Report Card Template'
        verbose_name_plural = 'Report Card Templates'

    def __str__(self):
        return f"{self.name} ({self.get_layout_display()})"

    def save(self, *args, **kwargs):
        if self.is_default:
            ReportCardTemplate.objects.filter(
                academic_year=self.academic_year, is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


class ReportCard(BaseModel):
    """
    Generated report card for a student.
    Supports single-exam and cumulative multi-exam report cards.
    """
    objects = TenantManager()

    exam_result = models.OneToOneField(
        ExamResult,
        on_delete=models.CASCADE,
        related_name='report_card',
        null=True,
        blank=True,
        help_text='For single-exam report card'
    )
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='report_cards',
        null=True,
        blank=True
    )
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='report_cards',
        null=True,
        blank=True
    )
    template = models.ForeignKey(
        ReportCardTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='report_cards'
    )
    is_cumulative = models.BooleanField(
        default=False,
        help_text='True for multi-exam combined report card'
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='report_cards_generated'
    )
    report_data = models.JSONField(
        help_text='Complete report card data in JSON format'
    )
    pdf_file = models.FileField(
        upload_to='report_cards/',
        null=True,
        blank=True
    )
    teacher_remarks = models.TextField(blank=True)
    principal_remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'examinations_report_cards'
        ordering = ['-generated_at']
        verbose_name = 'Report Card'
        verbose_name_plural = 'Report Cards'

    def __str__(self):
        student_name = ''
        if self.exam_result:
            student_name = self.exam_result.student.get_full_name()
            exam_name = self.exam_result.examination.name
        elif self.student:
            student_name = self.student.get_full_name()
            exam_name = 'Cumulative'
        else:
            student_name = 'Unknown'
            exam_name = 'Unknown'
        return f"Report Card - {student_name} - {exam_name}"
