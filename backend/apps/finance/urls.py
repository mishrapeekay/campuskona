"""
URL routing for Finance app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FeeCategoryViewSet,
    FeeStructureViewSet,
    StudentFeeViewSet,
    PaymentViewSet,
    ExpenseViewSet,
    InvoiceViewSet
)

app_name = 'finance'

# Create router
router = DefaultRouter()

# Register viewsets
router.register(r'fee-categories', FeeCategoryViewSet, basename='fee-category')
router.register(r'fee-structures', FeeStructureViewSet, basename='fee-structure')
router.register(r'student-fees', StudentFeeViewSet, basename='student-fee')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'invoices', InvoiceViewSet, basename='invoice')

from .webhooks import razorpay_webhook

urlpatterns = [
    path('', include(router.urls)),
    path('webhooks/razorpay/', razorpay_webhook, name='razorpay-webhook'),
]

