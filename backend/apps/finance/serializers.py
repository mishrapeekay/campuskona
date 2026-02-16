"""
Serializers for Finance Management
"""

from rest_framework import serializers
from .models import (
    FeeCategory,
    FeeStructure,
    StudentFee,
    Payment,
    PaymentAllocation,
    Expense,
    Invoice,
    InvoiceItem
)


class FeeCategorySerializer(serializers.ModelSerializer):
    """Serializer for fee categories"""
    class Meta:
        model = FeeCategory
        fields = [
            'id', 'name', 'code', 'description', 'is_mandatory',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class FeeStructureSerializer(serializers.ModelSerializer):
    """Serializer for fee structures"""
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    fee_category_name = serializers.CharField(source='fee_category.name', read_only=True)
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    
    class Meta:
        model = FeeStructure
        fields = [
            'id', 'academic_year', 'academic_year_name', 'class_obj', 'class_name',
            'fee_category', 'fee_category_name', 'amount', 'frequency',
            'frequency_display', 'due_day', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class StudentFeeSerializer(serializers.ModelSerializer):
    """Serializer for student fees"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_admission_number = serializers.CharField(source='student.admission_number', read_only=True)
    fee_category_name = serializers.CharField(source='fee_structure.fee_category.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    balance_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = StudentFee
        fields = [
            'id', 'student', 'student_name', 'student_admission_number',
            'fee_structure', 'fee_category_name', 'academic_year',
            'amount', 'discount_amount', 'discount_reason', 'final_amount',
            'paid_amount', 'balance_amount', 'due_date', 'status',
            'status_display', 'remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['final_amount', 'paid_amount', 'created_at', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    received_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'student_name', 'receipt_number', 'payment_date',
            'amount', 'payment_method', 'payment_method_display',
            'transaction_id', 'status', 'status_display', 'remarks',
            'received_by', 'received_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['received_by', 'created_at', 'updated_at']
    
    def get_received_by_name(self, obj):
        """Get receiver name"""
        return obj.received_by.get_full_name() if obj.received_by else None


class PaymentAllocationSerializer(serializers.ModelSerializer):
    """Serializer for payment allocations"""
    payment_receipt = serializers.CharField(source='payment.receipt_number', read_only=True)
    fee_description = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentAllocation
        fields = [
            'id', 'payment', 'payment_receipt', 'student_fee',
            'fee_description', 'allocated_amount',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_fee_description(self, obj):
        """Get fee description"""
        return f"{obj.student_fee.fee_structure.fee_category.name}"


class PaymentWithAllocationsSerializer(serializers.ModelSerializer):
    """Payment serializer with allocations"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    allocations = PaymentAllocationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'student_name', 'receipt_number', 'payment_date',
            'amount', 'payment_method', 'status', 'allocations'
        ]


class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for expenses"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approved_by_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'category', 'category_display', 'amount',
            'expense_date', 'description', 'vendor_name', 'invoice_number',
            'payment_method', 'status', 'status_display', 'approved_by',
            'approved_by_name', 'approved_at', 'created_by', 'created_by_name',
            'attachment', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'approved_by', 'approved_at', 'created_by',
            'created_at', 'updated_at'
        ]
    
    def get_approved_by_name(self, obj):
        """Get approver name"""
        return obj.approved_by.get_full_name() if obj.approved_by else None
    
    def get_created_by_name(self, obj):
        """Get creator name"""
        return obj.created_by.get_full_name() if obj.created_by else None


class InvoiceItemSerializer(serializers.ModelSerializer):
    """Serializer for invoice items"""
    class Meta:
        model = InvoiceItem
        fields = [
            'id', 'invoice', 'student_fee', 'description', 'amount'
        ]


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for invoices"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    balance_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    items = InvoiceItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'student', 'student_name', 'invoice_number', 'invoice_date',
            'due_date', 'total_amount', 'paid_amount', 'balance_amount',
            'status', 'status_display', 'notes', 'generated_by', 'items',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['paid_amount', 'generated_by', 'created_at', 'updated_at']


class FeeCollectionSerializer(serializers.Serializer):
    """Serializer for fee collection"""
    student_id = serializers.IntegerField(required=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHOD_CHOICES, required=True)
    transaction_id = serializers.CharField(required=False, allow_blank=True)
    remarks = serializers.CharField(required=False, allow_blank=True)
    fee_allocations = serializers.ListField(
        child=serializers.DictField(),
        required=True
    )


class FinancialSummarySerializer(serializers.Serializer):
    """Serializer for financial summary"""
    total_fees = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_collected = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_pending = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_balance = serializers.DecimalField(max_digits=12, decimal_places=2)

class RazorpayOrderSerializer(serializers.Serializer):
    """Serializer for creating Razorpay order"""
    student_fee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)


class RazorpayVerificationSerializer(serializers.Serializer):
    """Serializer for verifying Razorpay payment"""
    razorpay_order_id = serializers.CharField(required=True)
    razorpay_payment_id = serializers.CharField(required=True)
    razorpay_signature = serializers.CharField(required=True)
    student_fee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
