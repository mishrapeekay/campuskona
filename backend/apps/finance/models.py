"""
Finance models for managing fees, payments, and expenses
"""

from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
from apps.core.models import BaseModel


class FeeCategory(BaseModel):
    """
    Fee categories (e.g., Tuition, Transport, Library)
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    is_mandatory = models.BooleanField(
        default=True,
        help_text='Whether this fee is mandatory for all students'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'finance_fee_categories'
        ordering = ['name']
        verbose_name = 'Fee Category'
        verbose_name_plural = 'Fee Categories'

    def __str__(self):
        return self.name


class FeeStructure(BaseModel):
    """
    Fee structure for different classes/academic years
    """
    FREQUENCY_CHOICES = [
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('HALF_YEARLY', 'Half Yearly'),
        ('ANNUAL', 'Annual'),
        ('ONE_TIME', 'One Time'),
    ]

    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='fee_structures'
    )
    class_obj = models.ForeignKey(
        'academics.Class',
        on_delete=models.CASCADE,
        related_name='fee_structures'
    )
    fee_category = models.ForeignKey(
        FeeCategory,
        on_delete=models.CASCADE,
        related_name='fee_structures'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES,
        default='ANNUAL'
    )
    due_day = models.IntegerField(
        null=True,
        blank=True,
        help_text='Day of month when fee is due (for recurring fees)'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'finance_fee_structures'
        ordering = ['academic_year', 'class_obj', 'fee_category']
        verbose_name = 'Fee Structure'
        verbose_name_plural = 'Fee Structures'
        unique_together = [['academic_year', 'class_obj', 'fee_category']]
        indexes = [
            models.Index(fields=['academic_year', 'class_obj']),
        ]

    def __str__(self):
        return f"{self.fee_category.name} - {self.class_obj.name} - {self.academic_year.name}"


class StudentFee(BaseModel):
    """
    Fee assigned to individual students
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PARTIAL', 'Partially Paid'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('WAIVED', 'Waived'),
        ('CANCELLED', 'Cancelled'),
    ]

    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='fees'
    )
    fee_structure = models.ForeignKey(
        FeeStructure,
        on_delete=models.CASCADE,
        related_name='student_fees'
    )
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='student_fees'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    discount_reason = models.TextField(blank=True)
    final_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    paid_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    due_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'finance_student_fees'
        ordering = ['-due_date']
        verbose_name = 'Student Fee'
        verbose_name_plural = 'Student Fees'
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['due_date']),
            models.Index(fields=['academic_year']),
        ]

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.fee_structure.fee_category.name} - {self.final_amount}"

    def save(self, *args, **kwargs):
        """Calculate final amount and update status"""
        # Calculate final amount
        self.final_amount = self.amount - self.discount_amount
        
        # Update status based on payment
        if self.paid_amount >= self.final_amount:
            self.status = 'PAID'
        elif self.paid_amount > 0:
            self.status = 'PARTIAL'
        elif self.due_date < timezone.now().date() and self.status == 'PENDING':
            self.status = 'OVERDUE'
        
        super().save(*args, **kwargs)

    @property
    def balance_amount(self):
        """Calculate remaining balance"""
        return self.final_amount - self.paid_amount


