"""
Email Notification Service for DPDP Compliance
Handles notifications for grievances, consent, data breach, etc.
"""
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone


class PrivacyNotificationService:
    """
    Centralized email notification service for DPDP compliance
    """

    @staticmethod
    def send_grievance_acknowledgment(grievance):
        """
        Send acknowledgment email to parent who filed grievance
        DPDP Act requires acknowledgment within 24 hours
        """
        subject = f'Grievance Acknowledgment - {grievance.grievance_id}'

        message = f"""
Dear {grievance.filed_by.get_full_name()},

Thank you for filing a grievance with us regarding {grievance.category}.

Grievance ID: {grievance.grievance_id}
Filed on: {grievance.filed_at.strftime('%d %B %Y, %H:%M')}
Subject: {grievance.subject}
Severity: {grievance.severity}

We have received your grievance and it has been assigned to our team for review. We are committed to resolving your concerns promptly.

Expected Resolution Time:
- CRITICAL: Within 24 hours
- HIGH: Within 48 hours
- MEDIUM: Within 72 hours
- LOW: Within 7 days

You can track the status of your grievance in the Parent Portal.

If you have any questions, please contact our Data Protection Officer at {settings.DEFAULT_FROM_EMAIL}.

Best regards,
School Administration
"""

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[grievance.filed_by.email],
            fail_silently=False,
        )

    @staticmethod
    def send_grievance_update(grievance, update_message):
        """
        Notify parent when grievance status changes or comment is added
        """
        subject = f'Grievance Update - {grievance.grievance_id}'

        message = f"""
Dear {grievance.filed_by.get_full_name()},

There is an update on your grievance.

Grievance ID: {grievance.grievance_id}
Subject: {grievance.subject}
Current Status: {grievance.get_status_display()}

Update:
{update_message}

You can view the complete details and conversation history in the Parent Portal.

Best regards,
School Administration
"""

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[grievance.filed_by.email],
            fail_silently=False,
        )

    @staticmethod
    def send_grievance_resolution(grievance):
        """
        Notify parent when grievance is resolved
        """
        subject = f'Grievance Resolved - {grievance.grievance_id}'

        message = f"""
Dear {grievance.filed_by.get_full_name()},

Your grievance has been resolved.

Grievance ID: {grievance.grievance_id}
Subject: {grievance.subject}
Resolved on: {grievance.resolved_at.strftime('%d %B %Y, %H:%M')}
Resolved by: {grievance.resolved_by.get_full_name() if grievance.resolved_by else 'School Administration'}

Resolution:
{grievance.resolution_notes}

If you are satisfied with the resolution, no further action is required. If you still have concerns, you may:
1. Contact us at {settings.DEFAULT_FROM_EMAIL}
2. File an appeal with the Data Protection Board of India

Thank you for bringing this matter to our attention.

Best regards,
School Administration
"""

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[grievance.filed_by.email],
            fail_silently=False,
        )

    @staticmethod
    def notify_admin_of_grievance(grievance):
        """
        Notify school admin/DPO when new grievance is filed
        """
        # Get DPO email from settings or default admin email
        dpo_email = getattr(settings, 'DPO_EMAIL', settings.DEFAULT_FROM_EMAIL)

        subject = f'[URGENT] New Grievance Filed - {grievance.severity}'

        message = f"""
A new grievance has been filed by {grievance.filed_by.get_full_name()}.

Grievance ID: {grievance.grievance_id}
Student: {grievance.student.get_full_name() if grievance.student else 'N/A'}
Category: {grievance.category}
Severity: {grievance.severity}
Subject: {grievance.subject}
Filed on: {grievance.filed_at.strftime('%d %B %Y, %H:%M')}

Description:
{grievance.description}

DPDP Compliance Requirements:
- Acknowledgment: Within 24 hours
- Resolution: Based on severity ({grievance.severity})

Action Required:
1. Acknowledge the grievance immediately
2. Assign to appropriate staff member
3. Investigate and resolve within timeline

View and manage in Admin Portal: {settings.FRONTEND_URL}/admin/grievances/{grievance.id}/

This is an automated notification from the DPDP Compliance System.
"""

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[dpo_email],
            fail_silently=False,
        )

    @staticmethod
    def send_consent_reminder(parent_user, student, purpose):
        """
        Remind parent to grant consent for specific purpose
        """
        subject = f'Consent Required - {purpose.name}'

        message = f"""
Dear {parent_user.get_full_name()},

We need your consent to process certain personal data of your child, {student.get_full_name()}.

Purpose: {purpose.name}
Description: {purpose.description}
Category: {purpose.get_category_display()}
Mandatory: {'Yes' if purpose.is_mandatory else 'No'}

Legal Basis: {purpose.legal_basis}
Data Retention: {purpose.retention_period_days} days

As per the Digital Personal Data Protection Act, 2023 (DPDP Act), we are required to obtain your verifiable consent before processing your child's personal data.

To grant or decline consent:
1. Log in to the Parent Portal: {settings.FRONTEND_URL}/parent/login
2. Navigate to Privacy & Consent Management
3. Review and provide your decision

If you have questions about this consent request, please contact us at {settings.DEFAULT_FROM_EMAIL}.

Best regards,
School Administration
"""

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[parent_user.email],
            fail_silently=False,
        )

    @staticmethod
    def send_deletion_request_confirmation(deletion_request):
        """
        Confirm deletion request submission to parent
        """
        subject = f'Data Deletion Request Received - {deletion_request.student.get_full_name()}'

        message = f"""
Dear {deletion_request.requested_by.get_full_name()},

We have received your request to delete personal data of {deletion_request.student.get_full_name()}.

Request ID: {deletion_request.id}
Submitted on: {deletion_request.requested_at.strftime('%d %B %Y, %H:%M')}
Reason: {deletion_request.reason}

Your request is under review by our Data Protection Officer. We will:
1. Review the request for compliance with data retention policies
2. Verify that the student has no outstanding obligations
3. Process the deletion within 7 business days

Please note that certain data may need to be retained for legal or regulatory purposes (e.g., financial records for tax compliance, academic transcripts for regulatory requirements).

You will receive an email notification once your request has been processed.

If you have questions, please contact our Data Protection Officer at {settings.DEFAULT_FROM_EMAIL}.

Best regards,
School Administration
"""

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[deletion_request.requested_by.email],
            fail_silently=False,
        )

    @staticmethod
    def send_deletion_completion(deletion_request):
        """
        Notify parent when deletion is completed
        """
        subject = f'Data Deletion Completed - {deletion_request.student.get_full_name()}'

        message = f"""
Dear {deletion_request.requested_by.get_full_name()},

Your data deletion request has been processed.

Request ID: {deletion_request.id}
Completed on: {deletion_request.completed_at.strftime('%d %B %Y, %H:%M')}
Processed by: {deletion_request.completed_by.get_full_name() if deletion_request.completed_by else 'School Administration'}

Data Deleted:
- Personal information (soft deleted, anonymized after retention period)
- Health records
- Behavioral notes
- Uploaded documents

Data Retained (Legal/Regulatory Requirements):
- Financial records: 7 years (Income Tax Act)
- Academic transcripts: 10 years (Educational regulations)

Notes: {deletion_request.notes}

Your child's personal data has been deleted as per the DPDP Act, 2023 (Right to Erasure, Section 14).

If you have any questions about this deletion, please contact us at {settings.DEFAULT_FROM_EMAIL}.

Best regards,
School Administration
"""

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[deletion_request.requested_by.email],
            fail_silently=False,
        )

    @staticmethod
    def send_correction_request_confirmation(correction_request):
        """
        Confirm correction request submission to parent
        """
        subject = f'Data Correction Request Received - {correction_request.student.get_full_name()}'

        field_display = correction_request.field_name.replace('_', ' ').title()

        message = f"""
Dear {correction_request.requested_by.get_full_name()},

We have received your request to correct personal data of {correction_request.student.get_full_name()}.

Request ID: {correction_request.id}
Submitted on: {correction_request.requested_at.strftime('%d %B %Y, %H:%M')}
Field: {field_display}
Current Value: {correction_request.current_value}
Corrected Value: {correction_request.corrected_value}
Reason: {correction_request.reason}

Your request is under review. If the field requires administrative approval (e.g., Aadhaar number, Samagra ID, date of birth), we will verify the correction and process it within 72 hours.

You will receive an email notification once your request has been processed.

Best regards,
School Administration
"""

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[correction_request.requested_by.email],
            fail_silently=False,
        )

    @staticmethod
    def send_correction_completion(correction_request):
        """
        Notify parent when correction is completed
        """
        status_word = 'Approved' if correction_request.status == 'APPROVED' else 'Rejected'
        subject = f'Data Correction {status_word} - {correction_request.student.get_full_name()}'

        field_display = correction_request.field_name.replace('_', ' ').title()

        if correction_request.status == 'APPROVED':
            message = f"""
Dear {correction_request.requested_by.get_full_name()},

Your data correction request has been approved and applied.

Request ID: {correction_request.id}
Field: {field_display}
Previous Value: {correction_request.current_value}
Updated Value: {correction_request.corrected_value}
Completed on: {correction_request.completed_at.strftime('%d %B %Y, %H:%M')}

The student record has been updated with the corrected information.

Notes: {correction_request.notes}

Best regards,
School Administration
"""
        else:
            message = f"""
Dear {correction_request.requested_by.get_full_name()},

Your data correction request has been rejected.

Request ID: {correction_request.id}
Field: {field_display}
Requested Change: {correction_request.current_value} → {correction_request.corrected_value}
Rejection Reason: {correction_request.notes}

If you believe this rejection is incorrect, please contact us at {settings.DEFAULT_FROM_EMAIL} with supporting documentation.

Best regards,
School Administration
"""

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[correction_request.requested_by.email],
            fail_silently=False,
        )

    @staticmethod
    def send_data_breach_notification(breach, affected_students):
        """
        Notify parents of affected students about data breach
        DPDP Act requires notification within 72 hours
        """
        for student in affected_students:
            # Get parents
            from apps.students.models import StudentParent
            parent_links = StudentParent.objects.filter(
                student=student,
                is_deleted=False
            ).select_related('parent_user')

            for parent_link in parent_links:
                parent = parent_link.parent_user

                subject = f'[URGENT] Data Security Incident Notification'

                message = f"""
Dear {parent.get_full_name()},

We are writing to inform you of a data security incident that may have affected personal information of your child, {student.get_full_name()}.

Incident ID: {breach.breach_id}
Discovered on: {breach.discovered_at.strftime('%d %B %Y, %H:%M')}
Breach Type: {breach.get_breach_type_display()}
Severity: {breach.get_severity_display()}

What Happened:
{breach.description}

What Information Was Involved:
{', '.join(breach.data_affected) if isinstance(breach.data_affected, list) else breach.data_affected}

What We Are Doing:
{breach.remediation_steps}

What You Can Do:
- Monitor your child's accounts for any suspicious activity
- Be cautious of phishing attempts or suspicious communications
- Contact us immediately if you notice anything unusual
- Report any concerns to our Data Protection Officer at {settings.DEFAULT_FROM_EMAIL}

We take the privacy and security of student data very seriously and sincerely apologize for this incident. We have taken immediate steps to secure our systems and prevent future occurrences.

This notification is being provided in compliance with the Digital Personal Data Protection Act, 2023.

For further information or assistance, please contact:
- Data Protection Officer: {getattr(settings, 'DPO_EMAIL', settings.DEFAULT_FROM_EMAIL)}
- Phone: {getattr(settings, 'SUPPORT_PHONE', 'Contact school office')}

Incident Reference: {breach.breach_id}

Sincerely,
School Administration
"""

                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[parent.email],
                    fail_silently=False,
                )
