from abc import ABC, abstractmethod
from typing import List, Dict, Any
from django.db.models import Q, Count, F, ExpressionWrapper, fields
from django.utils import timezone
from datetime import timedelta

# Import models
from apps.attendance.models import ClassAttendanceLog
from apps.academics.models import Section
from apps.finance.models import StudentFee, Expense
from apps.attendance.models import StudentLeave, StaffLeave
from apps.privacy.models import Grievance, DataBreach

class ExceptionRule(ABC):
    """
    Abstract base class for exception rules.
    Each rule defines how to fetch and format specific exceptions.
    """
    
    @property
    @abstractmethod
    def category(self) -> str:
        """The category identifier for this rule."""
        pass

    @property
    @abstractmethod
    def severity(self) -> str:
        """Default severity for this exception type (CRITICAL, HIGH, MEDIUM, LOW)."""
        pass

    @abstractmethod
    def check(self, **kwargs) -> List[Dict[str, Any]]:
        """
        Execute the rule logic and return a list of exception items.
        kwargs can contain filters like 'date', 'tenant_id', etc.
        """
        pass

class AttendanceMissingRule(ExceptionRule):
    category = "attendance_missing"
    severity = "HIGH"

    def check(self, **kwargs) -> List[Dict[str, Any]]:
        target_date = kwargs.get('date', timezone.now().date())
        
        # optimized query to find sections without attendance logs for the target date
        # Assuming we want to track 'Class' attendance
        
        # valid_sections could be filtered by active academic year, etc.
        # Here we find sections that DO NOT have a log for today
        
        missing_sections = Section.objects.annotate(
            log_count=Count(
                'attendance_logs', 
                filter=Q(attendance_logs__date=target_date)
            )
        ).filter(log_count=0).select_related('class_obj', 'class_teacher')

        exceptions = []
        for section in missing_sections:
            teacher_name = section.class_teacher.get_full_name() if section.class_teacher else "Unassigned"
            exceptions.append({
                "id": f"att-{section.id}",
                "title": f"Attendance Pending: {section.class_obj.name} - {section.name}",
                "description": f"Class teacher {teacher_name} has not marked attendance for {target_date}.",
                "entity_id": section.id,
                "entity_type": "section",
                "action_url": f"/attendance/mark/{section.id}",
                "severity": self.severity
            })
        
        return exceptions

class FeesOverdueRule(ExceptionRule):
    category = "fees_overdue"
    severity = "MEDIUM"

    def check(self, **kwargs) -> List[Dict[str, Any]]:
        today = timezone.now().date()
        
        # High value overdue fees or long pending
        overdue_fees = StudentFee.objects.filter(
            Q(status='OVERDUE') | Q(status='PENDING', due_date__lt=today)
        ).select_related('student', 'fee_structure__fee_category').order_by('due_date')[:50] # Limit to top 50 to avoid overload

        exceptions = []
        for fee in overdue_fees:
            days_overdue = (today - fee.due_date).days
            exceptions.append({
                "id": f"fee-{fee.id}",
                "title": f"Fee Overdue: {fee.student.get_full_name()}",
                "description": f"{fee.fee_structure.fee_category.name} of {fee.balance_amount} is overdue by {days_overdue} days.",
                "entity_id": fee.id,
                "entity_type": "student_fee",
                "metadata": {"amount": float(fee.balance_amount), "days_overdue": days_overdue},
                "severity": "CRITICAL" if days_overdue > 30 else "MEDIUM"
            })
            
        return exceptions

