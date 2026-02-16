"""
Reports & Analytics models for custom report building, templates, and scheduled generation.
"""

from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import SoftDeleteModel, TenantManager


class ReportTemplate(SoftDeleteModel):
    """
    Predefined or user-created report templates defining structure and data sources.
    """
    MODULE_CHOICES = [
        ('STUDENTS', 'Students'),
        ('ACADEMICS', 'Academics'),
        ('ATTENDANCE', 'Attendance'),
        ('FEE', 'Fee & Finance'),
        ('EXAM', 'Examinations'),
        ('LIBRARY', 'Library'),
        ('TRANSPORT', 'Transport'),
        ('HOSTEL', 'Hostel'),
        ('HR_PAYROLL', 'HR & Payroll'),
        ('ADMISSIONS', 'Admissions'),
        ('CUSTOM', 'Custom'),
    ]

    FORMAT_CHOICES = [
        ('PDF', 'PDF'),
        ('EXCEL', 'Excel'),
        ('CSV', 'CSV'),
    ]

    objects = TenantManager()

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    module = models.CharField(
        max_length=30,
        choices=MODULE_CHOICES,
        help_text='Module this report belongs to'
    )
    query_config = models.JSONField(
        default=dict,
        help_text='JSON configuration defining data source, filters, columns, and aggregations'
    )
    layout_config = models.JSONField(
        default=dict,
        blank=True,
        help_text='JSON configuration for report layout (headers, footers, grouping, etc.)'
    )
    default_format = models.CharField(
        max_length=10,
        choices=FORMAT_CHOICES,
        default='PDF'
    )
    is_system = models.BooleanField(
        default=False,
        help_text='System templates cannot be deleted by users'
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_report_templates'
    )

    class Meta:
        db_table = 'report_templates'
        ordering = ['module', 'name']
        verbose_name = 'Report Template'
        verbose_name_plural = 'Report Templates'
        indexes = [
            models.Index(fields=['module']),
            models.Index(fields=['is_system']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_module_display()})"


class GeneratedReport(SoftDeleteModel):
    """
    An instance of a generated report — stores the output file and metadata.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('GENERATING', 'Generating'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    FORMAT_CHOICES = [
        ('PDF', 'PDF'),
        ('EXCEL', 'Excel'),
        ('CSV', 'CSV'),
    ]

    objects = TenantManager()

    template = models.ForeignKey(
        ReportTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='instance_reports',
        help_text='Template used to generate this report (null if ad-hoc)'
    )
    name = models.CharField(
        max_length=300,
        help_text='Name/title of the generated report'
    )
    description = models.TextField(blank=True)
    module = models.CharField(
        max_length=30,
        choices=ReportTemplate.MODULE_CHOICES,
        help_text='Module this report belongs to'
    )
    parameters = models.JSONField(
        default=dict,
        help_text='Parameters/filters applied when generating this report'
    )
    output_format = models.CharField(
        max_length=10,
        choices=FORMAT_CHOICES,
        default='PDF'
    )
    file = models.FileField(
        upload_to='reports/generated/',
        null=True,
        blank=True,
        help_text='Generated report file'
    )
    file_size = models.PositiveIntegerField(
        default=0,
        help_text='File size in bytes'
    )
    row_count = models.PositiveIntegerField(
        default=0,
        help_text='Number of data rows in the report'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    error_message = models.TextField(
        blank=True,
        help_text='Error details if report generation failed'
    )
    generated_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='custom_generated_reports'
    )
    generated_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the report generation completed'
    )

    class Meta:
        db_table = 'report_generated'
        ordering = ['-created_at']
        verbose_name = 'Generated Report'
        verbose_name_plural = 'Generated Reports'
        indexes = [
            models.Index(fields=['module']),
            models.Index(fields=['status']),
            models.Index(fields=['generated_by']),
        ]

    def __str__(self):
        return f"{self.name} - {self.get_status_display()} ({self.get_output_format_display()})"


class ReportSchedule(SoftDeleteModel):
    """
    Scheduled report generation — automatically generates reports at specified intervals.
    """
    FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('YEARLY', 'Yearly'),
    ]

    DAY_OF_WEEK_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    objects = TenantManager()

    template = models.ForeignKey(
        ReportTemplate,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    name = models.CharField(max_length=200)
    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES
    )
    day_of_week = models.IntegerField(
        choices=DAY_OF_WEEK_CHOICES,
        null=True,
        blank=True,
        help_text='Day of week for weekly schedules (0=Monday)'
    )
    day_of_month = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)],
        help_text='Day of month for monthly/quarterly/yearly schedules'
    )
    time_of_day = models.TimeField(
        help_text='Time of day to generate the report'
    )
    output_format = models.CharField(
        max_length=10,
        choices=GeneratedReport.FORMAT_CHOICES,
        default='PDF'
    )
    parameters = models.JSONField(
        default=dict,
        help_text='Fixed parameters to apply each time the report is generated'
    )
    email_recipients = models.JSONField(
        default=list,
        blank=True,
        help_text='List of email addresses to send generated reports to'
    )
    is_active = models.BooleanField(default=True)
    last_run = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When this schedule was last executed'
    )
    next_run = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When this schedule will next execute'
    )
    created_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='report_schedules'
    )

    class Meta:
        db_table = 'report_schedules'
        ordering = ['name']
        verbose_name = 'Report Schedule'
        verbose_name_plural = 'Report Schedules'
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['next_run']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_frequency_display()}) - {'Active' if self.is_active else 'Inactive'}"


class SavedReport(SoftDeleteModel):
    """
    User-saved/bookmarked reports for quick access.
    Links a user to a generated report or template with custom parameters.
    """
    objects = TenantManager()

    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.CASCADE,
        related_name='saved_reports'
    )
    name = models.CharField(max_length=200)
    template = models.ForeignKey(
        ReportTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='saved_by_users'
    )
    parameters = models.JSONField(
        default=dict,
        help_text='Saved filter/parameter configuration'
    )
    output_format = models.CharField(
        max_length=10,
        choices=GeneratedReport.FORMAT_CHOICES,
        default='PDF'
    )
    is_pinned = models.BooleanField(
        default=False,
        help_text='Whether this report is pinned to dashboard'
    )

    class Meta:
        db_table = 'report_saved'
        ordering = ['-is_pinned', 'name']
        verbose_name = 'Saved Report'
        verbose_name_plural = 'Saved Reports'

    def __str__(self):
        return f"{self.user} - {self.name}"
