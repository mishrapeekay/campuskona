from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import BaseModel, SoftDeleteModel
from apps.authentication.models import User
from apps.core.validators import (
    validate_phone_number,
    validate_aadhar_number,
    validate_pan_number,
    validate_pincode
)
from apps.core.utils import generate_employee_id


class StaffMember(SoftDeleteModel):
    """
    Staff/Teacher model with comprehensive employee information
    """
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

    MARITAL_STATUS_CHOICES = [
        ('SINGLE', 'Single'),
        ('MARRIED', 'Married'),
        ('DIVORCED', 'Divorced'),
        ('WIDOWED', 'Widowed'),
    ]

    EMPLOYMENT_TYPE_CHOICES = [
        ('PERMANENT', 'Permanent'),
        ('CONTRACT', 'Contract'),
        ('TEMPORARY', 'Temporary'),
        ('VISITING', 'Visiting'),
        ('PART_TIME', 'Part Time'),
    ]

    EMPLOYMENT_STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('ON_LEAVE', 'On Leave'),
        ('SUSPENDED', 'Suspended'),
        ('TERMINATED', 'Terminated'),
        ('RESIGNED', 'Resigned'),
        ('RETIRED', 'Retired'),
    ]

    DESIGNATION_CHOICES = [
        ('PRINCIPAL', 'Principal'),
        ('VICE_PRINCIPAL', 'Vice Principal'),
        ('HEAD_TEACHER', 'Head Teacher'),
        ('SENIOR_TEACHER', 'Senior Teacher'),
        ('TEACHER', 'Teacher'),
        ('JUNIOR_TEACHER', 'Junior Teacher'),
        ('PRIMARY_TEACHER', 'Primary Teacher'), # Added to match mock data
        ('PRT', 'Primary Teacher (PRT)'),
        ('TGT', 'Trained Graduate Teacher (TGT)'),
        ('PGT', 'Post Graduate Teacher (PGT)'),
        ('LIBRARIAN', 'Librarian'),
        ('LAB_ASSISTANT', 'Lab Assistant'),
        ('SPORTS_COACH', 'Sports Coach'), # Added to match mock data
        ('SPORTS_TEACHER', 'Sports Teacher'),
        ('COUNSELOR', 'Counselor'),
        ('ACCOUNTANT', 'Accountant'),
        ('CLERK', 'Clerk'),
        ('OFFICE_ASSISTANT', 'Office Assistant'),
        ('PEON', 'Peon'),
        ('SECURITY_GUARD', 'Security Guard'),
        ('DRIVER', 'Driver'),
        ('ACADEMIC_COORDINATOR', 'Academic Coordinator'), # Added to match mock data
        ('OTHER', 'Other'),
    ]

    QUALIFICATION_CHOICES = [
        ('BELOW_10TH', 'Below 10th'),
        ('10TH_PASS', '10th Pass'),
        ('12TH_PASS', '12th Pass'),
        ('DIPLOMA', 'Diploma'),
        ('GRADUATE', 'Graduate'),
        ('POST_GRADUATE', 'Post Graduate'),
        ('B_ED', 'B.Ed'),
        ('M_ED', 'M.Ed'),
        ('PHD', 'Ph.D'),
        ('OTHER', 'Other'),
    ]

    # User account link
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='staff_profile',
        help_text='Linked user account for staff login'
    )

    # Employee Details
    employee_id = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text='Unique employee ID (auto-generated)'
    )
    joining_date = models.DateField(help_text='Date of joining')
    employment_type = models.CharField(
        max_length=20,
        choices=EMPLOYMENT_TYPE_CHOICES,
        default='PERMANENT'
    )
    employment_status = models.CharField(
        max_length=20,
        choices=EMPLOYMENT_STATUS_CHOICES,
        default='ACTIVE',
        db_index=True
    )
    designation = models.CharField(
        max_length=50,
        choices=DESIGNATION_CHOICES
    )
    department = models.CharField(max_length=100, blank=True)

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
    marital_status = models.CharField(
        max_length=20,
        choices=MARITAL_STATUS_CHOICES,
        default='SINGLE'
    )

    # Contact Information
    phone_number = models.CharField(
        max_length=15,
        blank=True, null=True,
        validators=[validate_phone_number]
    )
    alternate_phone = models.CharField(
        max_length=15,
        blank=True, null=True,
        validators=[validate_phone_number],
    )
    email = models.EmailField(blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=200, blank=True, null=True)
    emergency_contact_number = models.CharField(
        max_length=15,
        blank=True, null=True,
        validators=[validate_phone_number]
    )
    emergency_contact_relation = models.CharField(max_length=50, blank=True, null=True)

    # Address
    current_address_line1 = models.CharField(max_length=255, blank=True, null=True)
    current_address_line2 = models.CharField(max_length=255, blank=True, null=True)
    current_city = models.CharField(max_length=100, blank=True, null=True)
    current_state = models.CharField(max_length=100, blank=True, null=True)
    current_pincode = models.CharField(
        max_length=6,
        blank=True, null=True,
        validators=[validate_pincode]
    )

    permanent_address_line1 = models.CharField(max_length=255, blank=True, null=True)
    permanent_address_line2 = models.CharField(max_length=255, blank=True, null=True)
    permanent_city = models.CharField(max_length=100, blank=True, null=True)
    permanent_state = models.CharField(max_length=100, blank=True, null=True)
    permanent_pincode = models.CharField(
        max_length=6,
        blank=True, null=True,
        validators=[validate_pincode]
    )

    # Government IDs
    aadhar_number = models.CharField(
        max_length=12,
        validators=[validate_aadhar_number],
        unique=True,
        null=True,
        blank=True
    )
    pan_number = models.CharField(
        max_length=10,
        validators=[validate_pan_number],
        unique=True,
        null=True,
        blank=True
    )

    # Educational Qualifications
    highest_qualification = models.CharField(
        max_length=20,
        choices=QUALIFICATION_CHOICES,
        default='GRADUATE'
    )
    university = models.CharField(max_length=255, blank=True)
    specialization = models.CharField(max_length=255, blank=True)

    # Teaching Details (for teachers)
    is_class_teacher = models.BooleanField(default=False)
    subjects_taught = models.JSONField(
        default=list,
        blank=True,
        help_text='List of subject IDs taught by this teacher'
    )
    teaching_experience_years = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )

    # Bank Details
    bank_name = models.CharField(max_length=200, blank=True)
    bank_account_number = models.CharField(max_length=20, blank=True)
    bank_ifsc_code = models.CharField(max_length=11, blank=True)
    bank_branch = models.CharField(max_length=200, blank=True)

    # Salary Information
    basic_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True
    )

    # Photo
    photo = models.ImageField(
        upload_to='staff/photos/',
        null=True,
        blank=True
    )

    # Additional Information
    probation_period_months = models.IntegerField(
        default=6,
        validators=[MinValueValidator(0), MaxValueValidator(24)]
    )
    probation_end_date = models.DateField(null=True, blank=True)
    notice_period_days = models.IntegerField(default=30)

    # Exit Details
    exit_date = models.DateField(null=True, blank=True)
    exit_reason = models.TextField(blank=True)

    # Metadata
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'staff_members'
        ordering = ['employee_id']
        indexes = [
            models.Index(fields=['first_name', 'last_name']),
            models.Index(fields=['joining_date']),
            models.Index(fields=['employment_status']),
            models.Index(fields=['designation']),
        ]

    def __str__(self):
        return f"{self.get_full_name()} ({self.employee_id})"

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

    def get_total_experience(self):
        """Get total teaching experience including current employment"""
        from datetime import date
        if self.employment_status in ['ACTIVE', 'ON_LEAVE']:
            current_experience = (date.today() - self.joining_date).days // 365
            return self.teaching_experience_years + current_experience
        return self.teaching_experience_years

    def save(self, *args, **kwargs):
        """Auto-generate employee ID on first save"""
        if not self.employee_id:
            from django.db import connection
            # django-tenants injects schema_name. If missing (public/test), fallback to PUBLIC.
            school_code = getattr(connection, "schema_name", "public").upper()
            self.employee_id = generate_employee_id(school_code)
        super().save(*args, **kwargs)


