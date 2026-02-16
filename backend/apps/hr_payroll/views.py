"""
ViewSets for the HR & Payroll module.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Department, Designation, SalaryComponent, SalaryStructure,
    SalaryStructureComponent, PayrollRun, Payslip, PayslipComponent,
)
from .serializers import (
    DepartmentSerializer, DesignationSerializer, SalaryComponentSerializer,
    SalaryStructureSerializer, SalaryStructureComponentSerializer,
    PayrollRunSerializer, PayslipSerializer, PayslipListSerializer,
    PayslipComponentSerializer,
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hr_dashboard_stats(request):
    """HR overview stats: departments, designations, staff with structures, total salary expense."""
    total_departments = Department.objects.filter(is_deleted=False).count()
    total_designations = Designation.objects.filter(is_deleted=False).count()
    total_staff_with_structures = SalaryStructure.objects.filter(
        is_deleted=False, is_active=True
    ).values('staff').distinct().count()
    earnings = SalaryStructureComponent.objects.filter(
        salary_structure__is_deleted=False,
        salary_structure__is_active=True,
        component__component_type='EARNING',
    ).aggregate(s=Sum('amount'))['s'] or 0
    deductions = SalaryStructureComponent.objects.filter(
        salary_structure__is_deleted=False,
        salary_structure__is_active=True,
        component__component_type='DEDUCTION',
    ).aggregate(s=Sum('amount'))['s'] or 0
    total_salary_expense = float(earnings - deductions)
    return Response({
        'total_departments': total_departments,
        'total_designations': total_designations,
        'total_staff_with_structures': total_staff_with_structures,
        'total_salary_expense': total_salary_expense,
    })


class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']

    def get_queryset(self):
        return Department.objects.filter(is_deleted=False)


class DesignationViewSet(viewsets.ModelViewSet):
    serializer_class = DesignationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name']
    filterset_fields = ['department', 'is_active']

    def get_queryset(self):
        return Designation.objects.filter(
            is_deleted=False
        ).select_related('department')


class SalaryComponentViewSet(viewsets.ModelViewSet):
    serializer_class = SalaryComponentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name']
    filterset_fields = ['component_type', 'calculation_type', 'is_mandatory']

    def get_queryset(self):
        return SalaryComponent.objects.filter(is_deleted=False)


class SalaryStructureViewSet(viewsets.ModelViewSet):
    serializer_class = SalaryStructureSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['staff', 'is_active']

    def get_queryset(self):
        return SalaryStructure.objects.filter(
            is_deleted=False
        ).select_related('staff').prefetch_related('structure_components__component')


class SalaryStructureComponentViewSet(viewsets.ModelViewSet):
    serializer_class = SalaryStructureComponentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['salary_structure']

    def get_queryset(self):
        return SalaryStructureComponent.objects.filter(
            is_deleted=False
        ).select_related('component')


class PayrollRunViewSet(viewsets.ModelViewSet):
    serializer_class = PayrollRunSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'year', 'month']
    ordering_fields = ['year', 'month', 'run_date']
    ordering = ['-year', '-month']

    def get_queryset(self):
        return PayrollRun.objects.filter(is_deleted=False)

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Process a payroll run - generate payslips for all active staff."""
        payroll_run = self.get_object()
        if payroll_run.status != 'DRAFT':
            return Response(
                {'detail': f'Cannot process payroll with status: {payroll_run.get_status_display()}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payroll_run.status = 'PROCESSING'
        payroll_run.processed_by = request.user
        payroll_run.save()

        # Get all active staff with salary structures
        from apps.staff.models import StaffMember
        active_staff = StaffMember.objects.filter(
            is_deleted=False,
            employment_status='ACTIVE'
        )

        total_gross = 0
        total_deductions = 0
        payslips_created = 0

        for staff in active_staff:
            salary_structure = SalaryStructure.objects.filter(
                staff=staff, is_active=True, is_deleted=False
            ).first()

            if not salary_structure:
                continue

            gross = salary_structure.total_earnings
            deductions = salary_structure.total_deductions
            net = gross - deductions

            payslip, created = Payslip.objects.get_or_create(
                payroll_run=payroll_run,
                staff=staff,
                defaults={
                    'month': payroll_run.month,
                    'year': payroll_run.year,
                    'working_days': 26,
                    'present_days': 26,
                    'leave_days': 0,
                    'gross_salary': gross,
                    'total_deductions': deductions,
                    'net_salary': net,
                    'status': 'GENERATED',
                }
            )

            if created:
                payslips_created += 1
                # Create payslip components
                for sc in salary_structure.structure_components.all():
                    PayslipComponent.objects.create(
                        payslip=payslip,
                        component=sc.component,
                        amount=sc.amount,
                        component_type=sc.component.component_type,
                    )

            total_gross += gross
            total_deductions += deductions

        payroll_run.total_gross = total_gross
        payroll_run.total_deductions = total_deductions
        payroll_run.total_net = total_gross - total_deductions
        payroll_run.status = 'COMPLETED'
        payroll_run.save()

        return Response({
            'detail': f'Payroll processed. {payslips_created} payslips generated.',
            'payroll_run': PayrollRunSerializer(payroll_run).data,
        })

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a payroll run."""
        payroll_run = self.get_object()
        if payroll_run.status == 'CANCELLED':
            return Response({'detail': 'Already cancelled.'}, status=status.HTTP_400_BAD_REQUEST)
        payroll_run.status = 'CANCELLED'
        payroll_run.save()
        return Response(PayrollRunSerializer(payroll_run).data)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get payroll dashboard statistics."""
        year = request.query_params.get('year', timezone.now().year)
        runs = PayrollRun.objects.filter(is_deleted=False, year=year)
        return Response({
            'year': year,
            'total_runs': runs.count(),
            'completed': runs.filter(status='COMPLETED').count(),
            'total_disbursed': runs.filter(status='COMPLETED').aggregate(
                t=Sum('total_net')
            )['t'] or 0,
        })


class PayslipViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['staff__user__first_name', 'staff__user__last_name', 'staff__employee_id']
    filterset_fields = ['payroll_run', 'staff', 'status', 'year', 'month']
    ordering_fields = ['year', 'month', 'net_salary']
    ordering = ['-year', '-month']

    def get_queryset(self):
        return Payslip.objects.filter(
            is_deleted=False
        ).select_related('staff', 'payroll_run').prefetch_related('components__component')

    def get_serializer_class(self):
        if self.action == 'list':
            return PayslipListSerializer
        return PayslipSerializer

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a payslip."""
        payslip = self.get_object()
        if payslip.status not in ['GENERATED', 'DRAFT']:
            return Response(
                {'detail': 'Only generated/draft payslips can be approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        payslip.status = 'APPROVED'
        payslip.save()
        return Response(PayslipSerializer(payslip).data)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark a payslip as paid."""
        payslip = self.get_object()
        if payslip.status != 'APPROVED':
            return Response(
                {'detail': 'Only approved payslips can be marked as paid.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        payslip.status = 'PAID'
        payslip.payment_date = timezone.now().date()
        payslip.payment_mode = request.data.get('payment_mode', 'BANK_TRANSFER')
        payslip.transaction_reference = request.data.get('transaction_reference', '')
        payslip.save()
        return Response(PayslipSerializer(payslip).data)
