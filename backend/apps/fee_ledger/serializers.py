from rest_framework import serializers
from .models import FeeLedgerEntry

class FeeLedgerEntrySerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    
    class Meta:
        model = FeeLedgerEntry
        fields = [
            'id', 'student', 'student_name', 'entry_type', 
            'base_amount', 'cgst', 'sgst', 'igst', 'tds_deducted',
            'total_amount', 'running_balance', 'reference_id', 
            'description', 'created_at', 'entry_hash'
        ]
        read_only_fields = fields
