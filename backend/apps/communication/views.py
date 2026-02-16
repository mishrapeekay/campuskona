from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Notice, Event, Notification
from .serializers import NoticeSerializer, EventSerializer, NotificationSerializer

class NoticeViewSet(viewsets.ModelViewSet):
    serializer_class = NoticeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Notice.objects.filter(is_published=True)

        # Check user_type (the correct field name)
        user_type = getattr(user, 'user_type', None)

        if user_type in ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL']:
            return Notice.objects.all()

        # Base filters for everyone
        filters = Q(target_audience='ALL')

        if user_type == 'STUDENT':
            filters |= Q(target_audience='STUDENTS')
            # If student has a class, include class-specific notices
            student = None
            if hasattr(user, 'student_profile'):
                student = user.student_profile
            else:
                 try:
                     from apps.students.models import Student
                     student = Student.objects.get(user_id=user.id)
                 except:
                     pass
            
            if student and hasattr(student, 'current_class') and student.current_class:
                filters |= (Q(target_audience='CLASS') & Q(specific_classes=student.current_class))

        elif user_type == 'TEACHER':
            filters |= Q(target_audience='TEACHERS')

        elif user_type == 'PARENT':
            filters |= Q(target_audience='PARENTS')

        return queryset.filter(filters).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Return all public events or events for my class
        return Event.objects.all().order_by('start_date')

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})
