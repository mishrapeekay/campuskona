from django.db import models
from apps.core.models import BaseModel, TenantManager

class ReportGeneration(BaseModel):
    """
    Tracks generation of government reports (UDISE+, RTE, etc.)
    """
    REPORT_TYPES = [
        ('UDISE_PLUS', 'UDISE+ Report'),
        ('RTE_ADMISSIONS', 'RTE Admissions Report'),
        ('RTE_FEES', 'RTE Fee Concessions'),
        ('BOARD_EXPORT', 'Board Exam Export'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('GENERATING', 'Generating'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    academic_year = models.CharField(max_length=9, help_text="YYYY-YYYY")
    generated_file = models.FileField(upload_to='government_reports/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    error_message = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True) # Params used (e.g., date range)
    generated_format = models.CharField(max_length=10, choices=[('EXCEL', 'Excel'), ('PDF', 'PDF')], default='EXCEL')
    
    created_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_gov_reports'
    )

    objects = TenantManager()

    class Meta:
        db_table = 'government_report_generations'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_report_type_display()} - {self.academic_year}"

class RTEComplianceRecord(BaseModel):
    """
    Tracks specific RTE compliance details per academic year.
    Ensures 25% reservation compliance tracking.
    """
    academic_year = models.CharField(max_length=9)
    total_intake_capacity = models.IntegerField(help_text="Total Entry Level Seats")
    reserved_seats_rte = models.IntegerField(help_text="25% Reserved Seats")
    seats_filled_rte = models.IntegerField(default=0)
    
    # Audit fields
    verification_status = models.CharField(
        max_length=20, 
        choices=[('PENDING', 'Pending'), ('VERIFIED', 'Verified'), ('FLAGGED', 'Flagged')],
        default='PENDING'
    )
    verified_by = models.ForeignKey(
        'authentication.User', 
        null=True, 
        blank=True,
        on_delete=models.SET_NULL,
        related_name='verified_rte_records'
    )
    verification_date = models.DateTimeField(null=True, blank=True)
    remarks = models.TextField(blank=True)

    objects = TenantManager()

    class Meta:
        db_table = 'rte_compliance_records'
        ordering = ['-academic_year']

    def __str__(self):
        return f"RTE Compliance {self.academic_year}"

    @property
    def compliance_percentage(self):
        if self.reserved_seats_rte == 0:
            return 0
        return (self.seats_filled_rte / self.reserved_seats_rte) * 100

class UDISECodeMapping(BaseModel):
    """
    Maps internal system values to UDISE+ codes.
    Example: Internal Gender 'Male' -> UDISE Code '1'
    """
    CATEGORY_CHOICES = [
        ('GENDER', 'Gender'),
        ('SOCIAL_CATEGORY', 'Social Category'),
        ('RELIGION', 'Religion'),
        ('DISABILITY', 'Disability Type'),
        ('MEDIUM_OF_INSTRUCTION', 'Medium of Instruction'),
    ]

    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    internal_value = models.CharField(max_length=100, help_text="Value in our system (e.g., 'M', 'SC')")
    udise_code = models.CharField(max_length=50, help_text="Corresponding UDISE+ Code")
    udise_description = models.CharField(max_length=255, blank=True, help_text="Description as per UDISE manual")

    objects = TenantManager()

    class Meta:
        db_table = 'udise_code_mappings'
        unique_together = ['category', 'internal_value']
        ordering = ['category', 'internal_value']

    def __str__(self):
        return f"{self.get_category_display()}: {self.internal_value} -> {self.udise_code}"
