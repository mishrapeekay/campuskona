from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Notice, Event, Notification, FCMToken, WhatsAppLog
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


# ─────────────────────────────────────────────────────────────
# Workstream F: FCM Token Registration
# ─────────────────────────────────────────────────────────────

class FCMTokenView(APIView):
    """Register/deregister FCM push notification tokens (Workstream F)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.data.get('token')
        device_type = request.data.get('device_type', 'android')
        device_id = request.data.get('device_id', '')

        if not token:
            return Response({'error': 'token is required'}, status=status.HTTP_400_BAD_REQUEST)

        fcm_token, created = FCMToken.objects.update_or_create(
            user=request.user,
            device_id=device_id,
            defaults={
                'token': token,
                'device_type': device_type,
                'is_active': True,
            },
        )
        return Response({'registered': True, 'created': created}, status=status.HTTP_200_OK)

    def delete(self, request):
        device_id = request.data.get('device_id', '')
        FCMToken.objects.filter(user=request.user, device_id=device_id).update(is_active=False)
        return Response({'unregistered': True}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────
# Workstream B: WhatsApp Send Endpoint
# ─────────────────────────────────────────────────────────────

class SendWhatsAppView(APIView):
    """Admin endpoint to send WhatsApp messages via MSG91 (Workstream B)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .services.whatsapp_service import whatsapp_service

        phone = request.data.get('phone')
        template = request.data.get('template', 'school_welcome')
        variables = request.data.get('variables', {})
        message_type = request.data.get('message_type', 'general')

        if not phone:
            return Response({'error': 'phone is required'}, status=status.HTTP_400_BAD_REQUEST)

        result = whatsapp_service.send_template_message(phone, template, variables)

        WhatsAppLog.objects.create(
            recipient_phone=phone,
            message_type=message_type,
            template_name=template,
            status='sent' if result.get('success') else 'failed',
            response_data=result,
        )

        return Response(result)
