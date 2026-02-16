from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import BaseModel, SoftDeleteModel, TenantManager
from apps.authentication.models import User
from apps.core.validators import (
    validate_phone_number,
    validate_aadhar_number,
    validate_pincode,
    validate_samagra_family_id,
    validate_samagra_member_id
)
from apps.core.utils import generate_admission_number
from apps.core.encryption import EncryptedCharField, EncryptedDecimalField


class Student(SoftDeleteModel):
    """
    Student model with comprehensive profile information
    """
    # Use TenantManager for automatic schema switching
    objects = TenantManager()
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    ]

    CATEGORY_CHOICES = [
        ('GENERAL', 'General'),
        ('OBC', 'Other Backward Class'),
        ('SC', 'Scheduled Caste'),
        ('ST', 'Scheduled Tribe'),
        ('EWS', 'Economically Weaker Section'),
    ]

    RELIGION_CHOICES = [
        ('HINDU', 'Hindu'),
        ('MUSLIM', 'Muslim'),
        ('CHRISTIAN', 'Christian'),
        ('SIKH', 'Sikh'),
        ('BUDDHIST', 'Buddhist'),
        ('JAIN', 'Jain'),
        ('OTHER', 'Other'),
    ]

    ADMISSION_STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED_TO_ADMIN', 'Submitted to Admin'),
        ('SENT_TO_PARENT', 'Sent to Parent'),
        ('PARENT_REVIEWED', 'Parent Reviewed'),
        ('PENDING', 'Pending Verification'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('TRANSFERRED', 'Transferred'),
        ('PASSED_OUT', 'Passed Out'),
    ]

    # User account link
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile',
        help_text='Linked user account for student login'
    )

    # Basic Information
    admission_number = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text='Unique admission number (auto-generated)'
    )
    admission_date = models.DateField(
        help_text='Date of admission'
    )
    admission_status = models.CharField(
        max_length=20,
        choices=ADMISSION_STATUS_CHOICES,
        default='PENDING',
        db_index=True
    )

    # Personal Details
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    blood_group = models.CharField(
        max_length=3,
        choices=BLOOD_GROUP_CHOICES,
        blank=True
    )

    # Contact Information
    phone_number = models.CharField(
        max_length=10,
        validators=[validate_phone_number],
        blank=True,
        null=True
    )
    emergency_contact_number = models.CharField(
        max_length=10,
        validators=[validate_phone_number],
        blank=True,
        null=True
    )
    email = models.EmailField(blank=True, null=True)

    # Address
    current_address_line1 = models.CharField(max_length=255, blank=True, null=True)
    current_address_line2 = models.CharField(max_length=255, blank=True, null=True)
    current_city = models.CharField(max_length=100, blank=True, null=True)
    current_state = models.CharField(max_length=100, blank=True, null=True)
    current_pincode = models.CharField(
        max_length=6,
        validators=[validate_pincode],
        blank=True,
        null=True
    )

    permanent_address_line1 = models.CharField(max_length=255, blank=True, null=True)
    permanent_address_line2 = models.CharField(max_length=255, blank=True, null=True)
    permanent_city = models.CharField(max_length=100, blank=True, null=True)
    permanent_state = models.CharField(max_length=100, blank=True, null=True)
    permanent_pincode = models.CharField(
        max_length=6,
        validators=[validate_pincode],
        blank=True,
        null=True
    )

    # Family Background
    father_name = models.CharField(max_length=200, blank=True, null=True)
    father_occupation = models.CharField(max_length=100, blank=True, null=True)
    father_phone = models.CharField(
        max_length=10,
        validators=[validate_phone_number],
        blank=True,
        null=True
    )
    father_email = models.EmailField(blank=True)
    father_annual_income = EncryptedDecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Father annual income - Encrypted for privacy'
    )

    mother_name = models.CharField(max_length=200, blank=True, null=True)
    mother_occupation = models.CharField(max_length=100, blank=True)
    mother_phone = models.CharField(
        max_length=15,
        validators=[validate_phone_number],
        blank=True,
        null=True
    )
    mother_email = models.EmailField(blank=True, null=True)
    mother_annual_income = EncryptedDecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Mother annual income - Encrypted for privacy'
    )

    guardian_name = models.CharField(max_length=200, blank=True, null=True)
    guardian_relation = models.CharField(max_length=50, blank=True, null=True)
    guardian_phone = models.CharField(
        max_length=15,
        validators=[validate_phone_number],
        blank=True,
        null=True
    )
    guardian_email = models.EmailField(blank=True)

    # Government IDs (ENCRYPTED - DPDP Act 2023 Compliance)
    aadhar_number = EncryptedCharField(
        max_length=12,
        validators=[validate_aadhar_number],
        null=True,
        blank=True,
        help_text='12-digit Aadhaar number (unique identifier) - Encrypted at rest'
    )

    # Samagra ID (Madhya Pradesh only) - ENCRYPTED
    samagra_family_id = EncryptedCharField(
        max_length=8,
        validators=[validate_samagra_family_id],
        null=True,
        blank=True,
        help_text='8-digit Samagra Family ID (SSMID) - Madhya Pradesh only. Encrypted at rest.'
    )

    samagra_member_id = EncryptedCharField(
        max_length=9,
        validators=[validate_samagra_member_id],
        null=True,
        blank=True,
        help_text='9-digit Samagra Member ID (SSRNID) - Individual student identifier. Encrypted at rest.'
    )

    samagra_id_verified = models.BooleanField(
        default=False,
        help_text='Whether Samagra ID has been verified against SSSM portal'
    )

    samagra_id_verification_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date when Samagra ID was last verified'
    )

    # Academic Information
    previous_school_name = models.CharField(max_length=255, blank=True)
    previous_school_board = models.CharField(max_length=50, blank=True)
    previous_class = models.CharField(max_length=20, blank=True)
    transfer_certificate_number = models.CharField(
        max_length=100,
        blank=True
    )

    # Category & Religion
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='GENERAL'
    )
    religion = models.CharField(
        max_length=20,
        choices=RELIGION_CHOICES,
        default='HINDU'
    )

    # Special Needs
    is_differently_abled = models.BooleanField(default=False)
    disability_details = models.TextField(blank=True)

    # Medical Information
    medical_conditions = models.TextField(
        blank=True,
        help_text='Any medical conditions, allergies, etc.'
    )

    # Photo
    photo = models.ImageField(
        upload_to='students/photos/',
        null=True,
        blank=True
    )

    # Metadata
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'students'
        ordering = ['admission_number']
        indexes = [
            models.Index(fields=['first_name', 'last_name']),
            models.Index(fields=['admission_date']),
            models.Index(fields=['admission_status']),
        ]

    def __str__(self):
        return f"{self.get_full_name()} ({self.admission_number})"

    def get_full_name(self):
        """Return full name with middle name if present"""
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"

    def get_age(self):
        """Calculate current age"""
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

    def get_current_class_enrollment(self):
        """Get current active class enrollment"""
        return self.class_enrollments.filter(
            is_active=True,
            is_deleted=False
        ).first()

    def save(self, *args, **kwargs):
        """Auto-generate admission number on first save"""
        if not self.admission_number:
            from django.db import connection
            # django-tenants injects schema_name. If missing (public/test), fallback to PUBLIC.
            school_code = getattr(connection, "schema_name", "public").upper()
            self.admission_number = generate_admission_number(school_code)
        super().save(*args, **kwargs)


