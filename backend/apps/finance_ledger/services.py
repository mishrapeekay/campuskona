from decimal import Decimal
from django.db import transaction
from .models import LedgerAccount, LedgerTransaction, LedgerEntry, FinancialAuditLog

class LedgerService:
    @staticmethod
    @transaction.atomic
    def record_subscription_payment(school, amount, reference_id, description="", actor=None, ip_address='0.0.0.0'):
        """
        Logic:
        Debit: School's Operating Account (Settlement)
        Credit: Platform Revenue Account
        """
        # Ensure accounts exist
        platform_revenue_acc, _ = LedgerAccount.objects.get_or_create(
            name="Platform SaaS Revenue",
            account_type='PLATFORM_REVENUE',
            school=None
        )
        
        # We might have a virtual 'Cash/Bank' account to track where money came from
        settlement_acc, _ = LedgerAccount.objects.get_or_create(
            name=f"Settlement - {school.name}",
            account_type='CASH_SETTLEMENT',
            school=school
        )

        tx = LedgerTransaction.objects.create(
            reference_id=reference_id,
            description=description or f"Subscription payment for {school.name}",
            transaction_type='SUBSCRIPTION',
            status='COMPLETED'
        )

        # Double Entry
        LedgerEntry.objects.create(transaction=tx, account=settlement_acc, debit=amount)
        LedgerEntry.objects.create(transaction=tx, account=platform_revenue_acc, credit=amount)

        if actor:
            FinancialAuditLog.objects.create(
                actor=actor,
                action='RECORD_SUBSCRIPTION_PAYMENT',
                entity_type='LedgerTransaction',
                entity_id=tx.id,
                new_values={'amount': str(amount), 'school_id': str(school.id)},
                ip_address=ip_address
            )

        return tx

    @staticmethod
    @transaction.atomic
    def record_school_fee_collection(school, amount, reference_id, description=""):
        """
        Logic:
        Debit: Bank/Cash Settlement
        Credit: School Collection Account
        """
        collection_acc, _ = LedgerAccount.objects.get_or_create(
            name=f"Fee Collection - {school.name}",
            account_type='SCHOOL_COLLECTION',
            school=school
        )
        
        settlement_acc, _ = LedgerAccount.objects.get_or_create(
            name=f"Bank - {school.name}",
            account_type='CASH_SETTLEMENT',
            school=school
        )

        tx = LedgerTransaction.objects.create(
            reference_id=reference_id,
            description=description or f"Fee collection for {school.name}",
            transaction_type='SCHOOL_FEE',
            status='COMPLETED'
        )

        LedgerEntry.objects.create(transaction=tx, account=settlement_acc, debit=amount)
        LedgerEntry.objects.create(transaction=tx, account=collection_acc, credit=amount)

        return tx

    @staticmethod
    @transaction.atomic
    def record_partner_commission(partner_name, amount, reference_id, school=None):
        """
        Logic:
        Debit: Platform Revenue (or Expense)
        Credit: Partner Commission Account
        """
        commission_acc, _ = LedgerAccount.objects.get_or_create(
            name=f"Commission - {partner_name}",
            account_type='PARTNER_COMMISSION',
            school=None
        )
        
        platform_revenue_acc, _ = LedgerAccount.objects.get_or_create(
            name="Platform SaaS Revenue",
            account_type='PLATFORM_REVENUE',
            school=None
        )

        tx = LedgerTransaction.objects.create(
            reference_id=reference_id,
            description=f"Commission accrual for {partner_name}",
            transaction_type='COMMISSION',
            status='COMPLETED'
        )

        LedgerEntry.objects.create(transaction=tx, account=platform_revenue_acc, debit=amount)
        LedgerEntry.objects.create(transaction=tx, account=commission_acc, credit=amount)

        return tx

    @staticmethod
    def generate_snapshot(report_name, user):
        """
        Captures the state of all ledger accounts.
        """
        accounts = LedgerAccount.objects.all()
        data = {
            acc.name: {
                'balance': str(acc.balance),
                'type': acc.account_type,
                'school': acc.school.name if acc.school else 'Platform'
            } for acc in accounts
        }
        
        from .models import FinancialSnapshot
        snapshot = FinancialSnapshot.objects.create(
            report_name=report_name,
            data=data,
            generated_by=user
        )
        return snapshot
