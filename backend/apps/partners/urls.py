"""
Partner Commission URLs

URL routing for partner commission tracking API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PartnerViewSet,
    LeadViewSet,
    CommissionViewSet,
    CommissionRuleViewSet,
    PayoutViewSet
)

app_name = 'partners'

router = DefaultRouter()
router.register(r'partners', PartnerViewSet, basename='partner')
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'commissions', CommissionViewSet, basename='commission')
router.register(r'commission-rules', CommissionRuleViewSet, basename='commission-rule')
router.register(r'payouts', PayoutViewSet, basename='payout')

urlpatterns = [
    path('', include(router.urls)),
]
