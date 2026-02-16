"""
DPDP Act 2023 Compliance Models
Handles consent management, grievances, data breaches, and data subject rights
"""
import uuid
from django.db import models
from django.utils import timezone
from apps.core.models import BaseModel


class ConsentPurpose(BaseModel):
    """
    Master list of data processing purposes
    Defines why and how long student data is processed
    """
    code = models.CharField(max_length=50, unique=True, help_text="Unique identifier code")
    name = models.CharField(max_length=200)
    description = models.TextField(help_text="Clear explanation of purpose")
    is_mandatory = models.BooleanField(
        default=False,
        help_text="Whether consent is mandatory for service delivery"
    )
    category = models.CharField(
        max_length=50,
        choices=[
            ('EDUCATIONAL', 'Educational Activities'),
            ('ADMINISTRATIVE', 'Administrative'),
            ('COMMUNICATION', 'Communication'),
            ('HEALTH', 'Health & Safety'),
            ('FINANCIAL', 'Financial'),
            ('ANALYTICS', 'Analytics & Improvement'),
            ('THIRD_PARTY', 'Third-Party Sharing'),
        ]
    )
    legal_basis = models.TextField(help_text="Explanation of legal basis for processing")
    retention_period_days = models.IntegerField(
        help_text="Number of days to retain data for this purpose"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'privacy_consent_purpose'
        verbose_name = 'Consent Purpose'
        verbose_name_plural = 'Consent Purposes'
        ordering = ['is_mandatory', 'category', 'name']

    def __str__(self):
        return f"{self.name} ({'Mandatory' if self.is_mandatory else 'Optional'})"


class ParentalConsent(BaseModel):
    """
    Tracks parental consent for student data processing
    Implements Section 9.1 of DPDP Act (Verifiable Consent Obligation)
    """
    consent_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='consents'
    )
    parent_user = models.ForeignKey(
        'authentication.User',
        on_delete=models.CASCADE,
        related_name='consents_given'
    )
    purpose = models.ForeignKey(
        ConsentPurpose,
        on_delete=models.PROTECT,
        related_name='consents'
    )

    # Consent details
    consent_given = models.BooleanField(default=False)
    consent_text = models.TextField(
        help_text="Exact text shown to parent when requesting consent"
    )
    consent_date = models.DateTimeField(null=True, blank=True)

    # Verification (DPDP Rule 10 - Verifiable Consent)
    verification_method = models.CharField(
        max_length=50,
        choices=[
            ('EMAIL_OTP', 'Email OTP'),
            ('SMS_OTP', 'SMS OTP'),
            ('AADHAAR_VIRTUAL_TOKEN', 'Aadhaar Virtual Token'),
            ('EXISTING_IDENTITY', 'Existing Identity on File'),
            ('MANUAL_VERIFICATION', 'Manual Verification by School'),
        ]
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_data = models.JSONField(
        default=dict,
        help_text="Stores verification details (OTP timestamp, token reference, etc.)"
    )

    # Withdrawal (DPDP Section 6 - Right to withdraw consent)
    withdrawn = models.BooleanField(default=False)
    withdrawn_at = models.DateTimeField(null=True, blank=True)
    withdrawal_reason = models.TextField(blank=True)

    # Audit trail
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)

    class Meta:
        db_table = 'privacy_parental_consent'
        verbose_name = 'Parental Consent'
        verbose_name_plural = 'Parental Consents'
        unique_together = [['student', 'parent_user', 'purpose']]
        indexes = [
            models.Index(fields=['student', 'purpose', 'consent_given']),
            models.Index(fields=['parent_user', 'consent_date']),
            models.Index(fields=['withdrawn', 'withdrawn_at']),
        ]

    def __str__(self):
        status = "Given" if self.consent_given and not self.withdrawn else "Pending/Withdrawn"
        return f"{self.parent_user.get_full_name()} - {self.purpose.name} - {status}"

    def is_valid(self):
        """Check if consent is currently valid"""
        return self.consent_given and not self.withdrawn


class ConsentAuditLog(BaseModel):
    """
    Immutable audit trail of all consent actions
    Required for DPDP compliance audits
    """
    consent = models.ForeignKey(
        ParentalConsent,
        on_delete=models.PROTECT,
        related_name='audit_logs'
    )
    action = models.CharField(
        max_length=50,
        choices=[
            ('REQUESTED', 'Consent Requested'),
            ('GIVEN', 'Consent Given'),
            ('VERIFIED', 'Verification Completed'),
            ('WITHDRAWN', 'Consent Withdrawn'),
            ('EXPIRED', 'Consent Expired'),
            ('RENEWED', 'Consent Renewed'),
        ]
    )
    performed_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict, help_text="Additional action details")
    ip_address = models.GenericIPAddressField()

    class Meta:
        db_table = 'privacy_consent_audit_log'
        verbose_name = 'Consent Audit Log'
        verbose_name_plural = 'Consent Audit Logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['consent', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.action} - {self.consent.student.full_name} - {self.timestamp}"


