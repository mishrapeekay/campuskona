from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum
from .models import House, HouseMembership, HousePointLog
from .serializers import HouseSerializer, HouseMembershipSerializer, HousePointLogSerializer
from rest_framework.permissions import IsAuthenticated

class HouseViewSet(viewsets.ModelViewSet):
    queryset = House.objects.all()
    serializer_class = HouseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return House.objects.annotate(
            member_count=Count('members'),
            total_points=Sum('points_log__points')
        )

    @action(detail=True, methods=['get'])
    def leaderboard(self, request, pk=None):
        house = self.get_object()
        top_contributors = HouseMembership.objects.filter(house=house).order_by('-points_contributed')[:10]
        serializer = HouseMembershipSerializer(top_contributors, many=True)
        return Response(serializer.data)

class HouseMembershipViewSet(viewsets.ModelViewSet):
    queryset = HouseMembership.objects.all()
    serializer_class = HouseMembershipSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['student__first_name', 'student__last_name']

class HousePointLogViewSet(viewsets.ModelViewSet):
    queryset = HousePointLog.objects.all()
    serializer_class = HousePointLogSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(awarded_by=self.request.user)

    @action(detail=False, methods=['get'])
    def student_history(self, request):
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response({"error": "student_id is required"}, status=400)
        logs = HousePointLog.objects.filter(student_id=student_id)
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)