class Payment(BaseModel):
    """
    Payment transactions
    """
    PAYMENT_METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('CHEQUE', 'Cheque'),
        ('CARD', 'Credit/Debit Card'),
        ('ONLINE', 'Online Transfer'),
        ('UPI', 'UPI'),
        ('BANK_TRANSFER', 'Bank Transfer'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
        ('CANCELLED', 'Cancelled'),
    ]

    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='payments'
    )
    receipt_number = models.CharField(
        max_length=50,
        unique=True,
        help_text='Unique receipt number'
    )
    payment_date = models.DateField(default=timezone.now)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES
    )
    transaction_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True,
        help_text='Bank/Gateway transaction ID'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='COMPLETED'
    )
    remarks = models.TextField(blank=True)
    received_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='payments_received'
    )

    class Meta:
        db_table = 'finance_payments'
        ordering = ['-payment_date']
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        indexes = [
            models.Index(fields=['student', 'payment_date']),
            models.Index(fields=['receipt_number']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.receipt_number} - {self.student.get_full_name()} - {self.amount}"


class PaymentAllocation(BaseModel):
    """
    Allocation of payment to specific fees
    """
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='allocations'
    )
    student_fee = models.ForeignKey(
        StudentFee,
        on_delete=models.CASCADE,
        related_name='payment_allocations'
    )
    allocated_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    class Meta:
        db_table = 'finance_payment_allocations'
        ordering = ['payment', 'student_fee']
        verbose_name = 'Payment Allocation'
        verbose_name_plural = 'Payment Allocations'

    def __str__(self):
        return f"{self.payment.receipt_number} - {self.allocated_amount}"

    def save(self, *args, **kwargs):
        """Update student fee paid amount"""
        super().save(*args, **kwargs)
        
        # Update student fee paid amount
        total_paid = self.student_fee.payment_allocations.aggregate(
            total=models.Sum('allocated_amount')
        )['total'] or 0
        
        self.student_fee.paid_amount = total_paid
        self.student_fee.save()


class Expense(BaseModel):
    """
    School expenses
    """
    CATEGORY_CHOICES = [
        ('SALARY', 'Salary & Wages'),
        ('UTILITIES', 'Utilities'),
        ('MAINTENANCE', 'Maintenance'),
        ('SUPPLIES', 'Supplies & Materials'),
        ('TRANSPORT', 'Transport'),
        ('MARKETING', 'Marketing'),
        ('INFRASTRUCTURE', 'Infrastructure'),
        ('OTHER', 'Other'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('PAID', 'Paid'),
        ('REJECTED', 'Rejected'),
    ]

    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    expense_date = models.DateField(default=timezone.now)
    description = models.TextField()
    vendor_name = models.CharField(max_length=200, blank=True)
    invoice_number = models.CharField(max_length=100, blank=True)
    payment_method = models.CharField(
        max_length=20,
        choices=Payment.PAYMENT_METHOD_CHOICES,
        blank=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    approved_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses_approved'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='expenses_created'
    )
    attachment = models.FileField(
        upload_to='expenses/',
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'finance_expenses'
        ordering = ['-expense_date']
        verbose_name = 'Expense'
        verbose_name_plural = 'Expenses'
        indexes = [
            models.Index(fields=['category', 'expense_date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.title} - {self.amount}"


class Invoice(BaseModel):
    """
    Fee invoices for students
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent'),
        ('PAID', 'Paid'),
        ('PARTIAL', 'Partially Paid'),
        ('OVERDUE', 'Overdue'),
        ('CANCELLED', 'Cancelled'),
    ]

    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='invoices'
    )
    invoice_number = models.CharField(max_length=50, unique=True)
    invoice_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    paid_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )
    notes = models.TextField(blank=True)
    generated_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='invoices_generated'
    )

    class Meta:
        db_table = 'finance_invoices'
        ordering = ['-invoice_date']
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['invoice_number']),
        ]

    def __str__(self):
        return f"{self.invoice_number} - {self.student.get_full_name()}"

    @property
    def balance_amount(self):
        """Calculate remaining balance"""
        return self.total_amount - self.paid_amount


class InvoiceItem(BaseModel):
    """
    Line items in an invoice
    """
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='items'
    )
    student_fee = models.ForeignKey(
        StudentFee,
        on_delete=models.CASCADE,
        related_name='invoice_items'
    )
    description = models.CharField(max_length=200)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    class Meta:
        db_table = 'finance_invoice_items'
        ordering = ['invoice']
        verbose_name = 'Invoice Item'
        verbose_name_plural = 'Invoice Items'

    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.description}"
