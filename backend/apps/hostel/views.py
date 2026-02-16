"""
ViewSets for the Hostel module.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Hostel, Room, RoomAllocation, HostelAttendance,
    MessMenu, HostelComplaint, HostelVisitor,
)
from .serializers import (
    HostelSerializer, RoomSerializer, RoomAllocationSerializer,
    HostelAttendanceSerializer, BulkHostelAttendanceSerializer,
    MessMenuSerializer, HostelComplaintSerializer, HostelVisitorSerializer,
)


class HostelViewSet(viewsets.ModelViewSet):
    serializer_class = HostelSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name']
    filterset_fields = ['hostel_type', 'is_active']

    def get_queryset(self):
        return Hostel.objects.filter(is_deleted=False).prefetch_related('rooms')

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get overall hostel statistics."""
        hostels = Hostel.objects.filter(is_deleted=False, is_active=True)
        rooms = Room.objects.filter(is_deleted=False, hostel__is_active=True)
        total_capacity = rooms.aggregate(t=Sum('capacity'))['t'] or 0
        total_occupied = rooms.aggregate(t=Sum('occupied_beds'))['t'] or 0
        available_beds = total_capacity - total_occupied
        occupancy_rate = round((total_occupied / total_capacity * 100), 1) if total_capacity else 0
        open_complaints = HostelComplaint.objects.filter(
            is_deleted=False
        ).exclude(status='RESOLVED').count()
        return Response({
            'total_hostels': hostels.count(),
            'total_rooms': rooms.count(),
            'total_capacity': total_capacity,
            'total_occupied': total_occupied,
            'available_beds': available_beds,
            'occupancy_rate': occupancy_rate,
            'open_complaints': open_complaints,
            'rooms_by_status': {
                s[0]: rooms.filter(status=s[0]).count()
                for s in Room.STATUS_CHOICES
            },
        })


class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['room_number']
    filterset_fields = ['hostel', 'floor', 'room_type', 'status']
    ordering_fields = ['room_number', 'floor', 'capacity']

    def get_queryset(self):
        return Room.objects.filter(
            is_deleted=False
        ).select_related('hostel').prefetch_related('allocations')


class RoomAllocationViewSet(viewsets.ModelViewSet):
    serializer_class = RoomAllocationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['room', 'student', 'is_active']

    def get_queryset(self):
        return RoomAllocation.objects.filter(
            is_deleted=False
        ).select_related('room', 'room__hostel', 'student')

    def perform_create(self, serializer):
        allocation = serializer.save()
        room = allocation.room
        room.occupied_beds += 1
        room.update_status()

    @action(detail=True, methods=['post'])
    def vacate(self, request, pk=None):
        """Vacate a student from their room."""
        allocation = self.get_object()
        if not allocation.is_active:
            return Response({'detail': 'Already vacated.'}, status=status.HTTP_400_BAD_REQUEST)
        allocation.is_active = False
        allocation.vacated_date = timezone.now().date()
        allocation.save()
        room = allocation.room
        room.occupied_beds = max(0, room.occupied_beds - 1)
        room.update_status()
        return Response(RoomAllocationSerializer(allocation).data)


class HostelAttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = HostelAttendanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hostel', 'date', 'status', 'student']

    def get_queryset(self):
        return HostelAttendance.objects.filter(
            is_deleted=False
        ).select_related('student', 'hostel')

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        """Bulk mark attendance for a hostel on a date."""
        serializer = BulkHostelAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        records_created = 0

        for record in data['records']:
            obj, created = HostelAttendance.objects.update_or_create(
                student_id=record['student_id'],
                date=data['date'],
                defaults={
                    'hostel_id': data['hostel'],
                    'status': record['status'],
                    'marked_by': request.user,
                }
            )
            if created:
                records_created += 1

        return Response({
            'detail': f'Attendance marked for {len(data["records"])} students. {records_created} new records.',
        })

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get attendance summary for a hostel/date."""
        hostel_id = request.query_params.get('hostel')
        date = request.query_params.get('date', timezone.now().date())
        qs = self.get_queryset().filter(date=date)
        if hostel_id:
            qs = qs.filter(hostel_id=hostel_id)
        return Response({
            'date': date,
            'total': qs.count(),
            'present': qs.filter(status='PRESENT').count(),
            'absent': qs.filter(status='ABSENT').count(),
            'leave': qs.filter(status='LEAVE').count(),
        })


class MessMenuViewSet(viewsets.ModelViewSet):
    serializer_class = MessMenuSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hostel', 'day', 'meal']

    def get_queryset(self):
        return MessMenu.objects.filter(is_deleted=False)


class HostelComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = HostelComplaintSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['subject', 'description']
    filterset_fields = ['hostel', 'status', 'category', 'student']

    def get_queryset(self):
        return HostelComplaint.objects.filter(
            is_deleted=False
        ).select_related('student', 'hostel', 'room')

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark a complaint as resolved."""
        complaint = self.get_object()
        complaint.status = 'RESOLVED'
        complaint.resolved_by = request.user
        complaint.resolved_date = timezone.now()
        complaint.resolution_notes = request.data.get('resolution_notes', '')
        complaint.save()
        return Response(HostelComplaintSerializer(complaint).data)


class HostelVisitorViewSet(viewsets.ModelViewSet):
    serializer_class = HostelVisitorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['visitor_name', 'phone']
    filterset_fields = ['hostel', 'student']

    def get_queryset(self):
        return HostelVisitor.objects.filter(
            is_deleted=False
        ).select_related('student', 'hostel')

    @action(detail=True, methods=['post'])
    def checkout(self, request, pk=None):
        """Check out a visitor."""
        visitor = self.get_object()
        if visitor.check_out:
            return Response({'detail': 'Visitor already checked out.'}, status=status.HTTP_400_BAD_REQUEST)
        visitor.check_out = timezone.now()
        visitor.save()
        return Response(HostelVisitorSerializer(visitor).data)
