"""
Attendance Management Models
Handles student and staff attendance tracking, leave management, and holidays
"""

from django.db import models
import uuid
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import datetime, timedelta
from apps.core.models import BaseModel


class AttendancePeriod(BaseModel):
    """
    Defines school periods/time slots for period-wise attendance
    """
    PERIOD_TYPES = (
        ('PERIOD', 'Period'),
        ('BREAK', 'Break'),
        ('LUNCH', 'Lunch'),
        ('ASSEMBLY', 'Assembly'),
        ('ACTIVITY', 'Activity'),
    )

    name = models.CharField(max_length=100, help_text="e.g., Period 1, Morning Break")
    start_time = models.TimeField()
    end_time = models.TimeField()
    period_type = models.CharField(max_length=20, choices=PERIOD_TYPES, default='PERIOD')
    order = models.PositiveIntegerField(default=1, help_text="Display order")
    duration = models.PositiveIntegerField(editable=False, help_text="Duration in minutes")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'start_time']
        verbose_name = 'Attendance Period'
        verbose_name_plural = 'Attendance Periods'
        unique_together = ['name', 'start_time']

    def __str__(self):
        return f"{self.name} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"

    def clean(self):
        """Validate period times"""
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValidationError("End time must be after start time")

    def save(self, *args, **kwargs):
        """Calculate duration before saving"""
        if self.start_time and self.end_time:
            # Calculate duration in minutes
            start = datetime.combine(datetime.today(), self.start_time)
            end = datetime.combine(datetime.today(), self.end_time)
            self.duration = int((end - start).total_seconds() / 60)
        super().save(*args, **kwargs)


class StudentAttendance(BaseModel):
    """
    Student attendance records - daily or period-wise
    """
    ATTENDANCE_STATUS = (
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
        ('HALF_DAY', 'Half Day'),
        ('LEAVE', 'On Leave'),
        ('HOLIDAY', 'Holiday'),
    )

    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='student_attendance'
    )
    date = models.DateField()
    status = models.CharField(max_length=20, choices=ATTENDANCE_STATUS, default='PRESENT')
    
    # Period-wise attendance (optional)
    period = models.ForeignKey(
        AttendancePeriod,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='student_attendance'
    )
    
    # Timing details
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    
    # Biometric integration
    biometric_verified = models.BooleanField(default=False)
    biometric_device_id = models.CharField(max_length=50, blank=True)
    
    # Tracking
    marked_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='marked_student_attendance'
    )
    marked_at = models.DateTimeField(auto_now_add=True)
    
    remarks = models.TextField(blank=True)

    class Meta:
        ordering = ['-date', 'student']
        verbose_name = 'Student Attendance'
        verbose_name_plural = 'Student Attendance Records'
        unique_together = ['student', 'date', 'period']
        indexes = [
            models.Index(fields=['student', 'date']),
            models.Index(fields=['date', 'status']),
            models.Index(fields=['academic_year', 'date']),
        ]

    def __str__(self):
        period_str = f" - {self.period.name}" if self.period else ""
        return f"{self.student.get_full_name()} - {self.date}{period_str} - {self.get_status_display()}"

    def clean(self):
        """Validate attendance record"""
        # Check if date is in the future
        if self.date > timezone.now().date():
            raise ValidationError("Cannot mark attendance for future dates")
        
        # Validate check times
        if self.check_in_time and self.check_out_time:
            if self.check_in_time >= self.check_out_time:
                raise ValidationError("Check-out time must be after check-in time")

    @property
    def is_present(self):
        """Check if student was present"""
        return self.status in ['PRESENT', 'LATE', 'HALF_DAY']

    @property
    def duration(self):
        """Calculate attendance duration in hours"""
        if self.check_in_time and self.check_out_time:
            start = datetime.combine(self.date, self.check_in_time)
            end = datetime.combine(self.date, self.check_out_time)
            return (end - start).total_seconds() / 3600
        return None


