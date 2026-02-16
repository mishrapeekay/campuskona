from rest_framework import serializers
from .models import ReportGeneration, RTEComplianceRecord

class ReportGenerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportGeneration
        fields = '__all__'
        read_only_fields = ['status', 'generated_file', 'error_message', 'created_by']

class RTEComplianceRecordSerializer(serializers.ModelSerializer):
    compliance_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = RTEComplianceRecord
        fields = '__all__'
        read_only_fields = ['seats_filled_rte', 'compliance_percentage', 'verification_status', 'verified_by', 'verification_date']
