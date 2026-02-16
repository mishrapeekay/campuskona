from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from asgiref.sync import async_to_sync
from apps.mobile_bff.services.parent import ParentAggregator
from drf_spectacular.utils import extend_schema

class ParentOverviewView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get Parent Data Overview",
        description="Aggregates data for all children of the parent user.",
        responses={200: dict}
    )
    def get(self, request):
        try:
            # Enforce role check if necessary, or just rely on empty list return
            # Assuming RBAC is handled by permissions or user type check
            if request.user.user_type != 'PARENT':
                return Response({"detail": "Only parents can access this endpoint."}, status=status.HTTP_403_FORBIDDEN)
                
            data = async_to_sync(ParentAggregator.get_parent_overview)(request.user)
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
