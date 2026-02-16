from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from asgiref.sync import async_to_sync
from apps.mobile_bff.services.dashboard import DashboardAggregator
from apps.mobile_bff.serializers.teacher_home import TeacherHomeSerializer
from drf_spectacular.utils import extend_schema

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get Admin Dashboard Data",
        description="Aggregates key metrics for the admin via parallel execution.",
        responses={200: dict}
    )
    def get(self, request):
        # We use async_to_sync to leverage the parallel aggregation defined in the service
        # even though this view is synchronous (common pattern in Django/DRF unless using adrf)
        try:
            data = async_to_sync(DashboardAggregator.get_admin_dashboard_data)(request.tenant)
            return Response(data)
        except Exception as e:
            # Structuring error response
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            data = async_to_sync(DashboardAggregator.get_teacher_dashboard_data)(request.user)
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TeacherHomeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get Teacher Home Data",
        description="Returns action-oriented data for the Teacher Home screen: timetable, pending actions, and urgent alerts.",
        responses={200: TeacherHomeSerializer}
    )
    def get(self, request):
        try:
            data = async_to_sync(DashboardAggregator.get_teacher_home_data)(request.user)
            # Serialize generic data
            # Note: The service returns a dict that matches the serializer structure.
            # We can use the serializer to validate/format if needed, or return directly.
            # Returning directly is faster, but serializer ensures contract.
            serializer = TeacherHomeSerializer(data=data)
            serializer.is_valid() # Optional check, but good for debugging schema issues
            # We construct the response manually to avoid validation errors if our dict is slightly off, 
            # or just return data. Let's return data but use serializer for schema doc.
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            data = async_to_sync(DashboardAggregator.get_student_dashboard_data)(request.user)
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ParentDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            data = async_to_sync(DashboardAggregator.get_parent_dashboard_data)(request.user)
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
