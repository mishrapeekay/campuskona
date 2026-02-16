"""
ViewSets for the Admissions module.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import AdmissionEnquiry, AdmissionApplication, AdmissionDocument, AdmissionSetting
from .serializers import (
    AdmissionEnquirySerializer,
    AdmissionApplicationSerializer,
    AdmissionApplicationListSerializer,
    AdmissionDocumentSerializer,
    AdmissionSettingSerializer,
)


class AdmissionEnquiryViewSet(viewsets.ModelViewSet):
    """
    CRUD for admission enquiries.
    """
    serializer_class = AdmissionEnquirySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'phone', 'email']
    filterset_fields = ['status', 'source', 'class_applied']
    ordering_fields = ['enquiry_date', 'created_at', 'name']
    ordering = ['-enquiry_date']

    def get_queryset(self):
        return AdmissionEnquiry.objects.filter(is_deleted=False)

    @action(detail=True, methods=['post'])
    def convert_to_application(self, request, pk=None):
        """Convert an enquiry into an admission application."""
        enquiry = self.get_object()
        if enquiry.status == 'CONVERTED':
            return Response(
                {'detail': 'This enquiry has already been converted.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        enquiry.status = 'CONVERTED'
        enquiry.save()

        application = AdmissionApplication.objects.create(
            enquiry=enquiry,
            student_name=enquiry.name,
            class_applied=enquiry.class_applied,
            phone=enquiry.phone,
            email=enquiry.email or '',
            date_of_birth=timezone.now().date(),  # placeholder
            gender='M',  # placeholder
            father_name='',
            address='',
            city='',
            state='',
            pincode='',
            academic_year_id=request.data.get('academic_year'),
        )

        return Response(
            AdmissionApplicationSerializer(application).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get enquiry statistics."""
        qs = self.get_queryset()
        return Response({
            'total': qs.count(),
            'new': qs.filter(status='NEW').count(),
            'contacted': qs.filter(status='CONTACTED').count(),
            'converted': qs.filter(status='CONVERTED').count(),
            'closed': qs.filter(status='CLOSED').count(),
        })


class AdmissionApplicationViewSet(viewsets.ModelViewSet):
    """
    CRUD for admission applications with workflow actions.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student_name', 'father_name', 'application_number', 'phone', 'email']
    filterset_fields = ['status', 'class_applied', 'academic_year', 'gender']
    ordering_fields = ['created_at', 'submitted_date', 'student_name', 'application_number']
    ordering = ['-created_at']

    def get_queryset(self):
        return AdmissionApplication.objects.filter(
            is_deleted=False
        ).select_related(
            'class_applied', 'academic_year', 'reviewed_by', 'enquiry'
        ).prefetch_related('documents')

    def get_serializer_class(self):
        if self.action == 'list':
            return AdmissionApplicationListSerializer
        return AdmissionApplicationSerializer

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit a draft application."""
        application = self.get_object()
        if application.status != 'DRAFT':
            return Response(
                {'detail': f'Cannot submit application with status: {application.get_status_display()}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        application.status = 'SUBMITTED'
        application.submitted_date = timezone.now()
        application.save()
        return Response(AdmissionApplicationSerializer(application).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve an application."""
        application = self.get_object()
        if application.status not in ['SUBMITTED', 'UNDER_REVIEW']:
            return Response(
                {'detail': f'Cannot approve application with status: {application.get_status_display()}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        application.status = 'APPROVED'
        application.reviewed_by = request.user
        application.reviewed_date = timezone.now()
        application.remarks = request.data.get('remarks', '')
        application.save()
        return Response(AdmissionApplicationSerializer(application).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject an application."""
        application = self.get_object()
        if application.status in ['ENROLLED', 'WITHDRAWN', 'REJECTED']:
            return Response(
                {'detail': f'Cannot reject application with status: {application.get_status_display()}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        application.status = 'REJECTED'
        application.reviewed_by = request.user
        application.reviewed_date = timezone.now()
        application.remarks = request.data.get('remarks', '')
        application.save()
        return Response(AdmissionApplicationSerializer(application).data)

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """Enroll an approved application - creates a Student record."""
        application = self.get_object()
        if application.status != 'APPROVED':
            return Response(
                {'detail': 'Only approved applications can be enrolled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        application.status = 'ENROLLED'
        application.save()

        # Update seat count
        try:
            setting = AdmissionSetting.objects.get(
                academic_year=application.academic_year,
                class_applied=application.class_applied,
                is_deleted=False
            )
            setting.filled_seats += 1
            setting.save()
        except AdmissionSetting.DoesNotExist:
            pass

        return Response(AdmissionApplicationSerializer(application).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get application statistics."""
        qs = self.get_queryset()
        academic_year = request.query_params.get('academic_year')
        if academic_year:
            qs = qs.filter(academic_year_id=academic_year)

        return Response({
            'total': qs.count(),
            'draft': qs.filter(status='DRAFT').count(),
            'submitted': qs.filter(status='SUBMITTED').count(),
            'under_review': qs.filter(status='UNDER_REVIEW').count(),
            'documents_pending': qs.filter(status='DOCUMENTS_PENDING').count(),
            'approved': qs.filter(status='APPROVED').count(),
            'rejected': qs.filter(status='REJECTED').count(),
            'enrolled': qs.filter(status='ENROLLED').count(),
            'withdrawn': qs.filter(status='WITHDRAWN').count(),
        })


class AdmissionDocumentViewSet(viewsets.ModelViewSet):
    """
    CRUD for admission documents with verification action.
    """
    serializer_class = AdmissionDocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['application', 'document_type', 'verified']

    def get_queryset(self):
        return AdmissionDocument.objects.filter(is_deleted=False)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Mark a document as verified."""
        document = self.get_object()
        document.verified = True
        document.verified_by = request.user
        document.verified_date = timezone.now()
        document.save()
        return Response(AdmissionDocumentSerializer(document).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Mark a document as not verified (reject)."""
        document = self.get_object()
        document.verified = False
        document.verified_by = None
        document.verified_date = None
        document.save()
        return Response(AdmissionDocumentSerializer(document).data)


class AdmissionSettingViewSet(viewsets.ModelViewSet):
    """
    CRUD for admission settings per class/academic year.
    """
    serializer_class = AdmissionSettingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['academic_year', 'class_applied']

    def get_queryset(self):
        return AdmissionSetting.objects.filter(
            is_deleted=False
        ).select_related('academic_year', 'class_applied')