class StudentDocument(SoftDeleteModel):
    """
    Student documents storage (certificates, ID proofs, etc.)
    """
    DOCUMENT_TYPE_CHOICES = [
        ('BIRTH_CERTIFICATE', 'Birth Certificate'),
        ('TRANSFER_CERTIFICATE', 'Transfer Certificate'),
        ('MARKSHEET', 'Marksheet'),
        ('AADHAR_CARD', 'Aadhar Card'),
        ('PASSPORT', 'Passport'),
        ('PHOTO', 'Photograph'),
        ('INCOME_CERTIFICATE', 'Income Certificate'),
        ('CASTE_CERTIFICATE', 'Caste Certificate'),
        ('RESIDENCE_PROOF', 'Residence Proof'),
        ('MEDICAL_CERTIFICATE', 'Medical Certificate'),
        ('OTHER', 'Other'),
    ]

    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='documents'
    )
    document_type = models.CharField(
        max_length=50,
        choices=DOCUMENT_TYPE_CHOICES
    )
    document_name = models.CharField(max_length=255)
    document_file = models.FileField(upload_to='students/documents/')
    document_number = models.CharField(max_length=100, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    issued_by = models.CharField(max_length=255, blank=True)

    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_student_documents'
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'student_documents'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.get_document_type_display()}"