class StaffDocument(SoftDeleteModel):
    """
    Staff documents storage (certificates, ID proofs, etc.)
    """
    DOCUMENT_TYPE_CHOICES = [
        ('RESUME', 'Resume/CV'),
        ('PHOTO', 'Photograph'),
        ('AADHAR_CARD', 'Aadhar Card'),
        ('PAN_CARD', 'PAN Card'),
        ('PASSPORT', 'Passport'),
        ('DRIVING_LICENSE', 'Driving License'),
        ('DEGREE_CERTIFICATE', 'Degree Certificate'),
        ('TEACHING_CERTIFICATE', 'Teaching Certificate'),
        ('EXPERIENCE_LETTER', 'Experience Letter'),
        ('RELIEVING_LETTER', 'Relieving Letter'),
        ('SALARY_SLIP', 'Salary Slip'),
        ('BANK_PASSBOOK', 'Bank Passbook'),
        ('POLICE_VERIFICATION', 'Police Verification'),
        ('MEDICAL_CERTIFICATE', 'Medical Certificate'),
        ('OTHER', 'Other'),
    ]

    staff_member = models.ForeignKey(
        StaffMember,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    document_type = models.CharField(
        max_length=50,
        choices=DOCUMENT_TYPE_CHOICES
    )
    document_name = models.CharField(max_length=255)
    document_file = models.FileField(upload_to='staff/documents/')
    document_number = models.CharField(max_length=100, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    issued_by = models.CharField(max_length=255, blank=True)

    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_staff_documents'
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'staff_documents'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.staff_member.get_full_name()} - {self.get_document_type_display()}"

# NOTE: StaffAttendance and StaffLeave models have been moved to the dedicated 'attendance' app
# This provides better separation of concerns and allows for unified attendance management
# across students and staff. See apps.attendance.models for the new models.


class StaffQualification(SoftDeleteModel):
    """
    Educational qualifications and certificates of staff
    """
    QUALIFICATION_TYPE_CHOICES = [
        ('10TH', '10th Standard'),
        ('12TH', '12th Standard'),
        ('DIPLOMA', 'Diploma'),
        ('UNDERGRADUATE', 'Undergraduate'),
        ('POSTGRADUATE', 'Postgraduate'),
        ('DOCTORATE', 'Doctorate'),
        ('TEACHING_CERTIFICATE', 'Teaching Certificate'),
        ('PROFESSIONAL_CERTIFICATE', 'Professional Certificate'),
        ('OTHER', 'Other'),
    ]

    staff_member = models.ForeignKey(
        StaffMember,
        on_delete=models.CASCADE,
        related_name='qualifications'
    )
    qualification_type = models.CharField(
        max_length=50,
        choices=QUALIFICATION_TYPE_CHOICES
    )
    degree_name = models.CharField(max_length=255)
    institution_name = models.CharField(max_length=255)
    university_board = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255, blank=True)
    year_of_completion = models.IntegerField()
    percentage_cgpa = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    certificate_file = models.FileField(
        upload_to='staff/qualifications/',
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'staff_qualifications'
        ordering = ['-year_of_completion']

    def __str__(self):
        return f"{self.staff_member.get_full_name()} - {self.degree_name}"


class StaffExperience(SoftDeleteModel):
    """
    Previous work experience of staff members
    """
    staff_member = models.ForeignKey(
        StaffMember,
        on_delete=models.CASCADE,
        related_name='work_experiences'
    )
    organization_name = models.CharField(max_length=255)
    designation = models.CharField(max_length=100)
    from_date = models.DateField()
    to_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    responsibilities = models.TextField(blank=True)
    leaving_reason = models.TextField(blank=True)

    experience_letter = models.FileField(
        upload_to='staff/experience_letters/',
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'staff_experience'
        ordering = ['-from_date']

    def __str__(self):
        return f"{self.staff_member.get_full_name()} - {self.organization_name} ({self.designation})"

    def get_duration_years(self):
        """Calculate duration in years"""
        from datetime import date
        end_date = self.to_date or date.today()
        duration = (end_date - self.from_date).days / 365
        return round(duration, 1)


class StaffRoleAssignment(BaseModel):
    """
    Assigns specific functional roles to staff members within an academic year.
    Enables tracking of which teacher is the Class Teacher of which section,
    House Master of which house, etc.
    """
    staff_member = models.ForeignKey(
        StaffMember,
        on_delete=models.CASCADE,
        related_name='role_assignments'
    )
    role = models.ForeignKey(
        'authentication.Role',
        on_delete=models.CASCADE,
        related_name='staff_assignments'
    )
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='staff_role_assignments'
    )

    # Contextual links (these are optional depending on the role)
    section = models.ForeignKey(
        'academics.Section',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='staff_role_assignments',
        help_text='Assigned section (for Class Teachers)'
    )
    # Note: House and Activity models can be added here once their respective apps are created
    # For now, we keep it flexible with generic metadata if needed
    context_data = models.JSONField(
        default=dict,
        blank=True,
        help_text='Additional context (e.g., {"house_id": "...", "activity_id": "..."})'
    )

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'staff_role_assignments'
        verbose_name = 'Staff Role Assignment'
        verbose_name_plural = 'Staff Role Assignments'
        unique_together = ['staff_member', 'role', 'academic_year', 'section']

    def __str__(self):
        return f"{self.staff_member.get_full_name()} - {self.role.name} ({self.academic_year.name})"
