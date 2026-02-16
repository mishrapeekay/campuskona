"""
HR & Payroll models for managing departments, designations, salary structures, and payroll processing.
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import SoftDeleteModel, TenantManager


class Department(SoftDeleteModel):
    """
    Organizational departments (e.g., Science, Administration, Sports)
    """
    objects = TenantManager()

    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    head = models.ForeignKey(
        'staff.StaffMember',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='headed_departments',
        help_text='Department head (staff member)'
    )
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'hr_departments'
        ordering = ['name']
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'

    def __str__(self):
        return f"{self.name} ({self.code})"


class Designation(SoftDeleteModel):
    """
    Job designations/titles within departments
    """
    objects = TenantManager()

    name = models.CharField(max_length=200)
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='designations'
    )
    grade_level = models.CharField(
        max_length=50,
        blank=True,
        help_text='Pay grade or level (e.g., L1, L2, Grade-A)'
    )
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'hr_designations'
        ordering = ['department', 'name']
        verbose_name = 'Designation'
        verbose_name_plural = 'Designations'

    def __str__(self):
        return f"{self.name} - {self.department.name}"


class SalaryComponent(SoftDeleteModel):
    """
    Reusable salary components (e.g., Basic Pay, HRA, PF, Tax)
    """
    COMPONENT_TYPE_CHOICES = [
        ('EARNING', 'Earning'),
        ('DEDUCTION', 'Deduction'),
    ]

    CALCULATION_TYPE_CHOICES = [
        ('FIXED', 'Fixed Amount'),
        ('PERCENTAGE', 'Percentage of Basic'),
    ]

    objects = TenantManager()

    name = models.CharField(max_length=200)
    component_type = models.CharField(
        max_length=20,
        choices=COMPONENT_TYPE_CHOICES
    )
    calculation_type = models.CharField(
        max_length=20,
        choices=CALCULATION_TYPE_CHOICES,
        default='FIXED'
    )
    is_taxable = models.BooleanField(
        default=False,
        help_text='Whether this component is taxable'
    )
    is_mandatory = models.BooleanField(
        default=False,
        help_text='Whether this component is mandatory for all staff'
    )
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'hr_salary_components'
        ordering = ['component_type', 'name']
        verbose_name = 'Salary Component'
        verbose_name_plural = 'Salary Components'

    def __str__(self):
        return f"{self.name} ({self.get_component_type_display()})"


class SalaryStructure(SoftDeleteModel):
    """
    Salary structure assigned to a staff member, linking them to salary components.
    """
    objects = TenantManager()

    staff = models.ForeignKey(
        'staff.StaffMember',
        on_delete=models.CASCADE,
        related_name='salary_structures'
    )
    effective_from = models.DateField(
        help_text='Date from which this salary structure is effective'
    )
    components = models.ManyToManyField(
        SalaryComponent,
        through='SalaryStructureComponent',
        related_name='salary_structures'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'hr_salary_structures'
        ordering = ['-effective_from']
        verbose_name = 'Salary Structure'
        verbose_name_plural = 'Salary Structures'
        indexes = [
            models.Index(fields=['staff', 'is_active']),
        ]

    def __str__(self):
        return f"{self.staff} - Effective {self.effective_from}"

    @property
    def total_earnings(self):
        """Calculate total earnings from all earning components."""
        return self.structure_components.filter(
            component__component_type='EARNING'
        ).aggregate(total=models.Sum('amount'))['total'] or 0

    @property
    def total_deductions(self):
        """Calculate total deductions from all deduction components."""
        return self.structure_components.filter(
            component__component_type='DEDUCTION'
        ).aggregate(total=models.Sum('amount'))['total'] or 0


class SalaryStructureComponent(SoftDeleteModel):
    """
    Through model linking a SalaryStructure to its SalaryComponents with amounts.
    """
    objects = TenantManager()

    salary_structure = models.ForeignKey(
        SalaryStructure,
        on_delete=models.CASCADE,
        related_name='structure_components'
    )
    component = models.ForeignKey(
        SalaryComponent,
        on_delete=models.CASCADE,
        related_name='structure_assignments'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Fixed amount for this component'
    )
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Percentage of basic salary (used when calculation_type is PERCENTAGE)'
    )
    formula = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        help_text='Custom formula for calculation (optional)'
    )

    class Meta:
        db_table = 'hr_salary_structure_components'
        ordering = ['salary_structure', 'component']
        verbose_name = 'Salary Structure Component'
        verbose_name_plural = 'Salary Structure Components'
        unique_together = [['salary_structure', 'component']]

    def __str__(self):
        return f"{self.salary_structure} - {self.component.name}: {self.amount}"


class PayrollRun(SoftDeleteModel):
    """
    Represents a payroll processing run for a given month/year.
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    objects = TenantManager()

    month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)]
    )
    year = models.IntegerField(
        validators=[MinValueValidator(2000), MaxValueValidator(2100)]
    )
    run_date = models.DateField(
        help_text='Date when the payroll was processed'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )
    processed_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payroll_runs_processed'
    )
    total_gross = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    total_deductions = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    total_net = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'hr_payroll_runs'
        ordering = ['-year', '-month']
        verbose_name = 'Payroll Run'
        verbose_name_plural = 'Payroll Runs'
        unique_together = [['month', 'year']]
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['year', 'month']),
        ]

    def __str__(self):
        return f"Payroll {self.month:02d}/{self.year} - {self.get_status_display()}"


