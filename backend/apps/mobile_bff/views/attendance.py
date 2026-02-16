from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from asgiref.sync import async_to_sync
from apps.mobile_bff.services.attendance import AttendanceAggregator
from drf_spectacular.utils import extend_schema, OpenApiParameter

class ClassRosterView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get Class Roster",
        description="Get lightweight roster for attendance marking.",
        parameters=[
            OpenApiParameter("section_id", int, description="ID of the section to fetch roster for"),
            OpenApiParameter("date", str, description="Date in YYYY-MM-DD format (optional, defaults to today)")
        ],
        responses={200: dict}
    )
    def get(self, request):
        try:
            section_id = request.query_params.get('section_id')
            if not section_id:
                return Response({"error": "section_id is required"}, status=status.HTTP_400_BAD_REQUEST)
                
            date_str = request.query_params.get('date')
            
            data = async_to_sync(AttendanceAggregator.get_class_roster)(section_id, date_str)
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