class StaffAttendance(BaseModel):
    """
    Staff/Teacher attendance records
    """
    ATTENDANCE_STATUS = (
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('HALF_DAY', 'Half Day'),
        ('LEAVE', 'On Leave'),
        ('HOLIDAY', 'Holiday'),
        ('WEEKEND', 'Weekend'),
        ('WORK_FROM_HOME', 'Work From Home'),
    )

    staff_member = models.ForeignKey(
        'staff.StaffMember',
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    date = models.DateField()
    status = models.CharField(max_length=20, choices=ATTENDANCE_STATUS, default='PRESENT')
    
    # Timing
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    working_hours = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Calculated working hours"
    )
    
    # Biometric integration
    biometric_verified = models.BooleanField(default=False)
    biometric_device_id = models.CharField(max_length=50, blank=True)
    
    # Tracking
    marked_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='marked_staff_attendance'
    )
    marked_at = models.DateTimeField(auto_now_add=True)
    
    remarks = models.TextField(blank=True)
    
    # Overtime
    overtime_hours = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0,
        help_text="Overtime hours"
    )

    class Meta:
        ordering = ['-date', 'staff_member']
        verbose_name = 'Staff Attendance'
        verbose_name_plural = 'Staff Attendance Records'
        unique_together = ['staff_member', 'date']
        indexes = [
            models.Index(fields=['staff_member', 'date']),
            models.Index(fields=['date', 'status']),
        ]

    def __str__(self):
        return f"{self.staff_member.get_full_name()} - {self.date} - {self.get_status_display()}"

    def clean(self):
        """Validate attendance record"""
        if self.date > timezone.now().date():
            raise ValidationError("Cannot mark attendance for future dates")
        
        if self.check_in_time and self.check_out_time:
            if self.check_in_time >= self.check_out_time:
                raise ValidationError("Check-out time must be after check-in time")

    def save(self, *args, **kwargs):
        """Calculate working hours before saving"""
        if self.check_in_time and self.check_out_time:
            start = datetime.combine(self.date, self.check_in_time)
            end = datetime.combine(self.date, self.check_out_time)
            hours = (end - start).total_seconds() / 3600
            self.working_hours = round(hours, 2)
        super().save(*args, **kwargs)

    @property
    def is_present(self):
        """Check if staff was present"""
        return self.status in ['PRESENT', 'HALF_DAY', 'WORK_FROM_HOME']


class StudentLeave(BaseModel):
    """
    Student leave requests and approvals
    """
    LEAVE_TYPES = (
        ('SICK', 'Sick Leave'),
        ('CASUAL', 'Casual Leave'),
        ('EMERGENCY', 'Emergency Leave'),
        ('FAMILY', 'Family Event'),
        ('MEDICAL', 'Medical Appointment'),
        ('OTHER', 'Other'),
    )

    LEAVE_STATUS = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
    )

    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='leave_requests'
    )
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=LEAVE_STATUS, default='PENDING')
    
    # Request details
    requested_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='student_leave_requests',
        help_text="Parent/Guardian who requested"
    )
    requested_at = models.DateTimeField(auto_now_add=True)
    
    # Approval details
    approved_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_student_leaves'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    approval_remarks = models.TextField(blank=True)
    
    # Documents
    supporting_document = models.FileField(
        upload_to='leaves/student/%Y/%m/',
        null=True,
        blank=True,
        help_text="Medical certificate, etc."
    )
    
    # Calculated field
    total_days = models.PositiveIntegerField(editable=False, default=1)

    class Meta:
        ordering = ['-requested_at']
        verbose_name = 'Student Leave'
        verbose_name_plural = 'Student Leaves'
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.get_leave_type_display()} ({self.start_date} to {self.end_date})"

    def clean(self):
        """Validate leave dates"""
        if self.start_date and self.end_date:
            if self.start_date > self.end_date:
                raise ValidationError("End date must be after or equal to start date")

    def save(self, *args, **kwargs):
        """Calculate total days before saving"""
        if self.start_date and self.end_date:
            self.total_days = (self.end_date - self.start_date).days + 1
        super().save(*args, **kwargs)

    def approve(self, user):
        """Approve leave request"""
        self.status = 'APPROVED'
        self.approved_by = user
        self.approved_at = timezone.now()
        self.save()

    def reject(self, user, remarks=''):
        """Reject leave request"""
        self.status = 'REJECTED'
        self.approved_by = user
        self.approved_at = timezone.now()
        self.approval_remarks = remarks
        self.save()