class Payslip(SoftDeleteModel):
    """
    Individual payslip for a staff member within a payroll run.
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('GENERATED', 'Generated'),
        ('APPROVED', 'Approved'),
        ('PAID', 'Paid'),
    ]

    PAYMENT_MODE_CHOICES = [
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('CHEQUE', 'Cheque'),
        ('CASH', 'Cash'),
    ]

    objects = TenantManager()

    payroll_run = models.ForeignKey(
        PayrollRun,
        on_delete=models.CASCADE,
        related_name='payslips'
    )
    staff = models.ForeignKey(
        'staff.StaffMember',
        on_delete=models.CASCADE,
        related_name='payslips'
    )
    month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)]
    )
    year = models.IntegerField(
        validators=[MinValueValidator(2000), MaxValueValidator(2100)]
    )
    working_days = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(31)]
    )
    present_days = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(31)]
    )
    leave_days = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(31)]
    )
    gross_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    total_deductions = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    net_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )
    payment_date = models.DateField(
        null=True,
        blank=True,
        help_text='Date of actual salary payment'
    )
    payment_mode = models.CharField(
        max_length=20,
        choices=PAYMENT_MODE_CHOICES,
        default='BANK_TRANSFER'
    )
    transaction_reference = models.CharField(
        max_length=200,
        blank=True,
        help_text='Bank transaction reference or cheque number'
    )

    class Meta:
        db_table = 'hr_payslips'
        ordering = ['-year', '-month', 'staff']
        verbose_name = 'Payslip'
        verbose_name_plural = 'Payslips'
        unique_together = [['payroll_run', 'staff']]
        indexes = [
            models.Index(fields=['staff', 'year', 'month']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.staff} - {self.month:02d}/{self.year} - {self.get_status_display()}"


class PayslipComponent(SoftDeleteModel):
    """
    Individual earning/deduction line item within a payslip.
    """
    COMPONENT_TYPE_CHOICES = [
        ('EARNING', 'Earning'),
        ('DEDUCTION', 'Deduction'),
    ]

    objects = TenantManager()

    payslip = models.ForeignKey(
        Payslip,
        on_delete=models.CASCADE,
        related_name='components'
    )
    component = models.ForeignKey(
        SalaryComponent,
        on_delete=models.CASCADE,
        related_name='payslip_entries'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    component_type = models.CharField(
        max_length=20,
        choices=COMPONENT_TYPE_CHOICES
    )

    class Meta:
        db_table = 'hr_payslip_components'
        ordering = ['payslip', 'component_type', 'component']
        verbose_name = 'Payslip Component'
        verbose_name_plural = 'Payslip Components'

    def __str__(self):
        return f"{self.payslip} - {self.component.name}: {self.amount}"
