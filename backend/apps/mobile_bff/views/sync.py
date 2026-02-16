from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from asgiref.sync import async_to_sync
from apps.mobile_bff.services.sync_orchestrator import SyncOrchestrator
from drf_spectacular.utils import extend_schema

class SyncPushView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Push Sync Changes",
        description="Push offline changes to server.",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "changes": {
                        "type": "array",
                        "items": { "type": "object" }
                    }
                }
            }
        },
        responses={200: dict}
    )
    def post(self, request):
        try:
            payload = request.data
            result = async_to_sync(SyncOrchestrator.process_push)(request.user, payload)
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SyncPullView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Pull Sync Changes",
        description="Fetch changes since last sync.",
        parameters=[
            # Query param implementation usually for GET
        ],
        responses={200: dict}
    )
    def get(self, request):
        try:
            last_synced_at = request.query_params.get('last_synced_at')
            result = async_to_sync(SyncOrchestrator.process_pull)(request.user, last_synced_at)
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