class StaffLeave(BaseModel):
    """
    Staff leave requests and approvals
    """
    LEAVE_TYPES = (
        ('SICK', 'Sick Leave'),
        ('CASUAL', 'Casual Leave'),
        ('EARNED', 'Earned Leave'),
        ('MATERNITY', 'Maternity Leave'),
        ('PATERNITY', 'Paternity Leave'),
        ('COMPENSATORY', 'Compensatory Off'),
        ('UNPAID', 'Unpaid Leave'),
        ('BEREAVEMENT', 'Bereavement Leave'),
        ('OTHER', 'Other'),
    )

    LEAVE_STATUS = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
    )

    staff_member = models.ForeignKey(
        'staff.StaffMember',
        on_delete=models.CASCADE,
        related_name='leave_requests'
    )
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=LEAVE_STATUS, default='PENDING')
    
    # Request details
    requested_at = models.DateTimeField(auto_now_add=True)
    
    # Approval details
    approved_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_staff_leaves'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    approval_remarks = models.TextField(blank=True)
    
    # Documents
    supporting_document = models.FileField(
        upload_to='leaves/staff/%Y/%m/',
        null=True,
        blank=True
    )
    
    # Calculated fields
    total_days = models.PositiveIntegerField(editable=False, default=1)
    is_half_day = models.BooleanField(default=False)

    class Meta:
        ordering = ['-requested_at']
        verbose_name = 'Staff Leave'
        verbose_name_plural = 'Staff Leaves'
        indexes = [
            models.Index(fields=['staff_member', 'status']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return f"{self.staff_member.get_full_name()} - {self.get_leave_type_display()} ({self.start_date} to {self.end_date})"

    def clean(self):
        """Validate leave dates"""
        if self.start_date and self.end_date:
            if self.start_date > self.end_date:
                raise ValidationError("End date must be after or equal to start date")

    def save(self, *args, **kwargs):
        """Calculate total days before saving"""
        if self.start_date and self.end_date:
            days = (self.end_date - self.start_date).days + 1
            self.total_days = 0.5 if self.is_half_day and days == 1 else days
        super().save(*args, **kwargs)

    def approve(self, user):
        """Approve leave request"""
        self.status = 'APPROVED'
        self.approved_by = user
        self.approved_at = timezone.now()
        self.save()

    def reject(self, user, remarks=''):
        """Reject leave request"""
        self.status = 'REJECTED'
        self.approved_by = user
        self.approved_at = timezone.now()
        self.approval_remarks = remarks
        self.save()


class Holiday(BaseModel):
    """
    School holidays and non-working days
    """
    HOLIDAY_TYPES = (
        ('NATIONAL', 'National Holiday'),
        ('REGIONAL', 'Regional Holiday'),
        ('SCHOOL', 'School Holiday'),
        ('FESTIVAL', 'Festival'),
        ('WEEKEND', 'Weekend'),
        ('EXAM', 'Examination'),
        ('VACATION', 'Vacation'),
    )

    name = models.CharField(max_length=200)
    date = models.DateField()
    holiday_type = models.CharField(max_length=20, choices=HOLIDAY_TYPES)
    description = models.TextField(blank=True)
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='holidays'
    )
    is_optional = models.BooleanField(
        default=False,
        help_text="Optional holiday (staff can choose to work)"
    )

    class Meta:
        ordering = ['date']
        verbose_name = 'Holiday'
        verbose_name_plural = 'Holidays'
        unique_together = ['date', 'academic_year']
        indexes = [
            models.Index(fields=['date', 'academic_year']),
        ]

    def __str__(self):
        return f"{self.name} - {self.date} ({self.get_holiday_type_display()})"

    @classmethod
    def is_holiday(cls, date, academic_year):
        """Check if a given date is a holiday"""
        return cls.objects.filter(
            date=date,
            academic_year=academic_year
        ).exists()


class AttendanceSummary(BaseModel):
    """
    Pre-calculated attendance summary for performance
    Updated via signals or periodic tasks
    """
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='attendance_summary'
    )
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE
    )
    month = models.DateField(help_text="First day of the month")
    
    # Counts
    total_days = models.PositiveIntegerField(default=0)
    present_days = models.PositiveIntegerField(default=0)
    absent_days = models.PositiveIntegerField(default=0)
    late_days = models.PositiveIntegerField(default=0)
    leave_days = models.PositiveIntegerField(default=0)
    
    # Percentage
    attendance_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    
    # Metadata
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-month', 'student']
        verbose_name = 'Attendance Summary'
        verbose_name_plural = 'Attendance Summaries'
        unique_together = ['student', 'academic_year', 'month']
        indexes = [
            models.Index(fields=['student', 'month']),
            models.Index(fields=['academic_year', 'month']),
        ]

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.month.strftime('%B %Y')} - {self.attendance_percentage}%"

    def calculate(self):
        """Calculate attendance summary"""
        # Get all attendance for the month
        start_date = self.month
        if self.month.month == 12:
            end_date = self.month.replace(year=self.month.year + 1, month=1, day=1)
        else:
            end_date = self.month.replace(month=self.month.month + 1, day=1)
        
        attendance_records = StudentAttendance.objects.filter(
            student=self.student,
            academic_year=self.academic_year,
            date__gte=start_date,
            date__lt=end_date
        )
        
        self.total_days = attendance_records.count()
        self.present_days = attendance_records.filter(status='PRESENT').count()
        self.absent_days = attendance_records.filter(status='ABSENT').count()
        self.late_days = attendance_records.filter(status='LATE').count()
        self.leave_days = attendance_records.filter(status='LEAVE').count()
        
        self.save()


