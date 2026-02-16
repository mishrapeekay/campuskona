from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from asgiref.sync import async_to_sync
from apps.mobile_bff.services.notifications import NotificationAggregator
from drf_spectacular.utils import extend_schema

class NotificationFeedView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get Notification Feed",
        description="Unified feed of personal notifications and system broadcasts.",
        responses={200: dict}
    )
    def get(self, request):
        try:
            feed = async_to_sync(NotificationAggregator.get_feed)(request.user)
            return Response(feed)
        except Exception as e:
            # Proper error handling
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
