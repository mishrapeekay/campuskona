"""
Data Deletion Service - DPDP Act Section 14 (Right to Erasure)
Handles data deletion requests with retention policy compliance
"""
from django.utils import timezone
from django.db import transaction
from apps.privacy.models import DeletionRequest
from apps.students.models import Student


class DataDeletionService:
    """
    Handles student data deletion in compliance with DPDP Act Section 14
    Implements retention policies and consent-based deletion
    """

    # Retention periods (in days)
    RETENTION_POLICIES = {
        'CORE_EDUCATIONAL': 3650,  # 10 years
        'HEALTH_SAFETY': 3650,      # 10 years
        'FEE_MANAGEMENT': 2555,     # 7 years (financial records)
        'ATTENDANCE': 1825,         # 5 years
        'BEHAVIORAL': 1825,         # 5 years
        'COMMUNICATION': 365,       # 1 year
        'ANALYTICS': 730,           # 2 years
        'PHOTO_MEDIA': 1095,        # 3 years
    }

    @staticmethod
    def can_delete_student(student):
        """
        Check if student data can be deleted based on retention policies

        Args:
            student: Student instance

        Returns:
            tuple: (can_delete: bool, reason: str)
        """
        # Check if student is currently active
        if student.admission_status == 'ACTIVE':
            return False, "Cannot delete data for currently active student"

        # Calculate how long ago student left (passed out, transferred, inactive)
        if student.admission_status in ['PASSED_OUT', 'TRANSFERRED', 'INACTIVE']:
            # Assume we track last_active_date (would need to add this field)
            # For now, check if updated_at is old enough
            days_since_inactive = (timezone.now() - student.updated_at).days

            # Core educational data requires 10 years retention
            if days_since_inactive < DataDeletionService.RETENTION_POLICIES['CORE_EDUCATIONAL']:
                return False, f"Retention policy requires keeping data for {DataDeletionService.RETENTION_POLICIES['CORE_EDUCATIONAL']} days. {days_since_inactive} days elapsed."

        # Check for mandatory consents that cannot be withdrawn
        from apps.privacy.models import ParentalConsent
        mandatory_consents = ParentalConsent.objects.filter(
            student=student,
            purpose__is_mandatory=True,
            consent_given=True,
            withdrawn=False
        )

        if mandatory_consents.exists() and student.admission_status == 'ACTIVE':
            return False, "Cannot delete while mandatory consents are active for active student"

        return True, "Student data can be deleted"

    @staticmethod
    @transaction.atomic
    def process_deletion_request(deletion_request, approved_by_user):
        """
        Process an approved deletion request

        Args:
            deletion_request: DeletionRequest instance
            approved_by_user: User who approved the deletion

        Returns:
            tuple: (success: bool, message: str)
        """
        student = deletion_request.student

        # Final check before deletion
        can_delete, reason = DataDeletionService.can_delete_student(student)

        if not can_delete:
            deletion_request.status = 'REJECTED'
            deletion_request.notes = f"Rejected: {reason}"
            deletion_request.reviewed_at = timezone.now()
            deletion_request.save()
            return False, reason

        try:
            # Mark deletion request as approved
            deletion_request.status = 'APPROVED'
            deletion_request.reviewed_at = timezone.now()
            deletion_request.save()

            # Perform soft delete (don't hard delete to maintain audit trail)
            student.is_deleted = True
            student.deleted_at = timezone.now()
            student.save()

            # Mark as completed
            deletion_request.status = 'COMPLETED'
            deletion_request.completed_at = timezone.now()
            deletion_request.completed_by = approved_by_user
            deletion_request.notes = "Student data soft-deleted successfully. Audit trail retained."
            deletion_request.save()

            return True, "Student data deleted successfully (soft delete with audit trail)"

        except Exception as e:
            deletion_request.status = 'REJECTED'
            deletion_request.notes = f"Deletion failed: {str(e)}"
            deletion_request.save()
            return False, f"Deletion failed: {str(e)}"

    @staticmethod
    def schedule_deletion(student, requested_by, reason):
        """
        Schedule a deletion request for approval

        Args:
            student: Student instance
            requested_by: User requesting deletion
            reason: Reason for deletion

        Returns:
            DeletionRequest instance
        """
        deletion_request = DeletionRequest.objects.create(
            student=student,
            requested_by=requested_by,
            reason=reason,
            status='PENDING'
        )

        # Auto-approve if student is no longer active and retention period passed
        can_delete, reason_msg = DataDeletionService.can_delete_student(student)

        if can_delete and student.admission_status != 'ACTIVE':
            deletion_request.status = 'APPROVED'
            deletion_request.notes = "Auto-approved: Retention period satisfied"
            deletion_request.save()

        return deletion_request

    @staticmethod
    def anonymize_student_data(student):
        """
        Anonymize student data instead of deleting
        Used for research/analytics purposes while protecting privacy

        Args:
            student: Student instance

        Returns:
            bool: Success status
        """
        try:
            # Replace sensitive data with anonymized values
            student.first_name = f"Student_{student.id}"
            student.last_name = "Anonymized"
            student.email = f"anonymized_{student.id}@example.com"
            student.phone_number = ""
            student.aadhar_number = None
            student.samagra_family_id = None
            student.samagra_member_id = None
            student.father_name = "Anonymized"
            student.mother_name = "Anonymized"
            student.father_phone = ""
            student.mother_phone = ""
            student.father_email = ""
            student.mother_email = ""
            student.father_annual_income = None
            student.mother_annual_income = None
            student.current_address_line1 = "Anonymized"
            student.permanent_address_line1 = "Anonymized"

            student.save()
            return True

        except Exception:
            return False
