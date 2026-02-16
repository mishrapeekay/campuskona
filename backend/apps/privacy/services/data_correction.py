"""
Data Correction Service - DPDP Act Section 13 (Right to Correction)
Handles data correction requests with approval workflow
"""
from django.utils import timezone
from django.db import transaction
from apps.privacy.models import CorrectionRequest
from apps.students.models import Student


class DataCorrectionService:
    """
    Handles student data correction in compliance with DPDP Act Section 13
    Implements approval workflow for data changes
    """

    # Fields that can be corrected by parents
    CORRECTABLE_FIELDS = [
        'first_name',
        'middle_name',
        'last_name',
        'date_of_birth',
        'phone_number',
        'email',
        'current_address_line1',
        'current_address_line2',
        'current_city',
        'current_state',
        'current_pincode',
        'permanent_address_line1',
        'permanent_address_line2',
        'permanent_city',
        'permanent_state',
        'permanent_pincode',
        'father_name',
        'father_occupation',
        'father_phone',
        'father_email',
        'mother_name',
        'mother_occupation',
        'mother_phone',
        'mother_email',
        'guardian_name',
        'guardian_relation',
        'guardian_phone',
        'guardian_email',
        'aadhar_number',
        'samagra_family_id',
        'samagra_member_id',
    ]

    # Fields that require admin approval
    ADMIN_APPROVAL_REQUIRED = [
        'aadhar_number',
        'samagra_family_id',
        'samagra_member_id',
        'date_of_birth',
    ]

    @staticmethod
    def can_correct_field(field_name, user):
        """
        Check if field can be corrected by user

        Args:
            field_name: Name of field to correct
            user: User requesting correction

        Returns:
            tuple: (can_correct: bool, reason: str)
        """
        if field_name not in DataCorrectionService.CORRECTABLE_FIELDS:
            return False, f"Field '{field_name}' cannot be corrected via self-service"

        if field_name in DataCorrectionService.ADMIN_APPROVAL_REQUIRED:
            if not user.is_staff and not user.user_type in ['ADMIN', 'SUPERADMIN']:
                return True, "Requires admin approval"

        return True, "Can be corrected"

    @staticmethod
    def submit_correction_request(student, field_name, corrected_value, requested_by, reason):
        """
        Submit a data correction request

        Args:
            student: Student instance
            field_name: Name of field to correct
            corrected_value: New corrected value
            requested_by: User requesting correction
            reason: Reason for correction

        Returns:
            tuple: (CorrectionRequest instance, message: str)
        """
        # Check if field can be corrected
        can_correct, msg = DataCorrectionService.can_correct_field(field_name, requested_by)

        if not can_correct:
            raise ValueError(msg)

        # Get current value
        current_value = getattr(student, field_name, None)
        if current_value == corrected_value:
            raise ValueError("Corrected value is same as current value")

        # Create correction request
        correction_request = CorrectionRequest.objects.create(
            student=student,
            requested_by=requested_by,
            field_name=field_name,
            current_value=str(current_value) if current_value else '',
            corrected_value=str(corrected_value),
            reason=reason,
            status='PENDING'
        )

        # Auto-approve if doesn't require admin approval
        if field_name not in DataCorrectionService.ADMIN_APPROVAL_REQUIRED:
            if requested_by.user_type in ['ADMIN', 'SUPERADMIN']:
                DataCorrectionService.approve_correction(correction_request, requested_by)
                return correction_request, "Auto-approved and applied"

        return correction_request, "Correction request submitted for approval"

    @staticmethod
    @transaction.atomic
    def approve_correction(correction_request, approved_by):
        """
        Approve and apply a correction request

        Args:
            correction_request: CorrectionRequest instance
            approved_by: User approving the correction

        Returns:
            tuple: (success: bool, message: str)
        """
        if correction_request.status != 'PENDING':
            return False, f"Cannot approve request in status: {correction_request.status}"

        try:
            student = correction_request.student

            # Apply the correction
            setattr(student, correction_request.field_name, correction_request.corrected_value)
            student.save()

            # Update correction request
            correction_request.status = 'APPROVED'
            correction_request.reviewed_at = timezone.now()
            correction_request.completed_at = timezone.now()
            correction_request.completed_by = approved_by
            correction_request.notes = f"Approved and applied by {approved_by.get_full_name()}"
            correction_request.save()

            return True, "Correction applied successfully"

        except Exception as e:
            correction_request.status = 'REJECTED'
            correction_request.notes = f"Failed to apply correction: {str(e)}"
            correction_request.save()
            return False, f"Failed to apply correction: {str(e)}"

    @staticmethod
    def reject_correction(correction_request, rejected_by, rejection_reason):
        """
        Reject a correction request

        Args:
            correction_request: CorrectionRequest instance
            rejected_by: User rejecting the correction
            rejection_reason: Reason for rejection

        Returns:
            bool: Success status
        """
        try:
            correction_request.status = 'REJECTED'
            correction_request.reviewed_at = timezone.now()
            correction_request.notes = f"Rejected by {rejected_by.get_full_name()}: {rejection_reason}"
            correction_request.save()
            return True

        except Exception:
            return False

    @staticmethod
    def get_field_display_name(field_name):
        """
        Get human-readable field name

        Args:
            field_name: Database field name

        Returns:
            str: Human-readable name
        """
        field_names = {
            'first_name': 'First Name',
            'middle_name': 'Middle Name',
            'last_name': 'Last Name',
            'date_of_birth': 'Date of Birth',
            'phone_number': 'Phone Number',
            'email': 'Email Address',
            'aadhar_number': 'Aadhaar Number',
            'samagra_family_id': 'Samagra Family ID',
            'samagra_member_id': 'Samagra Member ID',
            'current_address_line1': 'Current Address Line 1',
            'father_name': "Father's Name",
            'mother_name': "Mother's Name",
        }

        return field_names.get(field_name, field_name.replace('_', ' ').title())
