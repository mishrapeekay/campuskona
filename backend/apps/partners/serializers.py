"""
Partner Commission Serializers

Serializers for partner commission tracking API.
"""

from rest_framework import serializers
from .models import Partner, Lead, Commission, CommissionRule, Payout


class PartnerSerializer(serializers.ModelSerializer):
    """Serializer for Partner model."""
    
    conversion_rate = serializers.ReadOnlyField()
    pending_commission = serializers.ReadOnlyField()
    
    class Meta:
        model = Partner
        fields = [
            'id', 'name', 'email', 'phone', 'company_name',
            'partner_code', 'commission_type', 'commission_rate',
            'flat_commission_amount', 'bank_name', 'account_number',
            'ifsc_code', 'pan_number', 'gst_number', 'upi_id',
            'status', 'total_leads', 'total_conversions',
            'total_commission_earned', 'total_commission_paid',
            'conversion_rate', 'pending_commission',
            'joined_date', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'partner_code', 'total_leads', 'total_conversions',
            'total_commission_earned', 'total_commission_paid',
            'joined_date', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        """Generate partner code on creation."""
        # Generate partner code
        last_partner = Partner.objects.order_by('-created_at').first()
        if last_partner and last_partner.partner_code.startswith('PARTNER'):
            try:
                last_num = int(last_partner.partner_code.replace('PARTNER', ''))
                new_num = last_num + 1
            except ValueError:
                new_num = 1
        else:
            new_num = 1
        
        validated_data['partner_code'] = f'PARTNER{new_num:04d}'
        return super().create(validated_data)


class PartnerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for partner list."""
    
    conversion_rate = serializers.ReadOnlyField()
    pending_commission = serializers.ReadOnlyField()
    
    class Meta:
        model = Partner
        fields = [
            'id', 'name', 'email', 'partner_code', 'status',
            'total_leads', 'total_conversions', 'conversion_rate',
            'total_commission_earned', 'pending_commission'
        ]


class LeadSerializer(serializers.ModelSerializer):
    """Serializer for Lead model."""
    
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    partner_code = serializers.CharField(source='partner.partner_code', read_only=True)
    converted_school_name = serializers.CharField(source='converted_school.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'id', 'partner', 'partner_name', 'partner_code',
            'school_name', 'contact_person', 'email', 'phone',
            'city', 'state', 'estimated_students', 'board', 'notes',
            'status', 'converted_school', 'converted_school_name',
            'conversion_date', 'lost_reason', 'lost_notes',
            'assigned_to', 'assigned_to_name', 'last_contacted_date',
            'submitted_date', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'converted_school', 'conversion_date',
            'submitted_date', 'created_at', 'updated_at'
        ]


class LeadSubmissionSerializer(serializers.Serializer):
    """Serializer for lead submission by partners."""
    
    partner_code = serializers.CharField(max_length=20)
    school_name = serializers.CharField(max_length=255)
    contact_person = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    estimated_students = serializers.IntegerField(required=False, allow_null=True)
    board = serializers.CharField(max_length=50, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)


class LeadConversionSerializer(serializers.Serializer):
    """Serializer for converting a lead."""
    
    school_id = serializers.UUIDField()


class CommissionRuleSerializer(serializers.ModelSerializer):
    """Serializer for CommissionRule model."""
    
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = CommissionRule
        fields = [
            'id', 'name', 'description', 'partner', 'partner_name',
            'subscription_tier', 'calculation_type',
            'commission_percentage', 'flat_amount', 'recurring_months',
            'priority', 'is_active', 'is_valid',
            'valid_from', 'valid_until', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_valid(self, obj):
        """Check if rule is currently valid."""
        return obj.is_valid_now()


class CommissionSerializer(serializers.ModelSerializer):
    """Serializer for Commission model."""
    
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    lead_school_name = serializers.CharField(source='lead.school_name', read_only=True)
    school_name = serializers.CharField(source='school.name', read_only=True)
    commission_rule_name = serializers.CharField(source='commission_rule.name', read_only=True)
    payout_number = serializers.CharField(source='payout.payout_number', read_only=True)
    
    class Meta:
        model = Commission
        fields = [
            'id', 'partner', 'partner_name', 'lead', 'lead_school_name',
            'school', 'school_name', 'subscription_amount',
            'commission_amount', 'commission_rule', 'commission_rule_name',
            'commission_type', 'period_start', 'period_end',
            'status', 'payout', 'payout_number', 'notes',
            'earned_date', 'approved_date', 'paid_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'approved_date', 'paid_date', 'created_at', 'updated_at'
        ]


class CommissionApprovalSerializer(serializers.Serializer):
    """Serializer for approving commissions."""
    
    commission_ids = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=False
    )


class PayoutSerializer(serializers.ModelSerializer):
    """Serializer for Payout model."""
    
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    partner_code = serializers.CharField(source='partner.partner_code', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Payout
        fields = [
            'id', 'partner', 'partner_name', 'partner_code',
            'payout_number', 'total_amount', 'commission_count',
            'period_start', 'period_end', 'payment_method',
            'transaction_reference', 'status', 'tds_percentage',
            'tds_amount', 'net_amount', 'invoice_url',
            'payment_receipt_url', 'notes', 'payout_date',
            'created_at', 'updated_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = [
            'id', 'payout_number', 'tds_amount', 'net_amount',
            'payout_date', 'created_at', 'updated_at'
        ]


class PayoutCreateSerializer(serializers.Serializer):
    """Serializer for creating a payout."""
    
    partner_id = serializers.UUIDField()
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    tds_percentage = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10.00,
        min_value=0,
        max_value=100
    )


class PayoutProcessSerializer(serializers.Serializer):
    """Serializer for processing a payout."""
    
    payment_method = serializers.ChoiceField(
        choices=Payout.PAYMENT_METHOD_CHOICES
    )
    transaction_reference = serializers.CharField(max_length=100, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)


class PartnerStatisticsSerializer(serializers.Serializer):
    """Serializer for partner statistics."""
    
    total_partners = serializers.IntegerField()
    active_partners = serializers.IntegerField()
    total_leads = serializers.IntegerField()
    converted_leads = serializers.IntegerField()
    conversion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_commission_earned = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_commission_paid = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_commission = serializers.DecimalField(max_digits=12, decimal_places=2)


class LeadStatisticsSerializer(serializers.Serializer):
    """Serializer for lead statistics."""
    
    total_leads = serializers.IntegerField()
    converted_leads = serializers.IntegerField()
    lost_leads = serializers.IntegerField()
    active_leads = serializers.IntegerField()
    conversion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)


class PayoutSummarySerializer(serializers.Serializer):
    """Serializer for payout summary."""
    
    total_payouts = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_tds = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_net_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    completed_payouts = serializers.IntegerField()
    pending_payouts = serializers.IntegerField()