class ClassAttendanceLog(BaseModel):
    """
    Log of attendance taking sessions to track completion and support offline sync
    """
    section = models.ForeignKey(
        'academics.Section',
        on_delete=models.CASCADE,
        related_name='attendance_logs'
    )
    date = models.DateField()
    period = models.ForeignKey(
        AttendancePeriod,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='class_attendance_logs'
    )
    
    # Sync details
    taken_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='taken_attendance_logs'
    )
    # taken_at (server time) provided by BaseModel created_at
    
    # Statistics
    total_students = models.PositiveIntegerField(default=0)
    present_count = models.PositiveIntegerField(default=0)
    absent_count = models.PositiveIntegerField(default=0)
    
    # For Idempotency and Conflict Resolution
    sync_id = models.UUIDField(default=uuid.uuid4, help_text="Unique ID for the sync batch from client")
    client_timestamp = models.DateTimeField(help_text="Timestamp when attendance was marked on client")
    version = models.PositiveIntegerField(default=1, help_text="Version number for conflict resolution")

    class Meta:
        ordering = ['-date', '-client_timestamp']
        verbose_name = 'Class Attendance Log'
        verbose_name_plural = 'Class Attendance Logs'
        unique_together = ['section', 'date', 'period']
        indexes = [
            models.Index(fields=['section', 'date']),
            models.Index(fields=['date', 'taken_by']),
        ]

    def __str__(self):
        period_str = f" - {self.period.name}" if self.period else ""
        return f"{self.section} - {self.date}{period_str}"
