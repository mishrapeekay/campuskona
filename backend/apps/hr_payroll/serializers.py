"""
Serializers for the HR & Payroll module.
"""

from rest_framework import serializers
from .models import (
    Department, Designation, SalaryComponent, SalaryStructure,
    SalaryStructureComponent, PayrollRun, Payslip, PayslipComponent,
)


class DepartmentSerializer(serializers.ModelSerializer):
    head_name = serializers.SerializerMethodField()
    staff_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            'id', 'name', 'code', 'head', 'head_name',
            'description', 'is_active', 'staff_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_head_name(self, obj):
        if obj.head:
            return f"{obj.head.user.get_full_name()}" if hasattr(obj.head, 'user') else str(obj.head)
        return None

    def get_staff_count(self, obj):
        return obj.designations.filter(is_deleted=False).count()


class DesignationSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Designation
        fields = [
            'id', 'name', 'department', 'department_name',
            'grade_level', 'description', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SalaryComponentSerializer(serializers.ModelSerializer):
    component_type_display = serializers.CharField(source='get_component_type_display', read_only=True)
    calculation_type_display = serializers.CharField(source='get_calculation_type_display', read_only=True)

    class Meta:
        model = SalaryComponent
        fields = [
            'id', 'name', 'component_type', 'component_type_display',
            'calculation_type', 'calculation_type_display',
            'is_taxable', 'is_mandatory', 'description',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SalaryStructureComponentSerializer(serializers.ModelSerializer):
    component_name = serializers.CharField(source='component.name', read_only=True)
    component_type = serializers.CharField(source='component.component_type', read_only=True)

    class Meta:
        model = SalaryStructureComponent
        fields = [
            'id', 'salary_structure', 'component', 'component_name',
            'component_type', 'amount', 'percentage', 'formula',
        ]
        read_only_fields = ['id']


class SalaryStructureSerializer(serializers.ModelSerializer):
    staff_name = serializers.SerializerMethodField()
    structure_components = SalaryStructureComponentSerializer(many=True, read_only=True)
    total_earnings = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_deductions = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = SalaryStructure
        fields = [
            'id', 'staff', 'staff_name', 'effective_from', 'is_active',
            'structure_components', 'total_earnings', 'total_deductions',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_staff_name(self, obj):
        return f"{obj.staff.user.get_full_name()}" if hasattr(obj.staff, 'user') else str(obj.staff)


class PayslipComponentSerializer(serializers.ModelSerializer):
    component_name = serializers.CharField(source='component.name', read_only=True)
    component_type_display = serializers.CharField(source='get_component_type_display', read_only=True)

    class Meta:
        model = PayslipComponent
        fields = [
            'id', 'payslip', 'component', 'component_name',
            'amount', 'component_type', 'component_type_display',
        ]
        read_only_fields = ['id']


class PayslipSerializer(serializers.ModelSerializer):
    staff_name = serializers.SerializerMethodField()
    staff_employee_id = serializers.CharField(source='staff.employee_id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_mode_display = serializers.CharField(source='get_payment_mode_display', read_only=True)
    components = PayslipComponentSerializer(many=True, read_only=True)

    class Meta:
        model = Payslip
        fields = [
            'id', 'payroll_run', 'staff', 'staff_name', 'staff_employee_id',
            'month', 'year', 'working_days', 'present_days', 'leave_days',
            'gross_salary', 'total_deductions', 'net_salary',
            'status', 'status_display',
            'payment_date', 'payment_mode', 'payment_mode_display',
            'transaction_reference', 'components',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_staff_name(self, obj):
        return f"{obj.staff.user.get_full_name()}" if hasattr(obj.staff, 'user') else str(obj.staff)


class PayslipListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    staff_name = serializers.SerializerMethodField()
    staff_employee_id = serializers.CharField(source='staff.employee_id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Payslip
        fields = [
            'id', 'staff', 'staff_name', 'staff_employee_id',
            'month', 'year', 'gross_salary', 'total_deductions', 'net_salary',
            'status', 'status_display', 'payment_date',
        ]

    def get_staff_name(self, obj):
        return f"{obj.staff.user.get_full_name()}" if hasattr(obj.staff, 'user') else str(obj.staff)


class PayrollRunSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True)
    payslip_count = serializers.SerializerMethodField()

    class Meta:
        model = PayrollRun
        fields = [
            'id', 'month', 'year', 'run_date', 'status', 'status_display',
            'processed_by', 'processed_by_name',
            'total_gross', 'total_deductions', 'total_net',
            'remarks', 'payslip_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_payslip_count(self, obj):
        return obj.payslips.filter(is_deleted=False).count()
