"""
URL configuration for tenants app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SubscriptionViewSet, SchoolViewSet, DomainViewSet,
    FeatureDefinitionViewSet, TenantFeaturesView, PublicSchoolListView,
    SuperAdminDashboardStatsView, PublicBrandingView,
)

app_name = 'tenants'

router = DefaultRouter()
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'schools', SchoolViewSet, basename='school')
router.register(r'domains', DomainViewSet, basename='domain')
router.register(r'feature-definitions', FeatureDefinitionViewSet, basename='feature-definition')

from .webhooks import subscription_webhook

urlpatterns = [
    path('dashboard/stats/', SuperAdminDashboardStatsView.as_view(), name='dashboard-stats'),
    path('my-features/', TenantFeaturesView.as_view(), name='my-features'),
    path('public/list/', PublicSchoolListView.as_view(), name='public-school-list'),
    path('public/branding/', PublicBrandingView.as_view(), name='public-branding'),
    path('webhooks/razorpay/', subscription_webhook, name='razorpay-subscription-webhook'),
    path('', include(router.urls)),
]

