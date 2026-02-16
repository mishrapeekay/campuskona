"""
DPDP Act 2023 Compliance - API Serializers
"""
from rest_framework import serializers
from apps.privacy.models import (
    ConsentPurpose,
    ParentalConsent,
    ConsentAuditLog,
    Grievance,
    GrievanceComment,
    DataBreach,
    DeletionRequest,
    CorrectionRequest,
    SensitiveDataAccess,
    AccessPatternAlert,
)


class ConsentPurposeSerializer(serializers.ModelSerializer):
    """Serializer for consent purposes master data"""

    class Meta:
        model = ConsentPurpose
        fields = [
            'id',
            'code',
            'name',
            'description',
            'is_mandatory',
            'category',
            'legal_basis',
            'retention_period_days',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ConsentAuditLogSerializer(serializers.ModelSerializer):
    """Serializer for consent audit trail"""
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)

    class Meta:
        model = ConsentAuditLog
        fields = [
            'id',
            'action',
            'performed_by',
            'performed_by_name',
            'timestamp',
            'details',
            'ip_address',
        ]
        read_only_fields = ['id', 'timestamp']


class ParentalConsentSerializer(serializers.ModelSerializer):
    """Serializer for parental consent records"""
    purpose_details = ConsentPurposeSerializer(source='purpose', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    parent_name = serializers.CharField(source='parent_user.get_full_name', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    audit_logs = ConsentAuditLogSerializer(many=True, read_only=True, source='consentauditlog_set')

    class Meta:
        model = ParentalConsent
        fields = [
            'id',
            'consent_id',
            'student',
            'student_name',
            'parent_user',
            'parent_name',
            'purpose',
            'purpose_details',
            'consent_given',
            'consent_text',
            'consent_date',
            'verification_method',
            'verified_at',
            'verification_data',
            'withdrawn',
            'withdrawn_at',
            'withdrawal_reason',
            'ip_address',
            'user_agent',
            'is_valid',
            'audit_logs',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'consent_id',
            'consent_date',
            'verified_at',
            'withdrawn_at',
            'is_valid',
            'created_at',
            'updated_at',
        ]


class ConsentRequestSerializer(serializers.Serializer):
    """Serializer for requesting consent"""
    student_id = serializers.IntegerField(required=True)
    purpose_code = serializers.CharField(max_length=50, required=True)
    verification_method = serializers.ChoiceField(
        choices=[
            ('EMAIL_OTP', 'Email OTP'),
            ('SMS_OTP', 'SMS OTP'),
            ('AADHAAR_VIRTUAL_TOKEN', 'Aadhaar Virtual Token'),
            ('EXISTING_IDENTITY', 'Existing Identity'),
            ('MANUAL_VERIFICATION', 'Manual Verification'),
        ],
        default='EMAIL_OTP'
    )


class ConsentGrantSerializer(serializers.Serializer):
    """Serializer for granting consent"""
    consent_id = serializers.UUIDField(required=True)
    otp = serializers.CharField(max_length=6, required=False, allow_blank=True)
    agreed = serializers.BooleanField(required=True)


class ConsentWithdrawalSerializer(serializers.Serializer):
    """Serializer for withdrawing consent"""
    reason = serializers.CharField(required=False, allow_blank=True)


class GrievanceCommentSerializer(serializers.ModelSerializer):
    """Serializer for grievance comments"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = GrievanceComment
        fields = [
            'id',
            'user',
            'user_name',
            'comment',
            'is_internal',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class GrievanceSerializer(serializers.ModelSerializer):
    """Serializer for grievance records"""
    filed_by_name = serializers.CharField(source='filed_by.get_full_name', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True, allow_null=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True, allow_null=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True, allow_null=True)
    is_overdue = serializers.BooleanField(read_only=True)
    comments = GrievanceCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Grievance
        fields = [
            'id',
            'grievance_id',
            'student',
            'student_name',
            'filed_by',
            'filed_by_name',
            'category',
            'subject',
            'description',
            'severity',
            'status',
            'filed_at',
            'acknowledged_at',
            'resolved_at',
            'assigned_to',
            'assigned_to_name',
            'resolution_notes',
            'resolved_by',
            'resolved_by_name',
            'is_overdue',
            'comments',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'grievance_id',
            'filed_at',
            'acknowledged_at',
            'resolved_at',
            'is_overdue',
            'created_at',
            'updated_at',
        ]


class DataBreachSerializer(serializers.ModelSerializer):
    """Serializer for data breach records"""
    students_affected_names = serializers.SerializerMethodField()
    is_notification_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = DataBreach
        fields = [
            'id',
            'breach_id',
            'title',
            'description',
            'breach_type',
            'severity',
            'data_affected',
            'students_affected_count',
            'students_affected',
            'students_affected_names',
            'discovered_at',
            'contained_at',
            'reported_to_dpb_at',
            'parents_notified_at',
            'dpb_notification_sent',
            'parent_notifications_sent',
            'status',
            'remediation_steps',
            'lessons_learned',
            'is_notification_overdue',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'breach_id',
            'is_notification_overdue',
            'created_at',
            'updated_at',
        ]

    def get_students_affected_names(self, obj):
        return [student.full_name for student in obj.students_affected.all()[:10]]


class DeletionRequestSerializer(serializers.ModelSerializer):
    """Serializer for right to erasure requests"""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    completed_by_name = serializers.CharField(source='completed_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = DeletionRequest
        fields = [
            'id',
            'request_id',
            'student',
            'student_name',
            'requested_by',
            'requested_by_name',
            'reason',
            'status',
            'requested_at',
            'reviewed_at',
            'completed_at',
            'completed_by',
            'completed_by_name',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'request_id',
            'requested_at',
            'reviewed_at',
            'completed_at',
            'created_at',
            'updated_at',
        ]


class CorrectionRequestSerializer(serializers.ModelSerializer):
    """Serializer for right to correction requests"""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    completed_by_name = serializers.CharField(source='completed_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = CorrectionRequest
        fields = [
            'id',
            'request_id',
            'student',
            'student_name',
            'requested_by',
            'requested_by_name',
            'field_name',
            'current_value',
            'corrected_value',
            'reason',
            'status',
            'requested_at',
            'reviewed_at',
            'completed_at',
            'completed_by',
            'completed_by_name',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'request_id',
            'requested_at',
            'reviewed_at',
            'completed_at',
            'created_at',
            'updated_at',
        ]


class SensitiveDataAccessSerializer(serializers.ModelSerializer):
    """Serializer for sensitive data access audit logs"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_admission_number = serializers.CharField(source='student.admission_number', read_only=True)
    field_display_name = serializers.SerializerMethodField()

    class Meta:
        model = SensitiveDataAccess
        fields = [
            'id', 'access_id', 'user', 'user_name', 'student', 'student_name',
            'student_admission_number', 'field_name', 'field_display_name',
            'field_value_hash', 'access_type', 'access_reason', 'accessed_at',
            'ip_address', 'user_agent', 'session_id', 'request_method',
            'request_path', 'has_valid_consent', 'consent_purpose',
            'is_flagged', 'flag_reason', 'reviewed_by', 'reviewed_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'access_id', 'field_value_hash', 'accessed_at', 'created_at', 'updated_at']

    def get_field_display_name(self, obj):
        return obj.field_name.replace('_', ' ').title()


class AccessPatternAlertSerializer(serializers.ModelSerializer):
    """Serializer for access pattern alerts"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    affected_students_list = serializers.SerializerMethodField()
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)

    class Meta:
        model = AccessPatternAlert
        fields = [
            'id', 'alert_id', 'user', 'user_name', 'alert_type', 'severity',
            'description', 'affected_students_count', 'affected_students_list',
            'detected_at', 'detection_rule', 'status', 'assigned_to',
            'assigned_to_name', 'resolved_at', 'resolution_notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'alert_id', 'affected_students_count', 'detected_at', 'detection_rule', 'created_at', 'updated_at']

    def get_affected_students_list(self, obj):
        students = obj.affected_students.all()[:10]
        return [{'id': s.id, 'admission_number': s.admission_number, 'full_name': s.full_name} for s in students]