class StudentParent(SoftDeleteModel):
    """
    Link students to parent user accounts
    Supports multiple parents per student and multiple students per parent
    """
    RELATION_CHOICES = [
        ('FATHER', 'Father'),
        ('MOTHER', 'Mother'),
        ('GUARDIAN', 'Guardian'),
        ('OTHER', 'Other'),
    ]

    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='parent_links'
    )
    parent = models.ForeignKey(
        'authentication.User',
        on_delete=models.CASCADE,
        related_name='student_links',
        limit_choices_to={'user_type': 'PARENT'}
    )
    relation = models.CharField(
        max_length=20,
        choices=RELATION_CHOICES
    )
    is_primary_contact = models.BooleanField(default=False)
    is_emergency_contact = models.BooleanField(default=False)
    can_pickup = models.BooleanField(
        default=True,
        help_text='Authorized to pickup student from school'
    )

    class Meta:
        db_table = 'student_parents'
        unique_together = ['student', 'parent']
        ordering = ['-is_primary_contact', 'relation']

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.parent.get_full_name()} ({self.get_relation_display()})"


class StudentHealthRecord(SoftDeleteModel):
    """
    Health and medical records for students
    """
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='health_records'
    )

    # Measurements
    height = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Height in centimeters'
    )
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Weight in kilograms'
    )

    # Medical Details
    vaccination_records = models.JSONField(
        default=dict,
        blank=True,
        help_text='Vaccination history'
    )
    allergies = models.TextField(blank=True)
    chronic_conditions = models.TextField(blank=True)
    medications = models.TextField(blank=True)

    # Doctor Information
    family_doctor_name = models.CharField(max_length=200, blank=True)
    family_doctor_phone = models.CharField(
        max_length=10,
        validators=[validate_phone_number],
        blank=True
    )

    # Vision & Dental
    vision_status = models.CharField(max_length=100, blank=True)
    dental_status = models.CharField(max_length=100, blank=True)

    # Checkup Details
    checkup_date = models.DateField()
    next_checkup_date = models.DateField(null=True, blank=True)
    conducted_by = models.CharField(max_length=200)

    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'student_health_records'
        ordering = ['-checkup_date']

    def __str__(self):
        return f"{self.student.get_full_name()} - Health Record ({self.checkup_date})"


class StudentNote(SoftDeleteModel):
    """
    Notes and observations about students by staff
    """
    NOTE_TYPE_CHOICES = [
        ('ACADEMIC', 'Academic Performance'),
        ('BEHAVIORAL', 'Behavioral'),
        ('DISCIPLINARY', 'Disciplinary'),
        ('ACHIEVEMENT', 'Achievement'),
        ('CONCERN', 'Concern/Issue'),
        ('GENERAL', 'General'),
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    note_type = models.CharField(
        max_length=20,
        choices=NOTE_TYPE_CHOICES,
        default='GENERAL'
    )
    title = models.CharField(max_length=255)
    content = models.TextField()

    is_private = models.BooleanField(
        default=False,
        help_text='Private notes visible only to staff'
    )
    is_important = models.BooleanField(default=False)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='student_notes_created'
    )

    class Meta:
        db_table = 'student_notes'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.title}"
