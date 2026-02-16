from django.contrib import admin
from apps.finance.models import (
    FeeCategory, FeeStructure, StudentFee, 
    Payment, PaymentAllocation, Expense, Invoice
)

@admin.register(FeeCategory)
class FeeCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'is_mandatory', 'is_active')
    search_fields = ('name', 'code')

@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ('fee_category', 'class_obj', 'academic_year', 'amount', 'frequency', 'is_active')
    list_filter = ('academic_year', 'class_obj', 'fee_category', 'frequency')
    search_fields = ('fee_category__name', 'class_obj__display_name')

@admin.register(StudentFee)
class StudentFeeAdmin(admin.ModelAdmin):
    list_display = ('student', 'fee_structure', 'final_amount', 'paid_amount', 'due_date', 'status')
    list_filter = ('status', 'academic_year', 'due_date')
    search_fields = ('student__first_name', 'student__last_name', 'fee_structure__fee_category__name')
    autocomplete_fields = ['student']
    readonly_fields = ('final_amount', 'paid_amount')

class PaymentAllocationInline(admin.TabularInline):
    model = PaymentAllocation
    extra = 1

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'student', 'amount', 'payment_date', 'payment_method', 'status')
    list_filter = ('payment_date', 'payment_method', 'status')
    search_fields = ('receipt_number', 'student__first_name', 'student__last_name', 'transaction_id')
    inlines = [PaymentAllocationInline]
    readonly_fields = ('receipt_number',)

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'amount', 'expense_date', 'status')
    list_filter = ('category', 'status', 'expense_date')
    search_fields = ('title', 'vendor_name', 'invoice_number')

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'student', 'total_amount', 'paid_amount', 'due_date', 'status')
    list_filter = ('status', 'due_date')
    search_fields = ('invoice_number', 'student__first_name', 'student__last_name')
    readonly_fields = ('invoice_number', 'total_amount', 'paid_amount')
