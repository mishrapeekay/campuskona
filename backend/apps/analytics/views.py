from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from apps.analytics.services import AnalyticsService
from drf_spectacular.utils import extend_schema, OpenApiExample

class InvestorDashboardView(APIView):
    """
    API for Investor Dashboard metrics.
    Accessible only by super-admins/staff.
    """
    permission_classes = [IsAdminUser]

    @extend_schema(
        responses={200: dict},
        description="Returns key financial and growth metrics for investors.",
        examples=[
            OpenApiExample(
                'Sample Response',
                value={
                    "summary": {
                        "mrr": 50000.0,
                        "arr": 600000.0,
                        "churn_rate": 2.5,
                        "total_schools": 120,
                        "active_schools": 115,
                        "cac": 1200.0,
                        "ltv": 15000.0
                    },
                    "growth": {
                        "regions": {"Maharashtra": 40, "Delhi": 30, "Karnataka": 25},
                        "new_schools_this_month": 8
                    },
                    "trends": [
                        {"date": "Jan 2026", "mrr": 45000.0, "schools": 105},
                        {"date": "Feb 2026", "mrr": 50000.0, "schools": 115}
                    ]
                }
            )
        ]
    )
    def get(self, request):
        # Allow refreshing data via query param
        refresh = request.query_params.get('refresh', 'false').lower() == 'true'
        if refresh:
            AnalyticsService.calculate_metrics()
            
        data = AnalyticsService.get_dashboard_data()
        return Response(data)

class RefreshAnalyticsView(APIView):
    """
    Manually trigger analytics recalculation.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        metric = AnalyticsService.calculate_metrics()
        return Response({
            "status": "success",
            "message": "Analytics recalculated",
            "date": metric.date
        })

class PrincipalDashboardView(APIView):
    """
    API for the Principal's high-level school health dashboard.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = AnalyticsService.get_principal_health_score()
        return Response(data)
