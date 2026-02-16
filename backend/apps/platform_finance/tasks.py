"""
Platform Finance Celery Tasks
=============================
Automated tasks for metrics calculation and snapshot generation
"""

from celery import shared_task
from django.utils import timezone
from datetime import timedelta

from .services import InvestorMetricsService, FinancialSegregationService
from .models import InvestorMetric, FinancialSnapshot


@shared_task(name='platform_finance.calculate_daily_investor_metrics')
def calculate_daily_investor_metrics():
    """
    Calculate and store daily investor metrics
    Runs daily at midnight
    """
    try:
        today = timezone.now().date()
        snapshot = InvestorMetricsService.create_daily_snapshot(today)
        
        return {
            'status': 'success',
            'snapshot_id': str(snapshot.id),
            'snapshot_date': str(snapshot.snapshot_date),
            'mrr': float(snapshot.mrr),
            'arr': float(snapshot.arr),
            'active_schools': snapshot.active_schools,
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }


@shared_task(name='platform_finance.create_daily_financial_snapshot')
def create_daily_financial_snapshot():
    """
    Create daily financial snapshot
    Runs daily at midnight
    """
    try:
        today = timezone.now().date()
        snapshot = FinancialSegregationService.create_daily_snapshot(today)
        
        return {
            'status': 'success',
            'snapshot_id': str(snapshot.id),
            'snapshot_date': str(snapshot.snapshot_date),
            'platform_revenue': float(snapshot.platform_revenue_total),
            'net_profit': float(snapshot.net_profit),
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }


@shared_task(name='platform_finance.verify_ledger_integrity')
def verify_ledger_integrity():
    """
    Verify ledger chain integrity
    Runs daily
    """
    try:
        result = FinancialSegregationService.verify_ledger_integrity()
        
        return {
            'status': 'success',
            'is_valid': result['is_valid'],
            'total_entries': result['total_entries'],
            'errors_count': len(result['errors']),
            'errors': result['errors'][:10]  # First 10 errors
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }


@shared_task(name='platform_finance.cleanup_old_audit_logs')
def cleanup_old_audit_logs(days=90):
    """
    Archive or delete old audit logs
    Runs weekly
    """
    try:
        from .models import AuditLog
        
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # Count logs to be deleted
        old_logs = AuditLog.objects.filter(timestamp__lt=cutoff_date)
        count = old_logs.count()
        
        # Delete old logs (or archive them to a separate table/file)
        # For now, we'll keep them but you can implement archival logic
        # old_logs.delete()
        
        return {
            'status': 'success',
            'old_logs_count': count,
            'cutoff_date': str(cutoff_date),
            'action': 'identified'  # Change to 'deleted' if you delete them
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }


@shared_task(name='platform_finance.generate_monthly_investor_report')
def generate_monthly_investor_report():
    """
    Generate monthly investor report
    Runs on 1st of every month
    """
    try:
        from .reports import InvestorReportGenerator
        from .models import FinancialReport
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Get date range (previous month)
        today = timezone.now().date()
        first_day_this_month = today.replace(day=1)
        last_day_last_month = first_day_this_month - timedelta(days=1)
        first_day_last_month = last_day_last_month.replace(day=1)
        
        # Generate report
        generator = InvestorReportGenerator()
        file_content = generator.generate_investor_dashboard_report(
            first_day_last_month,
            last_day_last_month,
            'EXCEL'
        )
        
        # Get system user for automated reports
        system_user = User.objects.filter(is_superuser=True).first()
        
        if not system_user:
            return {
                'status': 'error',
                'error': 'No superuser found for automated report generation'
            }
        
        # Create report record
        report = FinancialReport.objects.create(
            report_type='INVESTOR_DASHBOARD',
            report_format='EXCEL',
            start_date=first_day_last_month,
            end_date=last_day_last_month,
            file=file_content,
            generated_by=system_user,
            is_confidential=True,
            parameters={'automated': True, 'monthly': True}
        )
        
        return {
            'status': 'success',
            'report_id': str(report.id),
            'period': f'{first_day_last_month} to {last_day_last_month}',
            'file_size': report.file_size
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }


@shared_task(name='platform_finance.sync_subscription_to_ledger')
def sync_subscription_to_ledger(subscription_id):
    """
    Sync subscription payment to financial ledger
    Called when subscription is created/renewed
    """
    try:
        from apps.tenants.models import Subscription
        
        subscription = Subscription.objects.get(id=subscription_id)
        
        # Record in ledger
        entry = FinancialSegregationService.record_platform_revenue(
            amount=subscription.amount,
            transaction_type='PLATFORM_SUBSCRIPTION',
            description=f'Subscription payment from {subscription.tenant.name}',
            tenant_schema=subscription.tenant.schema_name,
            reference_id=subscription.id,
            metadata={
                'tenant_name': subscription.tenant.name,
                'tier': subscription.tier.name if subscription.tier else None,
                'billing_cycle': subscription.billing_cycle,
                'start_date': str(subscription.start_date),
                'end_date': str(subscription.end_date),
            }
        )
        
        return {
            'status': 'success',
            'ledger_entry_id': str(entry.id),
            'sequence_number': entry.sequence_number,
            'amount': float(entry.amount)
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }


@shared_task(name='platform_finance.sync_commission_to_ledger')
def sync_commission_to_ledger(commission_id):
    """
    Sync partner commission payout to financial ledger
    Called when commission is paid
    """
    try:
        from apps.partners.models import Commission
        
        commission = Commission.objects.get(id=commission_id)
        
        # Record in ledger
        entry = FinancialSegregationService.record_partner_commission(
            amount=commission.amount,
            description=f'Commission payout to {commission.partner.name}',
            reference_id=commission.id,
            metadata={
                'partner_name': commission.partner.name,
                'partner_code': commission.partner.partner_code,
                'lead_id': str(commission.lead.id) if commission.lead else None,
                'commission_type': commission.commission_type,
            }
        )
        
        return {
            'status': 'success',
            'ledger_entry_id': str(entry.id),
            'sequence_number': entry.sequence_number,
            'amount': float(entry.amount)
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }
