from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import BaseModel, SoftDeleteModel
from apps.students.models import Student
from apps.staff.models import StaffMember


class AcademicYear(SoftDeleteModel):
    """
    Academic Year model
    """
    name = models.CharField(
        max_length=20,
        unique=True,
        help_text='Academic year in format: 2024-2025'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(
        default=False,
        help_text='Only one academic year can be current at a time'
    )

    class Meta:
        db_table = 'academic_years'
        ordering = ['-start_date']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Ensure only one academic year is current"""
        if self.is_current:
            AcademicYear.objects.filter(is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class Board(SoftDeleteModel):
    """
    Educational Board model (CBSE, ICSE, MPBSE, etc.)
    """
    BOARD_TYPE_CHOICES = [
        ('CBSE', 'Central Board of Secondary Education'),
        ('ICSE', 'Indian Certificate of Secondary Education'),
        ('MPBSE', 'Madhya Pradesh Board of Secondary Education'),
        ('STATE', 'State Board'),
        ('IB', 'International Baccalaureate'),
        ('OTHER', 'Other'),
    ]

    board_type = models.CharField(
        max_length=20,
        choices=BOARD_TYPE_CHOICES,
        unique=True
    )
    board_name = models.CharField(max_length=255)
    board_code = models.CharField(max_length=50, unique=True)

    # Grading Configuration
    grading_system = models.JSONField(
        default=dict,
        help_text='Board-specific grading configuration'
    )

    # Grade Configuration
    minimum_passing_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=33.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    # Configuration
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'boards'
        ordering = ['board_name']

    def __str__(self):
        return f"{self.get_board_type_display()} ({self.board_code})"


class Subject(SoftDeleteModel):
    """
    Subject model
    """
    SUBJECT_TYPE_CHOICES = [
        ('CORE', 'Core Subject'),
        ('ELECTIVE', 'Elective Subject'),
        ('LANGUAGE', 'Language'),
        ('EXTRA_CURRICULAR', 'Extra Curricular'),
    ]

    CLASS_GROUP_CHOICES = [
        ('PRE_PRIMARY', 'Pre-Primary (LKG/UKG/Nursery)'),
        ('PRIMARY', 'Primary (Class 1-5)'),
        ('MIDDLE', 'Middle (Class 6-8)'),
        ('SECONDARY', 'Secondary (Class 9-10)'),
        ('SENIOR_SECONDARY', 'Senior Secondary (Class 11-12)'),
    ]

    STREAM_CHOICES = [
        ('GENERAL', 'General'),
        ('SCI', 'Science'),
        ('COM', 'Commerce'),
        ('HUM', 'Humanities'),
        ('VOC', 'Vocational'),
        ('IB_GROUP', 'IB Group'),
    ]

    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    subject_type = models.CharField(
        max_length=20,
        choices=SUBJECT_TYPE_CHOICES,
        default='CORE'
    )

    # Classification
    class_group = models.CharField(
        max_length=20,
        choices=CLASS_GROUP_CHOICES,
        default='PRIMARY',
        help_text='Class level group'
    )
    stream = models.CharField(
        max_length=20,
        choices=STREAM_CHOICES,
        default='GENERAL',
        help_text='Academic stream'
    )

    # Board-specific
    board = models.ForeignKey(
        Board,
        on_delete=models.CASCADE,
        related_name='subjects',
        null=True,
        blank=True,
        help_text='Leave blank for subjects common to all boards'
    )

    # Assessment Configuration
    theory_max_marks = models.IntegerField(
        default=100,
        validators=[MinValueValidator(0)]
    )
    practical_max_marks = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )

    has_practical = models.BooleanField(default=False)
    is_optional = models.BooleanField(default=False)

    # Metadata
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'subjects'
        ordering = ['class_group', 'stream', 'name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['subject_type']),
            models.Index(fields=['class_group']),
            models.Index(fields=['stream']),
            models.Index(fields=['class_group', 'stream']),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"

    def get_total_max_marks(self):
        """Calculate total maximum marks"""
        return self.theory_max_marks + self.practical_max_marks


class Class(SoftDeleteModel):
    """
    Class/Grade model (e.g., Class 1, Class 2, etc.)
    """
    name = models.CharField(
        max_length=50,
        help_text='Class name: LKG, UKG, 1, 2, ..., 12'
    )
    display_name = models.CharField(
        max_length=100,
        help_text='Display name: Class 1, Grade 1, LKG, etc.'
    )
    class_order = models.IntegerField(
        unique=True,
        help_text='Order of class: -2=LKG, -1=UKG, 1-12 for numbered classes'
    )

    # Board Configuration
    board = models.ForeignKey(
        Board,
        on_delete=models.CASCADE,
        related_name='classes'
    )

    # Group Classification (auto-set on save based on name/class_order)
    class_group = models.CharField(
        max_length=20,
        choices=Subject.CLASS_GROUP_CHOICES,
        blank=True,
        db_index=True,
        help_text='Auto-set: PRE_PRIMARY for LKG/UKG, PRIMARY for 1-5, MIDDLE for 6-8, SECONDARY for 9-10, SENIOR_SECONDARY for 11-12'
    )

    # Metadata
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'classes'
        ordering = ['class_order']
        verbose_name_plural = 'Classes'
        unique_together = ['name', 'board']

    def __str__(self):
        return f"{self.display_name} ({self.board.board_code})"

    @classmethod
    def resolve_class_group(cls, name, class_order):
        """
        Determine the class group from the class name and order.
        Name-based detection takes precedence over class_order.
        Supports: 'LKG', 'UKG', 'Class 1', 'Class 12', '1', '12', 'Grade 5', etc.
        """
        import re
        name_upper = name.upper().strip()
        # Pre-primary by keyword
        if any(kw in name_upper for kw in ('LKG', 'UKG', 'NURSERY', 'KG',
                                            'PRE-PRIMARY', 'PREPRIMARY', 'PLAYGROUP')):
            return 'PRE_PRIMARY'
        # Extract class number from name (e.g. "Class 1" → 1, "12" → 12)
        m = re.search(r'\b(\d{1,2})\b', name)
        if m:
            num = int(m.group(1))
            if num <= 5:
                return 'PRIMARY'
            if num <= 8:
                return 'MIDDLE'
            if num <= 10:
                return 'SECONDARY'
            return 'SENIOR_SECONDARY'
        # Fallback: use class_order if name has no number
        if class_order <= 2:
            return 'PRE_PRIMARY'
        if class_order <= 7:
            return 'PRIMARY'
        if class_order <= 10:
            return 'MIDDLE'
        if class_order <= 12:
            return 'SECONDARY'
        return 'SENIOR_SECONDARY'

    def save(self, *args, **kwargs):
        # Auto-set class_group on every save
        self.class_group = self.resolve_class_group(self.name, self.class_order)
        super().save(*args, **kwargs)


class Section(SoftDeleteModel):
    """
    Section model (e.g., A, B, C, etc.)
    """
    class_instance = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='sections',
        verbose_name='Class'
    )
    name = models.CharField(
        max_length=10,
        help_text='Section name: A, B, C, etc.'
    )

    # Academic Year
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='sections'
    )

    # Class Teacher
    class_teacher = models.ForeignKey(
        StaffMember,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='class_sections_managed',
        limit_choices_to={'is_class_teacher': True}
    )

    # Capacity
    max_students = models.IntegerField(
        default=40,
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )

    # Room details
    room_number = models.CharField(max_length=50, blank=True)

    # Metadata
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'sections'
        ordering = ['class_instance__class_order', 'name']
        unique_together = ['class_instance', 'name', 'academic_year']

    def __str__(self):
        return f"{self.class_instance.display_name} - {self.name}"

    def get_full_name(self):
        """Return full section name"""
        return f"{self.class_instance.display_name} - {self.name} ({self.academic_year.name})"

    def get_student_count(self):
        """Get current student count"""
        return self.enrollments.filter(is_active=True, is_deleted=False).count()

    def is_full(self):
        """Check if section is at capacity"""
        return self.get_student_count() >= self.max_students


class ClassSubject(SoftDeleteModel):
    """
    Link subjects to classes - defines which subjects are taught in which class
    """
    class_instance = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='class_subjects',
        verbose_name='Class'
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='class_subjects'
    )

    # Teacher Assignment
    teacher = models.ForeignKey(
        StaffMember,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subjects_taught_mapping'
    )

    # Academic Year
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='class_subjects'
    )

    # Configuration
    is_compulsory = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'class_subjects'
        ordering = ['class_instance__class_order', 'display_order', 'subject__name']
        unique_together = ['class_instance', 'subject', 'academic_year']

    def __str__(self):
        return f"{self.class_instance.display_name} - {self.subject.name} ({self.academic_year.name})"


class StudentEnrollment(SoftDeleteModel):
    """
    Student enrollment in a specific section for an academic year
    """
    ENROLLMENT_STATUS_CHOICES = [
        ('ENROLLED', 'Enrolled'),
        ('PROMOTED', 'Promoted'),
        ('DETAINED', 'Detained'),
        ('WITHDRAWN', 'Withdrawn'),
        ('TRANSFERRED', 'Transferred'),
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='class_enrollments'
    )
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )

    # Enrollment Details
    enrollment_date = models.DateField()
    roll_number = models.CharField(max_length=20, blank=True)

    # Status
    enrollment_status = models.CharField(
        max_length=20,
        choices=ENROLLMENT_STATUS_CHOICES,
        default='ENROLLED'
    )
    is_active = models.BooleanField(default=True)

    # Promotion/Detention
    promotion_date = models.DateField(null=True, blank=True)
    promoted_to_section = models.ForeignKey(
        Section,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='promoted_from_enrollments'
    )

    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'student_enrollments'
        ordering = ['-academic_year', 'section', 'roll_number']
        unique_together = ['student', 'academic_year']
        indexes = [
            models.Index(fields=['section', 'academic_year', 'is_active']),
            models.Index(fields=['student', 'is_active']),
        ]

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.section.get_full_name()}"


class StudentSubject(SoftDeleteModel):
    """
    Subjects taken by a student in a specific enrollment
    Useful for optional subjects
    """
    enrollment = models.ForeignKey(
        StudentEnrollment,
        on_delete=models.CASCADE,
        related_name='subject_selections'
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='student_enrollments'
    )

    # If subject has sections/batches
    batch_name = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'student_subjects'
        unique_together = ['enrollment', 'subject']
        ordering = ['subject__name']

    def __str__(self):
        return f"{self.enrollment.student.get_full_name()} - {self.subject.name}"


class SyllabusUnit(SoftDeleteModel):
    """
    Syllabus Unit/Chapter Details
    """
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='syllabus_units'
    )
    # Using Class instead of ClassSubject to allow syllabus definition 
    # independent of specific academic year allocations
    class_instance = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='syllabus_units',
        verbose_name='Class'
    )
    
    unit_number = models.IntegerField(help_text='Chapter/Unit Number')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, help_text='Detailed content/topics description')
    learning_objectives = models.TextField(blank=True)
    expected_hours = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        help_text='Expected number of hours to complete this unit'
    )
    weightage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        help_text='Percentage weightage in exams',
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    class Meta:
        db_table = 'syllabus_units'
        ordering = ['class_instance__class_order', 'subject__name', 'unit_number']
        unique_together = ['subject', 'class_instance', 'unit_number']

    def __str__(self):
        return f"{self.title} ({self.subject.name} - {self.class_instance.display_name})"


class LessonPlan(SoftDeleteModel):
    """
    Weekly Lesson Plan Header
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected')
    ]

    teacher = models.ForeignKey(
        StaffMember, 
        on_delete=models.CASCADE, 
        related_name='lesson_plans'
    )
    section = models.ForeignKey(
        Section, 
        on_delete=models.CASCADE, 
        related_name='lesson_plans'
    )
    subject = models.ForeignKey(
        Subject, 
        on_delete=models.CASCADE, 
        related_name='lesson_plans'
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='lesson_plans'
    )
    
    start_date = models.DateField(help_text='Week start date')
    end_date = models.DateField(help_text='Week end date')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    remarks = models.TextField(blank=True, help_text='Approver comments or general notes')
    
    class Meta:
        db_table = 'lesson_plans'
        ordering = ['-start_date', 'teacher']
        unique_together = ['teacher', 'section', 'subject', 'start_date']

    def __str__(self):
        return f"{self.subject.name} - {self.section.name} ({self.start_date})"


class LessonPlanItem(SoftDeleteModel):
    """
    Individual Lesson/Topic mapping within a weekly plan
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('RESCHEDULED', 'Rescheduled')
    ]

    lesson_plan = models.ForeignKey(
        LessonPlan, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    syllabus_unit = models.ForeignKey(
        SyllabusUnit, 
        on_delete=models.CASCADE, 
        related_name='lesson_plan_items',
        null=True,
        blank=True,
        help_text='Link to specific syllabus unit'
    )
    
    topic = models.CharField(max_length=255, help_text='Specific topic to be covered')
    planned_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    resources_used = models.TextField(blank=True, help_text='Teaching aids, references, etc.')
    homework = models.TextField(blank=True, help_text='Homework assigned')

    class Meta:
        db_table = 'lesson_plan_items'
        ordering = ['planned_date']

    def __str__(self):
        return f"{self.topic} ({self.planned_date})"
