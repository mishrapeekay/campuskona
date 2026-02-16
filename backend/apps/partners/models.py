"""
Partner Commission Tracking Models

This module handles lead generation partners and their commission tracking.
Partners submit leads, earn commissions on conversions, and receive payouts.
"""

import uuid
from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Partner(models.Model):
    """
    Lead generation partners who refer schools to the platform.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Partner Information
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    company_name = models.CharField(max_length=255, blank=True)
    
    # Partner Code (unique referral code)
    partner_code = models.CharField(
        max_length=20,
        unique=True,
        help_text='Unique code for tracking referrals (e.g., PARTNER001)'
    )
    
    # Commission Structure
    COMMISSION_TYPE_CHOICES = [
        ('PERCENTAGE', 'Percentage of Subscription'),
        ('FLAT', 'Flat Amount per Conversion'),
        ('TIERED', 'Tiered Based on Volume'),
    ]
    commission_type = models.CharField(
        max_length=20,
        choices=COMMISSION_TYPE_CHOICES,
        default='PERCENTAGE'
    )
    
    # For PERCENTAGE type
    commission_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Commission percentage (0-100)'
    )
    
    # For FLAT type
    flat_commission_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    # Payment Details
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    ifsc_code = models.CharField(max_length=11, blank=True)
    pan_number = models.CharField(max_length=10, blank=True)
    gst_number = models.CharField(max_length=15, blank=True)
    
    # UPI for quick payments
    upi_id = models.CharField(max_length=100, blank=True)
    
    # Status
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('SUSPENDED', 'Suspended'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Statistics (denormalized for performance)
    total_leads = models.IntegerField(default=0)
    total_conversions = models.IntegerField(default=0)
    total_commission_earned = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    total_commission_paid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    
    # Timestamps
    joined_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'public_partners'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['partner_code']),
            models.Index(fields=['email']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.partner_code})"
    
    @property
    def conversion_rate(self):
        """Calculate conversion rate percentage."""
        if self.total_leads == 0:
            return 0
        return round((self.total_conversions / self.total_leads) * 100, 2)
    
    @property
    def pending_commission(self):
        """Calculate pending commission amount."""
        return self.total_commission_earned - self.total_commission_paid


class Lead(models.Model):
    """
    Leads submitted by partners.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    partner = models.ForeignKey(
        Partner,
        on_delete=models.CASCADE,
        related_name='leads'
    )
    
    # School Information
    school_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    
    # Lead Details
    estimated_students = models.IntegerField(
        null=True,
        blank=True,
        help_text='Estimated number of students'
    )
    board = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    
    # Lead Status
    STATUS_CHOICES = [
        ('NEW', 'New Lead'),
        ('CONTACTED', 'Contacted'),
        ('DEMO_SCHEDULED', 'Demo Scheduled'),
        ('DEMO_COMPLETED', 'Demo Completed'),
        ('NEGOTIATION', 'In Negotiation'),
        ('CONVERTED', 'Converted'),
        ('LOST', 'Lost'),
        ('INVALID', 'Invalid Lead'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    
    # Conversion Tracking
    converted_school = models.ForeignKey(
        'tenants.School',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_lead'
    )
    conversion_date = models.DateTimeField(null=True, blank=True)
    
    # Lost Reason (if applicable)
    LOST_REASON_CHOICES = [
        ('PRICE', 'Price Too High'),
        ('FEATURES', 'Missing Features'),
        ('COMPETITOR', 'Chose Competitor'),
        ('NOT_READY', 'Not Ready to Buy'),
        ('NO_RESPONSE', 'No Response'),
        ('OTHER', 'Other'),
    ]
    lost_reason = models.CharField(
        max_length=20,
        choices=LOST_REASON_CHOICES,
        blank=True
    )
    lost_notes = models.TextField(blank=True)
    
    # Assignment
    assigned_to = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_leads',
        help_text='Sales person assigned to this lead'
    )
    
    # Timestamps
    submitted_date = models.DateTimeField(auto_now_add=True)
    last_contacted_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'public_leads'
        ordering = ['-submitted_date']
        indexes = [
            models.Index(fields=['partner', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['email']),
            models.Index(fields=['converted_school']),
        ]
    
    def __str__(self):
        return f"{self.school_name} - {self.get_status_display()}"
    
    def mark_as_converted(self, school):
        """Mark lead as converted and link to school."""
        self.status = 'CONVERTED'
        self.converted_school = school
        self.conversion_date = timezone.now()
        self.save()
        
        # Update partner statistics
        self.partner.total_conversions += 1
        self.partner.save()


class CommissionRule(models.Model):
    """
    Commission calculation rules for different scenarios.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Applicability
    partner = models.ForeignKey(
        Partner,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='custom_rules',
        help_text='Leave blank for global rule'
    )
    
    # Subscription Tier Filter
    subscription_tier = models.CharField(
        max_length=20,
        blank=True,
        help_text='Apply only to specific subscription tier (BASIC, STANDARD, PREMIUM, ENTERPRISE)'
    )
    
    # Commission Calculation
    CALCULATION_TYPE_CHOICES = [
        ('PERCENTAGE', 'Percentage of Subscription'),
        ('FLAT', 'Flat Amount'),
        ('PERCENTAGE_RECURRING', 'Percentage for Recurring Months'),
    ]
    calculation_type = models.CharField(
        max_length=30,
        choices=CALCULATION_TYPE_CHOICES,
        default='PERCENTAGE'
    )
    
    commission_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    flat_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    # Recurring Commission
    recurring_months = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Number of months to pay recurring commission (0 = one-time only)'
    )
    
    # Priority (higher number = higher priority)
    priority = models.IntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Validity Period
    valid_from = models.DateField(null=True, blank=True)
    valid_until = models.DateField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'public_commission_rules'
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_calculation_type_display()}"
    
    def is_valid_now(self):
        """Check if rule is currently valid."""
        if not self.is_active:
            return False
        
        today = timezone.now().date()
        
        if self.valid_from and today < self.valid_from:
            return False
        
        if self.valid_until and today > self.valid_until:
            return False
        
        return True


class Commission(models.Model):
    """
    Commission records for partner conversions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    partner = models.ForeignKey(
        Partner,
        on_delete=models.CASCADE,
        related_name='commissions'
    )
    
    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name='commissions'
    )
    
    school = models.ForeignKey(
        'tenants.School',
        on_delete=models.CASCADE,
        related_name='partner_commissions'
    )
    
    # Commission Details
    subscription_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Original subscription amount'
    )
    
    commission_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    commission_rule = models.ForeignKey(
        CommissionRule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applied_commissions'
    )
    
    # Commission Type
    COMMISSION_TYPE_CHOICES = [
        ('INITIAL', 'Initial Conversion'),
        ('RECURRING', 'Recurring Monthly'),
        ('RENEWAL', 'Subscription Renewal'),
        ('UPGRADE', 'Plan Upgrade'),
    ]
    commission_type = models.CharField(
        max_length=20,
        choices=COMMISSION_TYPE_CHOICES,
        default='INITIAL'
    )
    
    # Period (for recurring commissions)
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    
    # Status
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('PAID', 'Paid'),
        ('CANCELLED', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Payment Reference
    payout = models.ForeignKey(
        'Payout',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='commissions'
    )
    
    # Notes
    notes = models.TextField(blank=True)
    
    # Timestamps
    earned_date = models.DateField(auto_now_add=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    paid_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'public_commissions'
        ordering = ['-earned_date']
        indexes = [
            models.Index(fields=['partner', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['earned_date']),
        ]
    
    def __str__(self):
        return f"{self.partner.name} - ₹{self.commission_amount} ({self.get_status_display()})"
    
    def approve(self):
        """Approve commission for payout."""
        self.status = 'APPROVED'
        self.approved_date = timezone.now()
        self.save()
    
    def mark_as_paid(self, payout):
        """Mark commission as paid."""
        self.status = 'PAID'
        self.payout = payout
        self.paid_date = timezone.now()
        self.save()
        
        # Update partner statistics
        self.partner.total_commission_paid += self.commission_amount
        self.partner.save()


class Payout(models.Model):
    """
    Payout batches for partner commissions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    partner = models.ForeignKey(
        Partner,
        on_delete=models.CASCADE,
        related_name='payouts'
    )
    
    # Payout Details
    payout_number = models.CharField(
        max_length=50,
        unique=True,
        help_text='Unique payout reference number (e.g., PAY-2026-01-001)'
    )
    
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    commission_count = models.IntegerField(
        default=0,
        help_text='Number of commissions included in this payout'
    )
    
    # Period
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Payment Details
    PAYMENT_METHOD_CHOICES = [
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('UPI', 'UPI'),
        ('CHEQUE', 'Cheque'),
        ('CASH', 'Cash'),
    ]
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='BANK_TRANSFER'
    )
    
    transaction_reference = models.CharField(max_length=100, blank=True)
    
    # Status
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    
    # Tax Deduction
    tds_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='TDS percentage deducted'
    )
    
    tds_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    net_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text='Amount after TDS deduction'
    )
    
    # Documents
    invoice_url = models.URLField(blank=True)
    payment_receipt_url = models.URLField(blank=True)
    
    # Notes
    notes = models.TextField(blank=True)
    
    # Timestamps
    payout_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_payouts'
    )
    
    class Meta:
        db_table = 'public_payouts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['partner', 'status']),
            models.Index(fields=['payout_number']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.payout_number} - {self.partner.name} - ₹{self.total_amount}"
    
    def calculate_tds(self):
        """Calculate TDS amount based on percentage."""
        self.tds_amount = (self.total_amount * self.tds_percentage) / 100
        self.net_amount = self.total_amount - self.tds_amount
        self.save()
    
    def process_payout(self):
        """Process the payout and mark commissions as paid."""
        if self.status != 'PENDING':
            return False
        
        self.status = 'PROCESSING'
        self.save()
        
        # Mark all associated commissions as paid
        for commission in self.commissions.all():
            commission.mark_as_paid(self)
        
        self.status = 'COMPLETED'
        self.payout_date = timezone.now().date()
        self.save()
        
        return True
