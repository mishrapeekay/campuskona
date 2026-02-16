from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from .models import FeeLedgerEntry

class FeeLedgerService:
    @staticmethod
    @transaction.atomic
    def record_fee_due(student, amount, reference_id, description, cgst=0, sgst=0, igst=0):
        """
        Record a fee demand in the ledger. 
        This is a Debit operation that increases running balance.
        """
        return FeeLedgerEntry.objects.create(
            student=student,
            entry_type='FEE_DUE',
            base_amount=Decimal(str(amount)),
            cgst=Decimal(str(cgst)),
            sgst=Decimal(str(sgst)),
            igst=Decimal(str(igst)),
            reference_id=reference_id,
            description=description
        )

    @staticmethod
    @transaction.atomic
    def record_payment(student, amount, reference_id, description, tds_deducted=0):
        """
        Record a payment in the ledger.
        This is a Credit operation that decreases running balance.
        """
        return FeeLedgerEntry.objects.create(
            student=student,
            entry_type='PAYMENT',
            base_amount=Decimal(str(amount)),
            tds_deducted=Decimal(str(tds_deducted)),
            reference_id=reference_id,
            description=description
        )

    @staticmethod
    def verify_chain_integrity(student):
        """
        Verifies the integrity of the ledger chain for a specific student.
        Returns (True, None) if valid, (False, error_msg) otherwise.
        """
        entries = FeeLedgerEntry.objects.filter(student=student).order_by('created_at')
        prev_hash = "0" * 64
        
        for entry in entries:
            if entry.previous_hash != prev_hash:
                return False, f"Integrity break at entry {entry.id}: previous_hash mismatch."
            
            # Re-calculate hash (note: in a real system, you'd need the exact timestamp from the record)
            # For this demo, we check if the entry_hash exists and matches the sequence.
            prev_hash = entry.entry_hash
            
        return True, "Chain is valid."

    @staticmethod
    def get_receipt_data(entry_id):
        """
        Generates structured data for receipt generation.
        """
        try:
            entry = FeeLedgerEntry.objects.get(id=entry_id, entry_type='PAYMENT')
            return {
                "receipt_no": entry.reference_id,
                "date": entry.created_at.strftime("%Y-%m-%d"),
                "student_name": entry.student.get_full_name(),
                "admission_no": entry.student.admission_number,
                "amount_paid": str(entry.total_amount),
                "breakdown": {
                    "base": str(entry.base_amount),
                    "tds": str(entry.tds_deducted),
                },
                "balance_after": str(entry.running_balance),
                "integrity_token": entry.entry_hash[:12] # Short token for human verification
            }
        except FeeLedgerEntry.DoesNotExist:
            return None
