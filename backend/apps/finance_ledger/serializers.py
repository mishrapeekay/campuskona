from rest_framework import serializers
from .models import LedgerAccount, LedgerTransaction, LedgerEntry, FinancialSnapshot, FinancialAuditLog

class LedgerAccountSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True, allow_null=True)
    
    class Meta:
        model = LedgerAccount
        fields = ['id', 'name', 'account_type', 'school', 'school_name', 'balance', 'currency', 'is_active']
        read_only_fields = ['balance']

class LedgerEntrySerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    
    class Meta:
        model = LedgerEntry
        fields = ['id', 'account', 'account_name', 'debit', 'credit']

class LedgerTransactionSerializer(serializers.ModelSerializer):
    entries = LedgerEntrySerializer(many=True, read_only=True)
    
    class Meta:
        model = LedgerTransaction
        fields = [
            'id', 'reference_id', 'description', 'transaction_type', 
            'status', 'timestamp', 'transaction_hash', 'previous_hash', 'entries'
        ]
        read_only_fields = ['transaction_hash', 'previous_hash', 'timestamp']

class FinancialSnapshotSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
    class Meta:
        model = FinancialSnapshot
        fields = ['id', 'timestamp', 'report_name', 'data', 'integrity_hash', 'generated_by', 'generated_by_name']
        read_only_fields = ['integrity_hash', 'timestamp']

class FinancialAuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    
    class Meta:
        model = FinancialAuditLog
        fields = '__all__'
