from django.urls import path
from apps.analytics.views import InvestorDashboardView, RefreshAnalyticsView, PrincipalDashboardView

urlpatterns = [
    path('investor/dashboard/', InvestorDashboardView.as_view(), name='investor-dashboard'),
    path('investor/refresh/', RefreshAnalyticsView.as_view(), name='investor-refresh'),
    path('principal/health-score/', PrincipalDashboardView.as_view(), name='principal-health-score'),
]
