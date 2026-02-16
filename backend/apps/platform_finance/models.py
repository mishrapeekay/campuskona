"""
Platform Finance Models
=======================
Handles company-level financial management for VedaTechno:
1. Investor Financial Dashboard
2. Financial Segregation & Audit Layer
3. Integration with Partner Commission Engine

All models are in PUBLIC schema for cross-tenant visibility.
"""

import uuid
from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.db.models import Sum, Q, F
import hashlib
import json

User = get_user_model()


# ============================================================================
# INVESTOR DASHBOARD MODELS
# ============================================================================

class InvestorMetric(models.Model):
    """
    Daily snapshot of key investor metrics (MRR, ARR, Churn, CAC, LTV)
    Stored in public schema for historical tracking
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Snapshot metadata
    snapshot_date = models.DateField(unique=True, db_index=True)
    calculated_at = models.DateTimeField(auto_now_add=True)
    
    # Revenue Metrics
    mrr = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        help_text="Monthly Recurring Revenue"
    )
    arr = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        help_text="Annual Recurring Revenue (MRR * 12)"
    )
    
    # School Metrics
    total_schools = models.IntegerField(default=0)
    active_schools = models.IntegerField(default=0)
    new_schools_this_month = models.IntegerField(default=0)
    churned_schools_this_month = models.IntegerField(default=0)
    
    # Churn & Growth
    churn_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Percentage of schools churned"
    )
    growth_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        help_text="Month-over-month growth percentage"
    )
    
    # Customer Economics
    cac = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        help_text="Customer Acquisition Cost"
    )
    ltv = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        help_text="Lifetime Value per school"
    )
    ltv_cac_ratio = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        help_text="LTV:CAC ratio (should be > 3)"
    )
    
    # Regional Distribution (JSON)
    region_distribution = models.JSONField(
        default=dict,
        help_text="State-wise school count: {'Maharashtra': 40, 'Delhi': 30}"
    )
    
    # Tier Distribution
    tier_distribution = models.JSONField(
        default=dict,
        help_text="Subscription tier breakdown"
    )
    
    class Meta:
        db_table = 'public_investor_metrics'
        ordering = ['-snapshot_date']
        indexes = [
            models.Index(fields=['-snapshot_date']),
            models.Index(fields=['calculated_at']),
        ]
        verbose_name = 'Investor Metric Snapshot'
        verbose_name_plural = 'Investor Metric Snapshots'
    
    def __str__(self):
        return f"Metrics for {self.snapshot_date} - MRR: ₹{self.mrr}"
    
    def save(self, *args, **kwargs):
        """Auto-calculate derived metrics"""
        self.arr = self.mrr * 12
        if self.cac > 0:
            self.ltv_cac_ratio = self.ltv / self.cac
        super().save(*args, **kwargs)


class MarketingSpend(models.Model):
    """Track marketing spend for CAC calculation"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    month = models.DateField(db_index=True)
    
    # Spend Categories
    digital_marketing = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    events_conferences = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    content_marketing = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    partner_incentives = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sales_team_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_expenses = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    total_spend = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'public_marketing_spend'
        ordering = ['-month']
        unique_together = ['month']
        verbose_name = 'Marketing Spend'
        verbose_name_plural = 'Marketing Spend Records'
    
    def __str__(self):
        return f"Marketing Spend - {self.month.strftime('%B %Y')}: ₹{self.total_spend}"
    
    def save(self, *args, **kwargs):
        """Auto-calculate total spend"""
        self.total_spend = (
            self.digital_marketing + 
            self.events_conferences + 
            self.content_marketing + 
            self.partner_incentives + 
            self.sales_team_cost + 
            self.other_expenses
        )
        super().save(*args, **kwargs)


