import uuid
import hashlib
import json
from django.db import models, transaction
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
from apps.core.models import BaseModel

class LedgerAccount(BaseModel):
    """
    Accounts for segregating finances.
    """
    ACCOUNT_TYPES = [
        ('PLATFORM_REVENUE', 'Platform Revenue'),
        ('SCHOOL_COLLECTION', 'School Collection'),
        ('PARTNER_COMMISSION', 'Partner Commission'),
        ('INVESTOR_PAYOUT', 'Investor Payout'),
        ('CASH_SETTLEMENT', 'Cash/Bank Settlement'),
    ]

    name = models.CharField(max_length=100)
    account_type = models.CharField(max_length=30, choices=ACCOUNT_TYPES)
    school = models.ForeignKey(
        'tenants.School',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ledger_accounts',
        help_text='Null for global platform accounts'
    )
    balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        editable=False
    )
    currency = models.CharField(max_length=3, default='INR')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'finance_ledger_accounts'
        unique_together = ['name', 'school']
        verbose_name = 'Ledger Account'
        verbose_name_plural = 'Ledger Accounts'

    def __str__(self):
        owner = self.school.name if self.school else 'Platform'
        return f"{self.name} ({self.account_type}) - {owner}"

class LedgerTransaction(BaseModel):
    """
    Atomic transaction representing a movement of money.
    """
    TRANSACTION_TYPES = [
        ('SUBSCRIPTION', 'Platform Subscription'),
        ('SCHOOL_FEE', 'School Fee Collection'),
        ('COMMISSION', 'Partner Commission Accrual'),
        ('PAYOUT', 'Partner/Investor Payout'),
        ('SETTLEMENT', 'Inter-account Settlement'),
        ('ADJUSTMENT', 'Audit Adjustment'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('VOID', 'Voided'),
    ]

    reference_id = models.UUIDField(
        null=True, 
        blank=True, 
        help_text='Link to external record (e.g. Payment ID, Subscription ID)'
    )
    description = models.TextField()
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    timestamp = models.DateTimeField(default=timezone.now, editable=False)
    
    # Audit Integrity
    previous_hash = models.CharField(max_length=64, blank=True, null=True, editable=False)
    transaction_hash = models.CharField(max_length=64, unique=True, editable=False)

    class Meta:
        db_table = 'finance_ledger_transactions'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.transaction_type} - {self.id} ({self.status})"

    def clean(self):
        if self.pk and LedgerTransaction.objects.get(pk=self.pk).status == 'COMPLETED':
            raise ValidationError("Completed transactions cannot be modified.")

    def save(self, *args, **kwargs):
        if not self.transaction_hash:
            # Simple integrity hash
            last_tx = LedgerTransaction.objects.order_by('-timestamp').first()
            self.previous_hash = last_tx.transaction_hash if last_tx else "0" * 64
            
            hash_content = f"{self.previous_hash}{self.transaction_type}{self.reference_id}{self.timestamp}"
            self.transaction_hash = hashlib.sha256(hash_content.encode()).hexdigest()
        
        super().save(*args, **kwargs)

class LedgerEntry(BaseModel):
    """
    Individual debit/credit entries for a transaction (Double Entry).
    """
    transaction = models.ForeignKey(
        LedgerTransaction,
        on_delete=models.CASCADE,
        related_name='entries'
    )
    account = models.ForeignKey(
        LedgerAccount,
        on_delete=models.PROTECT,
        related_name='entries'
    )
    debit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    credit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )

    class Meta:
        db_table = 'finance_ledger_entries'
        verbose_name = 'Ledger Entry'
        verbose_name_plural = 'Ledger Entries'

    def __str__(self):
        return f"{self.account.name}: D={self.debit}, C={self.credit}"

    def save(self, *args, **kwargs):
        if self.pk:
            raise ValidationError("Ledger entries are read-only once created.")
        
        with transaction.atomic():
            super().save(*args, **kwargs)
            # Atomic balance update
            self.account.balance = models.F('balance') + (self.credit - self.debit)
            self.account.save(update_fields=['balance'])
            self.account.refresh_from_db()

class FinancialSnapshot(BaseModel):
    """
    Snapshot reports for auditing.
    """
    timestamp = models.DateTimeField(auto_now_add=True)
    report_name = models.CharField(max_length=255)
    data = models.JSONField(help_text='Balances of all accounts at snapshot time')
    integrity_hash = models.CharField(max_length=64, editable=False)
    generated_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        db_table = 'finance_ledger_snapshots'

    def save(self, *args, **kwargs):
        if not self.integrity_hash:
            content = json.dumps(self.data, sort_keys=True)
            self.integrity_hash = hashlib.sha256(content.encode()).hexdigest()
        super().save(*args, **kwargs)

class FinancialAuditLog(BaseModel):
    """
    Specific audit log for financial operations with high granularity.
    """
    actor = models.ForeignKey(
        'authentication.User',
        on_delete=models.PROTECT,
        related_name='finance_audit_actions'
    )
    action = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=50)
    entity_id = models.UUIDField()
    old_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    metadata = models.JSONField(default=dict)

    class Meta:
        db_table = 'finance_ledger_audit_log'
        ordering = ['-created_at']
