import uuid
from django.db import models
from django.utils import timezone
from apps.core.models import SoftDeleteModel, TenantManager


class AdmissionEnquiry(SoftDeleteModel):
    """
    Admission enquiry tracking - initial interest from parents/guardians
    before formal application submission.
    """
    objects = TenantManager()

    SOURCE_CHOICES = [
        ('WALK_IN', 'Walk In'),
        ('PHONE', 'Phone'),
        ('ONLINE', 'Online'),
        ('REFERRAL', 'Referral'),
    ]

    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('CONTACTED', 'Contacted'),
        ('CONVERTED', 'Converted'),
        ('CLOSED', 'Closed'),
    ]

    name = models.CharField(
        max_length=200,
        help_text='Name of the student or parent enquiring'
    )
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    class_applied = models.ForeignKey(
        'academics.Class',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admission_enquiries',
        help_text='Class for which admission is enquired'
    )
    enquiry_date = models.DateField(default=timezone.localdate)
    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default='WALK_IN'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='NEW'
    )
    notes = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    assigned_to = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_enquiries',
        help_text='Staff member assigned to follow up'
    )

    class Meta:
        db_table = 'admission_enquiries'
        ordering = ['-enquiry_date']
        verbose_name = 'Admission Enquiry'
        verbose_name_plural = 'Admission Enquiries'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['enquiry_date']),
            models.Index(fields=['source']),
        ]

    def __str__(self):
        return f"{self.name} - {self.get_status_display()} ({self.enquiry_date})"


class AdmissionApplication(SoftDeleteModel):
    """
    Formal admission application submitted by parents/guardians.
    Tracks the full lifecycle from draft to enrollment.
    """
    objects = TenantManager()

    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('DOCUMENTS_PENDING', 'Documents Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('ENROLLED', 'Enrolled'),
        ('WITHDRAWN', 'Withdrawn'),
    ]

    # Application Info
    application_number = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text='Auto-generated unique application number'
    )
    enquiry = models.ForeignKey(
        AdmissionEnquiry,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applications',
        help_text='Linked enquiry if converted from enquiry'
    )

    # Student Information
    student_name = models.CharField(max_length=200)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)

    # Academic Details
    class_applied = models.ForeignKey(
        'academics.Class',
        on_delete=models.CASCADE,
        related_name='admission_applications',
        help_text='Class for which admission is applied'
    )
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='admission_applications'
    )

    # Parent/Guardian Information
    father_name = models.CharField(max_length=200)
    mother_name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)

    # Address
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)

    # Previous School Details
    previous_school = models.CharField(max_length=255, blank=True)
    previous_class = models.CharField(max_length=50, blank=True)
    board = models.CharField(
        max_length=50,
        blank=True,
        help_text='Previous school board (CBSE, ICSE, State, etc.)'
    )
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Percentage obtained in previous class'
    )

    # Application Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT',
        db_index=True
    )
    submitted_date = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_applications'
    )
    reviewed_date = models.DateTimeField(null=True, blank=True)
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'admission_applications'
        ordering = ['-created_at']
        verbose_name = 'Admission Application'
        verbose_name_plural = 'Admission Applications'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['application_number']),
            models.Index(fields=['student_name']),
        ]

    def __str__(self):
        return f"{self.application_number} - {self.student_name} ({self.get_status_display()})"

    def save(self, *args, **kwargs):
        """Auto-generate application number on first save"""
        if not self.application_number:
            self.application_number = self._generate_application_number()
        super().save(*args, **kwargs)

    def _generate_application_number(self):
        """Generate unique application number in format APP-YYYYMMDD-XXXX"""
        today = timezone.now()
        prefix = f"APP-{today.strftime('%Y%m%d')}"
        last_app = AdmissionApplication.objects.filter(
            application_number__startswith=prefix
        ).order_by('-application_number').first()

        if last_app:
            last_number = int(last_app.application_number.split('-')[-1])
            new_number = last_number + 1
        else:
            new_number = 1

        return f"{prefix}-{new_number:04d}"


class AdmissionDocument(SoftDeleteModel):
    """
    Documents uploaded as part of an admission application.
    """
    objects = TenantManager()

    DOCUMENT_TYPE_CHOICES = [
        ('BIRTH_CERTIFICATE', 'Birth Certificate'),
        ('TRANSFER_CERTIFICATE', 'Transfer Certificate'),
        ('REPORT_CARD', 'Report Card'),
        ('AADHAR_CARD', 'Aadhar Card'),
        ('PHOTOS', 'Photographs'),
        ('MEDICAL_CERTIFICATE', 'Medical Certificate'),
        ('OTHER', 'Other'),
    ]

    application = models.ForeignKey(
        AdmissionApplication,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    document_type = models.CharField(
        max_length=30,
        choices=DOCUMENT_TYPE_CHOICES
    )
    file = models.FileField(upload_to='admissions/documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_admission_documents'
    )
    verified_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'admission_documents'
        ordering = ['-uploaded_at']
        verbose_name = 'Admission Document'
        verbose_name_plural = 'Admission Documents'

    def __str__(self):
        return f"{self.application.application_number} - {self.get_document_type_display()}"


class AdmissionSetting(SoftDeleteModel):
    """
    Configuration for admission process per class and academic year.
    Controls seat availability, application dates, and requirements.
    """
    objects = TenantManager()

    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='admission_settings'
    )
    class_applied = models.ForeignKey(
        'academics.Class',
        on_delete=models.CASCADE,
        related_name='admission_settings',
        verbose_name='Class'
    )
    total_seats = models.PositiveIntegerField(
        default=40,
        help_text='Total seats available for admission'
    )
    filled_seats = models.PositiveIntegerField(
        default=0,
        help_text='Number of seats already filled'
    )
    application_start_date = models.DateField(
        help_text='Date from which applications are accepted'
    )
    application_end_date = models.DateField(
        help_text='Last date for application submission'
    )
    entrance_test_required = models.BooleanField(
        default=False,
        help_text='Whether entrance test is required for admission'
    )
    interview_required = models.BooleanField(
        default=False,
        help_text='Whether interview is required for admission'
    )
    application_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text='Application processing fee'
    )

    class Meta:
        db_table = 'admission_settings'
        ordering = ['academic_year', 'class_applied']
        verbose_name = 'Admission Setting'
        verbose_name_plural = 'Admission Settings'
        unique_together = ['academic_year', 'class_applied']

    def __str__(self):
        return f"{self.academic_year} - {self.class_applied} (Seats: {self.available_seats}/{self.total_seats})"

    @property
    def available_seats(self):
        """Calculate available seats"""
        return max(0, self.total_seats - self.filled_seats)

    @property
    def is_open(self):
        """Check if admissions are currently open"""
        today = timezone.now().date()
        return self.application_start_date <= today <= self.application_end_date
