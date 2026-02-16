"""
Serializers for the Admissions module.
"""

from rest_framework import serializers
from .models import AdmissionEnquiry, AdmissionApplication, AdmissionDocument, AdmissionSetting


class AdmissionEnquirySerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    class_name = serializers.CharField(source='class_applied.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)

    class Meta:
        model = AdmissionEnquiry
        fields = [
            'id', 'name', 'phone', 'email', 'class_applied', 'class_name',
            'enquiry_date', 'source', 'source_display', 'status', 'status_display',
            'notes', 'follow_up_date', 'assigned_to', 'assigned_to_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdmissionDocumentSerializer(serializers.ModelSerializer):
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    verified_by_name = serializers.CharField(source='verified_by.get_full_name', read_only=True)

    class Meta:
        model = AdmissionDocument
        fields = [
            'id', 'application', 'document_type', 'document_type_display',
            'file', 'uploaded_at', 'verified', 'verified_by', 'verified_by_name',
            'verified_date',
        ]
        read_only_fields = ['id', 'uploaded_at']


class AdmissionApplicationSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    class_name = serializers.CharField(source='class_applied.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    documents = AdmissionDocumentSerializer(many=True, read_only=True)
    documents_count = serializers.SerializerMethodField()
    verified_documents_count = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionApplication
        fields = [
            'id', 'application_number', 'enquiry',
            # Student info
            'student_name', 'date_of_birth', 'gender', 'gender_display',
            # Academic
            'class_applied', 'class_name', 'academic_year', 'academic_year_name',
            # Parent info
            'father_name', 'mother_name', 'phone', 'email',
            # Address
            'address', 'city', 'state', 'pincode',
            # Previous school
            'previous_school', 'previous_class', 'board', 'percentage',
            # Status
            'status', 'status_display', 'submitted_date',
            'reviewed_by', 'reviewed_by_name', 'reviewed_date', 'remarks',
            # Documents
            'documents', 'documents_count', 'verified_documents_count',
            # Timestamps
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'application_number', 'created_at', 'updated_at']

    def get_documents_count(self, obj):
        return obj.documents.filter(is_deleted=False).count()

    def get_verified_documents_count(self, obj):
        return obj.documents.filter(is_deleted=False, verified=True).count()


class AdmissionApplicationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    class_name = serializers.CharField(source='class_applied.name', read_only=True)
    documents_complete = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionApplication
        fields = [
            'id', 'application_number', 'student_name', 'father_name',
            'phone', 'class_applied', 'class_name',
            'status', 'status_display', 'submitted_date',
            'documents_complete', 'created_at',
        ]

    def get_documents_complete(self, obj):
        total = obj.documents.filter(is_deleted=False).count()
        verified = obj.documents.filter(is_deleted=False, verified=True).count()
        return total > 0 and total == verified


class AdmissionSettingSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_applied.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    available_seats = serializers.IntegerField(read_only=True)
    is_open = serializers.BooleanField(read_only=True)

    class Meta:
        model = AdmissionSetting
        fields = [
            'id', 'academic_year', 'academic_year_name',
            'class_applied', 'class_name',
            'total_seats', 'filled_seats', 'available_seats', 'is_open',
            'application_start_date', 'application_end_date',
            'entrance_test_required', 'interview_required',
            'application_fee',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