class Grievance(BaseModel):
    """
    DPDP Act Section 12 - Grievance Redressal
    Tracks privacy-related complaints and their resolution
    """
    grievance_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='grievances'
    )
    filed_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.PROTECT,
        related_name='grievances_filed'
    )

    # Grievance details
    category = models.CharField(
        max_length=50,
        choices=[
            ('CONSENT_VIOLATION', 'Consent Violation'),
            ('DATA_BREACH', 'Data Breach'),
            ('UNAUTHORIZED_ACCESS', 'Unauthorized Access'),
            ('DATA_INACCURACY', 'Data Inaccuracy'),
            ('RETENTION_VIOLATION', 'Retention Policy Violation'),
            ('RIGHT_TO_ACCESS', 'Right to Access Denied'),
            ('RIGHT_TO_ERASURE', 'Right to Erasure Denied'),
            ('OTHER', 'Other Privacy Concern'),
        ]
    )
    subject = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Low'),
            ('MEDIUM', 'Medium'),
            ('HIGH', 'High'),
            ('CRITICAL', 'Critical'),
        ],
        default='MEDIUM'
    )

    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=[
            ('SUBMITTED', 'Submitted'),
            ('ACKNOWLEDGED', 'Acknowledged'),
            ('UNDER_REVIEW', 'Under Review'),
            ('RESOLVED', 'Resolved'),
            ('CLOSED', 'Closed'),
        ],
        default='SUBMITTED'
    )

    # Timeline tracking (DPDP requires resolution within reasonable time)
    filed_at = models.DateTimeField(auto_now_add=True)
    acknowledged_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Must acknowledge within 24 hours"
    )
    resolved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Target: 72 hours for critical issues"
    )

    # Assignment
    assigned_to = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_grievances'
    )

    # Resolution
    resolution_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_grievances'
    )

    class Meta:
        db_table = 'privacy_grievance'
        verbose_name = 'Grievance'
        verbose_name_plural = 'Grievances'
        ordering = ['-filed_at']
        indexes = [
            models.Index(fields=['status', '-filed_at']),
            models.Index(fields=['severity', '-filed_at']),
            models.Index(fields=['filed_by', '-filed_at']),
        ]

    def __str__(self):
        return f"Grievance {self.grievance_id} - {self.subject} - {self.status}"

    def is_overdue(self):
        """Check if grievance resolution is overdue based on severity"""
        if self.status in ['RESOLVED', 'CLOSED']:
            return False

        now = timezone.now()
        filed_ago = now - self.filed_at

        # Critical: 24 hours, High: 48 hours, Medium: 72 hours, Low: 7 days
        thresholds = {
            'CRITICAL': timezone.timedelta(hours=24),
            'HIGH': timezone.timedelta(hours=48),
            'MEDIUM': timezone.timedelta(hours=72),
            'LOW': timezone.timedelta(days=7),
        }

        threshold = thresholds.get(self.severity, timezone.timedelta(hours=72))
        return filed_ago > threshold


class GrievanceComment(BaseModel):
    """Comments and updates on grievances"""
    grievance = models.ForeignKey(
        Grievance,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True
    )
    comment = models.TextField()
    is_internal = models.BooleanField(
        default=False,
        help_text="Internal staff notes not visible to parent"
    )

    class Meta:
        db_table = 'privacy_grievance_comment'
        verbose_name = 'Grievance Comment'
        verbose_name_plural = 'Grievance Comments'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment on {self.grievance.grievance_id} by {self.user}"