class PendingApprovalsRule(ExceptionRule):
    category = "approval_requests_pending"
    severity = "MEDIUM"

    def check(self, **kwargs) -> List[Dict[str, Any]]:
        exceptions = []
        
        # 1. Student Leaves
        student_leaves = StudentLeave.objects.filter(status='PENDING').select_related('student')[:20]
        for leave in student_leaves:
            exceptions.append({
                "id": f"sl-{leave.id}",
                "title": f"Student Leave Request: {leave.student.get_full_name()}",
                "description": f"{leave.get_leave_type_display()} from {leave.start_date} to {leave.end_date}",
                "entity_id": leave.id,
                "entity_type": "student_leave",
                "severity": "MEDIUM"
            })

        # 2. Staff Leaves
        staff_leaves = StaffLeave.objects.filter(status='PENDING').select_related('staff_member')[:20]
        for leave in staff_leaves:
            exceptions.append({
                "id": f"stl-{leave.id}",
                "title": f"Staff Leave Request: {leave.staff_member.get_full_name()}",
                "description": f"{leave.get_leave_type_display()}",
                "entity_id": leave.id,
                "entity_type": "staff_leave",
                "severity": "MEDIUM"
            })

        # 3. Expenses
        expenses = Expense.objects.filter(status='PENDING').select_related('created_by')[:20]
        for expense in expenses:
            exceptions.append({
                "id": f"exp-{expense.id}",
                "title": f"Expense Approval: {expense.title}",
                "description": f"Amount: {expense.amount} - Requested by {expense.created_by.get_full_name() if expense.created_by else 'Unknown'}",
                "entity_id": expense.id,
                "entity_type": "expense",
                "severity": "low"
            })
            
        return exceptions

class ComplianceDeadlinesRule(ExceptionRule):
    category = "compliance_deadlines"
    severity = "CRITICAL"

    def check(self, **kwargs) -> List[Dict[str, Any]]:
        exceptions = []
        now = timezone.now()
        
        # 1. Grievance SLAs
        # Find grievances that are not resolved and close to their SLA limit
        # Critical: 24 hours, High: 48 hours
        
        critical_threshold = now - timedelta(hours=20) # Warning if 20 hours passed (4 hours left)
        
        grievances = Grievance.objects.exclude(status__in=['RESOLVED', 'CLOSED']).filter(
            severity='CRITICAL',
            filed_at__lte=critical_threshold
        )
        
        for g in grievances:
            hours_elapsed = (now - g.filed_at).total_seconds() / 3600
            hours_left = max(0, 24 - hours_elapsed)
            
            exceptions.append({
                "id": f"grv-{g.grievance_id}",
                "title": f"Grievance SLA Breach Risk",
                "description": f"Critical grievance '{g.subject}' has {hours_left:.1f} hours left for resolution.",
                "entity_id": str(g.grievance_id),
                "entity_type": "grievance",
                "severity": "CRITICAL"
            })

        # 2. Data Breach Notifications (72 hour deadline)
        breach_threshold = now - timedelta(hours=60) # 12 hours left
        breaches = DataBreach.objects.filter(
            severity__in=['HIGH', 'CRITICAL'],
            dpb_notification_sent=False,
            discovered_at__lte=breach_threshold
        )
        
        for b in breaches:
             hours_elapsed = (now - b.discovered_at).total_seconds() / 3600
             hours_left = max(0, 72 - hours_elapsed)
             
             exceptions.append({
                "id": f"brc-{b.breach_id}",
                "title": "Data Breach Notification Deadline",
                "description": f"DPB Notification for '{b.title}' due in {hours_left:.1f} hours.",
                "entity_id": str(b.breach_id),
                "entity_type": "data_breach",
                "severity": "CRITICAL"
             })

        return exceptions


class ExceptionService:
    """
    Service to aggregate exceptions from all registered rules.
    """
    def __init__(self):
        self.rules: List[ExceptionRule] = [
            AttendanceMissingRule(),
            FeesOverdueRule(),
            PendingApprovalsRule(),
            ComplianceDeadlinesRule()
        ]

    def get_dashboard_exceptions(self, **kwargs) -> Dict[str, Any]:
        """
        Run all rules and return aggregated results.
        """
        results = {
            "summary": {
                "total": 0,
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0
            },
            "categories": {}
        }

        all_exceptions = []

        for rule in self.rules:
            try:
                rule_exceptions = rule.check(**kwargs)
                
                # Group by category
                results["categories"][rule.category] = rule_exceptions
                
                # Update summary
                for exc in rule_exceptions:
                    severity = exc.get("severity", "LOW").lower()
                    results["summary"][severity] = results["summary"].get(severity, 0) + 1
                    results["summary"]["total"] += 1
                    
            except Exception as e:
                # Log error but don't crash the dashboard
                print(f"Error in rule {rule.category}: {str(e)}")
                results["categories"][rule.category] = []
                results["categories"][rule.category + "_error"] = str(e)

        return results
