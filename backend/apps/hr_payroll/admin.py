from django.contrib import admin
from .models import (
    Department, Designation, SalaryComponent, SalaryStructure,
    SalaryStructureComponent, PayrollRun, Payslip, PayslipComponent,
)


class DesignationInline(admin.TabularInline):
    model = Designation
    extra = 0
    fields = ('name', 'grade_level', 'is_active')


class SalaryStructureComponentInline(admin.TabularInline):
    model = SalaryStructureComponent
    extra = 0
    fields = ('component', 'amount', 'percentage', 'formula')
    autocomplete_fields = ['component']


class PayslipComponentInline(admin.TabularInline):
    model = PayslipComponent
    extra = 0
    fields = ('component', 'component_type', 'amount')
    readonly_fields = ('component', 'component_type', 'amount')


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'head', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'code')
    inlines = [DesignationInline]


@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'grade_level', 'is_active')
    list_filter = ('department', 'is_active')
    search_fields = ('name', 'department__name')


@admin.register(SalaryComponent)
class SalaryComponentAdmin(admin.ModelAdmin):
    list_display = ('name', 'component_type', 'calculation_type', 'is_taxable', 'is_mandatory')
    list_filter = ('component_type', 'calculation_type', 'is_taxable', 'is_mandatory')
    search_fields = ('name',)


@admin.register(SalaryStructure)
class SalaryStructureAdmin(admin.ModelAdmin):
    list_display = ('staff', 'effective_from', 'is_active', 'get_total_earnings', 'get_total_deductions')
    list_filter = ('is_active', 'effective_from')
    search_fields = ('staff__employee_id', 'staff__user__first_name', 'staff__user__last_name')
    autocomplete_fields = ['staff']
    inlines = [SalaryStructureComponentInline]
    date_hierarchy = 'effective_from'

    def get_total_earnings(self, obj):
        return f"₹{obj.total_earnings:,.2f}"
    get_total_earnings.short_description = 'Total Earnings'

    def get_total_deductions(self, obj):
        return f"₹{obj.total_deductions:,.2f}"
    get_total_deductions.short_description = 'Total Deductions'


@admin.register(SalaryStructureComponent)
class SalaryStructureComponentAdmin(admin.ModelAdmin):
    list_display = ('salary_structure', 'component', 'amount', 'percentage')
    list_filter = ('component__component_type',)
    search_fields = ('salary_structure__staff__employee_id', 'component__name')
    autocomplete_fields = ['salary_structure', 'component']


@admin.register(PayrollRun)
class PayrollRunAdmin(admin.ModelAdmin):
    list_display = ('period_display', 'run_date', 'status', 'total_gross', 'total_deductions', 'total_net')
    list_filter = ('status', 'year', 'month')
    search_fields = ('year',)
    readonly_fields = ('total_gross', 'total_deductions', 'total_net')
    date_hierarchy = 'run_date'

    def period_display(self, obj):
        import calendar
        return f"{calendar.month_name[obj.month]} {obj.year}"
    period_display.short_description = 'Period'


@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = ('staff', 'month', 'year', 'gross_salary', 'total_deductions', 'net_salary', 'status', 'payment_mode')
    list_filter = ('status', 'payment_mode', 'year', 'month')
    search_fields = ('staff__employee_id', 'staff__user__first_name', 'staff__user__last_name', 'transaction_reference')
    autocomplete_fields = ['staff', 'payroll_run']
    inlines = [PayslipComponentInline]
    readonly_fields = ('gross_salary', 'total_deductions', 'net_salary')
    date_hierarchy = 'payment_date'


@admin.register(PayslipComponent)
class PayslipComponentAdmin(admin.ModelAdmin):
    list_display = ('payslip', 'component', 'component_type', 'amount')
    list_filter = ('component_type',)
    search_fields = ('payslip__staff__employee_id', 'component__name')