class DataBreach(BaseModel):
    """
    Track data breaches for DPDP Section 8 compliance
    Requires notification to Data Protection Board within 72 hours
    """
    breach_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    # Breach details
    title = models.CharField(max_length=200)
    description = models.TextField()
    breach_type = models.CharField(
        max_length=50,
        choices=[
            ('UNAUTHORIZED_ACCESS', 'Unauthorized Access'),
            ('DATA_LOSS', 'Data Loss'),
            ('RANSOMWARE', 'Ransomware Attack'),
            ('ACCIDENTAL_DISCLOSURE', 'Accidental Disclosure'),
            ('THEFT', 'Physical Theft'),
            ('SYSTEM_VULNERABILITY', 'System Vulnerability Exploited'),
            ('OTHER', 'Other'),
        ]
    )
    severity = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Low Risk'),
            ('MEDIUM', 'Medium Risk'),
            ('HIGH', 'High Risk - Notification Required'),
            ('CRITICAL', 'Critical - Immediate Notification'),
        ]
    )

    # Impact assessment
    data_affected = models.JSONField(
        default=list,
        help_text="List of data types compromised (e.g., ['Aadhar', 'Health Records'])"
    )
    students_affected_count = models.IntegerField(default=0)
    students_affected = models.ManyToManyField(
        'students.Student',
        blank=True,
        related_name='data_breaches'
    )

    # Timeline (DPDP requires notification within 72 hours)
    discovered_at = models.DateTimeField(help_text="When breach was discovered")
    contained_at = models.DateTimeField(null=True, blank=True)
    reported_to_dpb_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When reported to Data Protection Board"
    )
    parents_notified_at = models.DateTimeField(null=True, blank=True)

    # Notifications
    dpb_notification_sent = models.BooleanField(default=False)
    parent_notifications_sent = models.BooleanField(default=False)

    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('DISCOVERED', 'Discovered'),
            ('INVESTIGATING', 'Under Investigation'),
            ('CONTAINED', 'Contained'),
            ('NOTIFIED', 'Notifications Sent'),
            ('RESOLVED', 'Resolved'),
        ],
        default='DISCOVERED'
    )

    # Remediation
    remediation_steps = models.TextField(blank=True)
    lessons_learned = models.TextField(blank=True)

    class Meta:
        db_table = 'privacy_data_breach'
        verbose_name = 'Data Breach'
        verbose_name_plural = 'Data Breaches'
        ordering = ['-discovered_at']
        indexes = [
            models.Index(fields=['severity', '-discovered_at']),
            models.Index(fields=['status', '-discovered_at']),
        ]

    def __str__(self):
        return f"Breach {self.breach_id} - {self.title} - {self.severity}"

    def is_notification_overdue(self):
        """Check if 72-hour notification deadline passed"""
        if self.dpb_notification_sent:
            return False

        if self.severity not in ['HIGH', 'CRITICAL']:
            return False

        now = timezone.now()
        time_since_discovery = now - self.discovered_at
        return time_since_discovery > timezone.timedelta(hours=72)


class DeletionRequest(BaseModel):
    """
    Track Right to Erasure requests (DPDP Section 14)
    Handles parent requests to delete child's data
    """
    request_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.PROTECT,
        related_name='deletion_requests'
    )
    requested_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.PROTECT,
        related_name='deletion_requests_filed'
    )
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending Review'),
            ('APPROVED', 'Approved'),
            ('REJECTED', 'Rejected'),
            ('COMPLETED', 'Deletion Completed'),
        ],
        default='PENDING'
    )
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deletions_completed'
    )
    notes = models.TextField(blank=True, help_text="Admin notes on deletion")

    class Meta:
        db_table = 'privacy_deletion_request'
        verbose_name = 'Deletion Request'
        verbose_name_plural = 'Deletion Requests'
        ordering = ['-requested_at']

    def __str__(self):
        return f"Deletion Request {self.request_id} - {self.student.full_name} - {self.status}"


class CorrectionRequest(BaseModel):
    """
    Track Right to Correction requests (DPDP Section 13)
    Handles parent requests to correct inaccurate data
    """
    request_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.PROTECT,
        related_name='correction_requests'
    )
    requested_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.PROTECT,
        related_name='correction_requests_filed'
    )
    field_name = models.CharField(
        max_length=100,
        help_text="Field to be corrected (e.g., 'date_of_birth', 'aadhar_number')"
    )
    current_value = models.TextField()
    corrected_value = models.TextField()
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending Review'),
            ('APPROVED', 'Approved'),
            ('REJECTED', 'Rejected'),
            ('COMPLETED', 'Correction Completed'),
        ],
        default='PENDING'
    )
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='corrections_completed'
    )
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'privacy_correction_request'
        verbose_name = 'Correction Request'
        verbose_name_plural = 'Correction Requests'
        ordering = ['-requested_at']

    def __str__(self):
        return f"Correction Request {self.request_id} - {self.student.full_name} - {self.field_name}"