class InvestorProfile(models.Model):
    """Investor information and access control"""
    INVESTOR_TYPE_CHOICES = [
        ('ANGEL', 'Angel Investor'),
        ('VC', 'Venture Capital'),
        ('PE', 'Private Equity'),
        ('STRATEGIC', 'Strategic Investor'),
        ('ADVISOR', 'Advisor/Board Member'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='investor_profile')
    
    # Investor Details
    investor_name = models.CharField(max_length=200)
    investor_type = models.CharField(max_length=20, choices=INVESTOR_TYPE_CHOICES)
    firm_name = models.CharField(max_length=200, blank=True)
    
    # Investment Details
    investment_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    investment_date = models.DateField(null=True, blank=True)
    equity_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Access Control
    dashboard_access = models.BooleanField(default=True)
    financial_reports_access = models.BooleanField(default=True)
    board_member = models.BooleanField(default=False)
    
    # Contact
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'public_investor_profiles'
        ordering = ['-investment_date']
        verbose_name = 'Investor Profile'
        verbose_name_plural = 'Investor Profiles'
    
    def __str__(self):
        return f"{self.investor_name} ({self.get_investor_type_display()})"


# ============================================================================
# FINANCIAL SEGREGATION & AUDIT LAYER
# ============================================================================

class FinancialLedger(models.Model):
    """
    Immutable financial ledger for all platform transactions
    Blockchain-inspired design with hash chain for audit trail
    """
    TRANSACTION_TYPE_CHOICES = [
        # Platform Revenue
        ('PLATFORM_SUBSCRIPTION', 'Platform Subscription Revenue'),
        ('PLATFORM_SETUP_FEE', 'Platform Setup Fee'),
        ('PLATFORM_ADDON', 'Platform Add-on Revenue'),
        
        # School Collections (Pass-through)
        ('SCHOOL_FEE_COLLECTION', 'School Fee Collection'),
        ('SCHOOL_OTHER_INCOME', 'School Other Income'),
        
        # Partner Commissions
        ('PARTNER_COMMISSION', 'Partner Commission Payout'),
        ('PARTNER_TDS', 'Partner TDS Deduction'),
        
        # Investor Payouts
        ('INVESTOR_DIVIDEND', 'Investor Dividend'),
        ('INVESTOR_RETURN', 'Investor Return on Investment'),
        
        # Platform Expenses
        ('PLATFORM_EXPENSE', 'Platform Operating Expense'),
        ('MARKETING_EXPENSE', 'Marketing Expense'),
        ('SALARY_EXPENSE', 'Salary Expense'),
    ]
    
    CATEGORY_CHOICES = [
        ('PLATFORM_REVENUE', 'Platform Revenue'),
        ('SCHOOL_COLLECTION', 'School Collection'),
        ('PARTNER_PAYOUT', 'Partner Payout'),
        ('INVESTOR_PAYOUT', 'Investor Payout'),
        ('PLATFORM_EXPENSE', 'Platform Expense'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Ledger Chain (Blockchain-inspired)
    sequence_number = models.BigIntegerField(unique=True, db_index=True)
    previous_hash = models.CharField(max_length=64, blank=True)
    current_hash = models.CharField(max_length=64, unique=True, db_index=True)
    
    # Transaction Details
    transaction_type = models.CharField(max_length=30, choices=TRANSACTION_TYPE_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, db_index=True)
    
    # Amounts
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    
    # References
    tenant_schema = models.CharField(max_length=63, blank=True, db_index=True, 
                                     help_text="Tenant schema if applicable")
    reference_type = models.CharField(max_length=50, blank=True,
                                      help_text="e.g., 'Subscription', 'Payout', 'Commission'")
    reference_id = models.UUIDField(null=True, blank=True,
                                    help_text="ID of related object")
    
    # Metadata
    description = models.TextField()
    metadata = models.JSONField(default=dict, help_text="Additional transaction data")
    
    # Audit Trail
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, 
                                   related_name='ledger_entries_created',
                                   null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # Immutability Flag
    is_locked = models.BooleanField(default=True, 
                                    help_text="Locked entries cannot be modified")
    
    class Meta:
        db_table = 'public_financial_ledger'
        ordering = ['sequence_number']
        indexes = [
            models.Index(fields=['sequence_number']),
            models.Index(fields=['category', '-created_at']),
            models.Index(fields=['tenant_schema', '-created_at']),
            models.Index(fields=['transaction_type', '-created_at']),
        ]
        verbose_name = 'Financial Ledger Entry'
        verbose_name_plural = 'Financial Ledger Entries'
        permissions = [
            ('view_audit_trail', 'Can view audit trail'),
            ('export_ledger', 'Can export ledger data'),
        ]
    
    def __str__(self):
        return f"#{self.sequence_number} - {self.get_transaction_type_display()} - ₹{self.amount}"
    
    def calculate_hash(self):
        """Calculate SHA-256 hash of this entry"""
        data = {
            'sequence_number': self.sequence_number,
            'previous_hash': self.previous_hash,
            'transaction_type': self.transaction_type,
            'amount': str(self.amount),
            'created_at': self.created_at.isoformat() if self.created_at else '',
            'description': self.description,
        }
        hash_string = json.dumps(data, sort_keys=True)
        return hashlib.sha256(hash_string.encode()).hexdigest()
    
    def save(self, *args, **kwargs):
        """Auto-generate hash chain"""
        if not self.sequence_number:
            # Get last sequence number
            last_entry = FinancialLedger.objects.order_by('-sequence_number').first()
            self.sequence_number = (last_entry.sequence_number + 1) if last_entry else 1
            self.previous_hash = last_entry.current_hash if last_entry else ''
        
        # Calculate current hash
        if not self.current_hash:
            self.current_hash = self.calculate_hash()
        
        super().save(*args, **kwargs)
    
    def verify_chain(self):
        """Verify this entry's hash matches calculated hash"""
        calculated = self.calculate_hash()
        return self.current_hash == calculated


class FinancialSnapshot(models.Model):
    """
    Daily snapshot of segregated financial balances
    Read-only summary for quick reporting
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    snapshot_date = models.DateField(unique=True, db_index=True)
    
    # Platform Revenue
    platform_revenue_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    platform_revenue_mtd = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    platform_revenue_ytd = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # School Collections (Pass-through)
    school_collections_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    school_collections_mtd = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Partner Commissions
    partner_commissions_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    partner_commissions_pending = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Investor Payouts
    investor_payouts_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    investor_payouts_ytd = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Platform Expenses
    platform_expenses_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    platform_expenses_mtd = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Net Metrics
    gross_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0,
                                       help_text="Platform Revenue - Platform Expenses")
    net_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0,
                                     help_text="Gross Profit - Commissions - Investor Payouts")
    
    # Metadata
    calculated_at = models.DateTimeField(auto_now_add=True)
    ledger_entries_count = models.IntegerField(default=0)
    last_ledger_sequence = models.BigIntegerField(default=0)
    
    class Meta:
        db_table = 'public_financial_snapshots'
        ordering = ['-snapshot_date']
        verbose_name = 'Financial Snapshot'
        verbose_name_plural = 'Financial Snapshots'
    
    def __str__(self):
        return f"Financial Snapshot - {self.snapshot_date}"


class AuditLog(models.Model):
    """
    Comprehensive audit log for all financial operations
    Immutable, append-only log
    """
    ACTION_CHOICES = [
        ('CREATE', 'Created'),
        ('UPDATE', 'Updated'),
        ('DELETE', 'Deleted'),
        ('VIEW', 'Viewed'),
        ('EXPORT', 'Exported'),
        ('APPROVE', 'Approved'),
        ('REJECT', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # What happened
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100, db_index=True)
    object_id = models.CharField(max_length=100)
    object_repr = models.CharField(max_length=200)
    
    # Who did it
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='platform_audit_logs')
    user_email = models.EmailField()
    user_role = models.CharField(max_length=50)
    
    # When and where
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Changes
    changes = models.JSONField(default=dict, help_text="Before/after values")
    
    # Context
    request_path = models.CharField(max_length=500, blank=True)
    request_method = models.CharField(max_length=10, blank=True)
    
    class Meta:
        db_table = 'public_audit_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['model_name', '-timestamp']),
            models.Index(fields=['user', '-timestamp']),
        ]
        verbose_name = 'Audit Log Entry'
        verbose_name_plural = 'Audit Log Entries'
    
    def __str__(self):
        return f"{self.user.email} {self.action} {self.model_name} at {self.timestamp}"


class RoleBasedAccess(models.Model):
    """
    Role-based access control for financial data
    Defines what each role can see/do
    """
    ROLE_CHOICES = [
        ('SUPER_ADMIN', 'Super Administrator'),
        ('FINANCE_ADMIN', 'Finance Administrator'),
        ('INVESTOR', 'Investor'),
        ('AUDITOR', 'Auditor (Read-only)'),
        ('PARTNER', 'Partner'),
        ('SCHOOL_ADMIN', 'School Administrator'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)
    
    # Permissions
    can_view_platform_revenue = models.BooleanField(default=False)
    can_view_school_collections = models.BooleanField(default=False)
    can_view_partner_commissions = models.BooleanField(default=False)
    can_view_investor_payouts = models.BooleanField(default=False)
    can_view_expenses = models.BooleanField(default=False)
    
    can_export_ledger = models.BooleanField(default=False)
    can_view_audit_logs = models.BooleanField(default=False)
    can_approve_payouts = models.BooleanField(default=False)
    
    # Data Filters
    can_view_all_tenants = models.BooleanField(default=False)
    restricted_to_own_data = models.BooleanField(default=True)
    
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'public_role_based_access'
        verbose_name = 'Role-Based Access Control'
        verbose_name_plural = 'Role-Based Access Controls'
    
    def __str__(self):
        return f"{self.get_role_display()}"


class FinancialReport(models.Model):
    """
    Generated financial reports for download
    """
    REPORT_TYPE_CHOICES = [
        ('INVESTOR_DASHBOARD', 'Investor Dashboard Report'),
        ('LEDGER_EXPORT', 'Ledger Export'),
        ('PARTNER_SUMMARY', 'Partner Commission Summary'),
        ('REVENUE_BREAKDOWN', 'Revenue Breakdown'),
        ('EXPENSE_REPORT', 'Expense Report'),
        ('AUDIT_TRAIL', 'Audit Trail Report'),
    ]
    
    FORMAT_CHOICES = [
        ('PDF', 'PDF'),
        ('EXCEL', 'Excel'),
        ('CSV', 'CSV'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    report_type = models.CharField(max_length=30, choices=REPORT_TYPE_CHOICES)
    report_format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    
    # Date Range
    start_date = models.DateField()
    end_date = models.DateField()
    
    # File
    file = models.FileField(upload_to='financial_reports/%Y/%m/', null=True, blank=True)
    file_size = models.BigIntegerField(default=0)
    
    # Generation
    generated_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='platform_financial_reports')
    generated_at = models.DateTimeField(auto_now_add=True)
    
    # Access
    is_confidential = models.BooleanField(default=True)
    download_count = models.IntegerField(default=0)
    
    # Metadata
    parameters = models.JSONField(default=dict, help_text="Report generation parameters")
    
    class Meta:
        db_table = 'public_financial_reports'
        ordering = ['-generated_at']
        verbose_name = 'Financial Report'
        verbose_name_plural = 'Financial Reports'
    
    def __str__(self):
        return f"{self.get_report_type_display()} - {self.start_date} to {self.end_date}"
