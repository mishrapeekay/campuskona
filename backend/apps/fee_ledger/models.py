import hashlib
import json
from decimal import Decimal
from django.db import models, transaction
from django.utils import timezone
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from apps.core.models import BaseModel

class FeeLedgerEntry(BaseModel):
    """
    Immutable ledger entry for student fees.
    Every financial event (Due, Payment, Discount, Refund) creates a record here.
    """
    ENTRY_TYPES = [
        ('FEE_DUE', 'Fee Demand (Debit)'),
        ('PAYMENT', 'Payment Received (Credit)'),
        ('DISCOUNT', 'Discount/Concession (Credit)'),
        ('REFUND', 'Refund Issued (Debit)'),
        ('REVERSAL', 'Correction/Reversal'),
    ]

    student = models.ForeignKey(
        'students.Student',
        on_delete=models.PROTECT,
        related_name='fee_ledger_entries'
    )
    entry_type = models.CharField(max_length=20, choices=ENTRY_TYPES)
    
    # Financial Details
    base_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # GST / Tax Details
    cgst = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    sgst = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    igst = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    # TDS (Tax Deducted at Source) - mostly for commercial/corporate fee payers
    tds_deducted = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    total_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        editable=False,
        help_text="Final amount after taxes and TDS"
    )
    
    # Balance After this entry
    running_balance = models.DecimalField(max_digits=15, decimal_places=2, editable=False)
    
    # References
    reference_id = models.CharField(
        max_length=100, 
        help_text="ID of the source document (Invoice ID, Payment ID, etc.)"
    )
    description = models.TextField()
    
    # Proof of Integrity
    previous_hash = models.CharField(max_length=64, editable=False)
    entry_hash = models.CharField(max_length=64, editable=False, unique=True)
    
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'finance_student_ledger'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['student', 'created_at']),
            models.Index(fields=['entry_hash']),
        ]

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.entry_type} - {self.total_amount}"

    def clean(self):
        if not self._state.adding:
            raise ValidationError("Ledger entries are strictly immutable.")

    def save(self, *args, **kwargs):
        if self._state.adding:
            # 1. Calculate Total Amount
            # Debits (DUE, REFUND) increase balance
            # Credits (PAYMENT, DISCOUNT) decrease balance
            self.total_amount = self.base_amount + self.cgst + self.sgst + self.igst - self.tds_deducted
            
            with transaction.atomic():
                # 2. Get Last Entry for Running Balance and Hash
                last_entry = FeeLedgerEntry.objects.filter(student=self.student).order_by('-created_at').first()
                
                if last_entry:
                    self.previous_hash = last_entry.entry_hash
                    prev_balance = last_entry.running_balance
                else:
                    self.previous_hash = "0" * 64
                    prev_balance = Decimal('0.00')

                # Update Running Balance
                if self.entry_type in ['FEE_DUE', 'REFUND']:
                    self.running_balance = prev_balance + self.total_amount
                else:
                    self.running_balance = prev_balance - self.total_amount

                # 3. Generate Integrity Hash
                hash_payload = {
                    'prev_hash': self.previous_hash,
                    'student_id': str(self.student.id),
                    'entry_type': self.entry_type,
                    'total_amount': str(self.total_amount),
                    'timestamp': timezone.now().isoformat()
                }
                payload_str = json.dumps(hash_payload, sort_keys=True)
                self.entry_hash = hashlib.sha256(payload_str.encode()).hexdigest()
                
                super().save(*args, **kwargs)
        else:
            raise ValidationError("Cannot modify an existing ledger entry.")

    def delete(self, *args, **kwargs):
        raise ValidationError("Ledger entries cannot be deleted.")