class SensitiveDataAccess(BaseModel):
    """
    Audit trail for accessing sensitive student data fields
    Tracks who accessed what sensitive data and when (DPDP compliance)
    """
    access_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    # Who accessed
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.PROTECT,
        related_name='sensitive_data_accesses'
    )

    # What was accessed
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.PROTECT,
        related_name='sensitive_accesses'
    )
    field_name = models.CharField(
        max_length=100,
        help_text="Name of sensitive field accessed"
    )
    field_value_hash = models.CharField(
        max_length=64,
        help_text="SHA256 hash of accessed value (for integrity verification)",
        blank=True
    )

    # Access context
    access_type = models.CharField(
        max_length=20,
        choices=[
            ('VIEW', 'View'),
            ('EDIT', 'Edit'),
            ('EXPORT', 'Export'),
            ('DELETE', 'Delete'),
        ],
        default='VIEW'
    )
    access_reason = models.CharField(
        max_length=200,
        blank=True,
        help_text="Why the data was accessed (e.g., 'Admission form review')"
    )

    # When and how
    accessed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=500, blank=True)
    session_id = models.CharField(max_length=100, blank=True)

    # API endpoint details
    request_method = models.CharField(max_length=10, blank=True)  # GET, POST, etc.
    request_path = models.CharField(max_length=500, blank=True)

    # Consent verification
    has_valid_consent = models.BooleanField(
        default=False,
        help_text="Whether parent consent was verified at time of access"
    )
    consent_purpose = models.ForeignKey(
        ConsentPurpose,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # Risk flagging
    is_flagged = models.BooleanField(
        default=False,
        help_text="Flagged for suspicious access pattern"
    )
    flag_reason = models.CharField(max_length=500, blank=True)
    reviewed_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_accesses'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'privacy_sensitive_data_access'
        verbose_name = 'Sensitive Data Access Log'
        verbose_name_plural = 'Sensitive Data Access Logs'
        ordering = ['-accessed_at']
        indexes = [
            models.Index(fields=['student', 'accessed_at']),
            models.Index(fields=['user', 'accessed_at']),
            models.Index(fields=['field_name', 'accessed_at']),
            models.Index(fields=['is_flagged', 'reviewed_at']),
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} accessed {self.field_name} of {self.student.full_name} on {self.accessed_at}"

    @property
    def is_suspicious(self):
        """Check if access pattern is suspicious"""
        # Access during unusual hours (10 PM - 6 AM)
        hour = self.accessed_at.hour
        if hour >= 22 or hour <= 6:
            return True

        # Access to multiple students in short time
        recent_accesses = SensitiveDataAccess.objects.filter(
            user=self.user,
            accessed_at__gte=timezone.now() - timezone.timedelta(minutes=5)
        ).exclude(id=self.id).count()

        if recent_accesses > 20:
            return True

        return False


class AccessPatternAlert(BaseModel):
    """
    Alerts for suspicious access patterns
    Automatically generated when anomalies detected
    """
    alert_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    # Alert details
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.PROTECT,
        related_name='access_alerts'
    )
    alert_type = models.CharField(
        max_length=50,
        choices=[
            ('BULK_ACCESS', 'Bulk Data Access'),
            ('UNUSUAL_HOURS', 'Access During Unusual Hours'),
            ('UNAUTHORIZED_FIELD', 'Unauthorized Field Access'),
            ('REPEATED_FAILED_ACCESS', 'Repeated Failed Access Attempts'),
            ('NO_CONSENT', 'Access Without Valid Consent'),
            ('EXPORT_ANOMALY', 'Unusual Export Pattern'),
        ]
    )
    severity = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Low'),
            ('MEDIUM', 'Medium'),
            ('HIGH', 'High'),
            ('CRITICAL', 'Critical'),
        ],
        default='MEDIUM'
    )

    # Evidence
    description = models.TextField()
    affected_students_count = models.IntegerField(default=0)
    affected_students = models.ManyToManyField(
        'students.Student',
        blank=True,
        related_name='access_pattern_alerts'
    )
    related_accesses = models.ManyToManyField(
        SensitiveDataAccess,
        blank=True,
        related_name='alerts'
    )

    # Detection metadata
    detected_at = models.DateTimeField(auto_now_add=True, db_index=True)
    detection_rule = models.CharField(max_length=200, blank=True)

    # Response
    status = models.CharField(
        max_length=20,
        choices=[
            ('NEW', 'New'),
            ('INVESTIGATING', 'Under Investigation'),
            ('FALSE_POSITIVE', 'False Positive'),
            ('CONFIRMED', 'Confirmed Violation'),
            ('RESOLVED', 'Resolved'),
        ],
        default='NEW'
    )
    assigned_to = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_alerts'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)

    class Meta:
        db_table = 'privacy_access_pattern_alert'
        verbose_name = 'Access Pattern Alert'
        verbose_name_plural = 'Access Pattern Alerts'
        ordering = ['-detected_at']
        indexes = [
            models.Index(fields=['user', 'detected_at']),
            models.Index(fields=['alert_type', 'severity']),
            models.Index(fields=['status', 'detected_at']),
        ]

    def __str__(self):
        return f"{self.alert_type} - {self.severity} - {self.user.get_full_name()}"
