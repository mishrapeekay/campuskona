from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    hr_dashboard_stats,
    DepartmentViewSet, DesignationViewSet, SalaryComponentViewSet,
    SalaryStructureViewSet, SalaryStructureComponentViewSet,
    PayrollRunViewSet, PayslipViewSet,
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'designations', DesignationViewSet, basename='designation')
router.register(r'salary-components', SalaryComponentViewSet, basename='salary-component')
router.register(r'salary-structures', SalaryStructureViewSet, basename='salary-structure')
router.register(r'structure-components', SalaryStructureComponentViewSet, basename='structure-component')
router.register(r'payroll-runs', PayrollRunViewSet, basename='payroll-run')
router.register(r'payslips', PayslipViewSet, basename='payslip')

urlpatterns = [
    path('dashboard_stats/', hr_dashboard_stats),
    path('', include(router.urls)),
]
