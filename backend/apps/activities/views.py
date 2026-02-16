from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from .models import Club, ClubMembership, ClubActivity, ActivityAttendance
from .serializers import (
    ClubSerializer, 
    ClubMembershipSerializer, 
    ClubActivitySerializer, 
    ActivityAttendanceSerializer
)
from rest_framework.permissions import IsAuthenticated

class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Club.objects.annotate(member_count=Count('members'))

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        club = self.get_object()
        memberships = club.members.all()
        serializer = ClubMembershipSerializer(memberships, many=True)
        return Response(serializer.data)

class ClubMembershipViewSet(viewsets.ModelViewSet):
    queryset = ClubMembership.objects.all()
    serializer_class = ClubMembershipSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['student__first_name', 'student__last_name', 'club__name']

class ClubActivityViewSet(viewsets.ModelViewSet):
    queryset = ClubActivity.objects.all()
    serializer_class = ClubActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ClubActivity.objects.annotate(attendee_count=Count('attendance'))

    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        activity = self.get_object()
        attendance_data = request.data.get('attendance', [])
        
        for data in attendance_data:
            student_id = data.get('student_id')
            is_present = data.get('is_present', True)
            remarks = data.get('remarks', '')
            
            ActivityAttendance.objects.update_or_create(
                activity=activity,
                student_id=student_id,
                defaults={'is_present': is_present, 'remarks': remarks}
            )
            
        return Response({"status": "attendance marked"}, status=status.HTTP_200_OK)

class ActivityAttendanceViewSet(viewsets.ModelViewSet):
    queryset = ActivityAttendance.objects.all()
    serializer_class = ActivityAttendanceSerializer
    permission_classes = [IsAuthenticated]
