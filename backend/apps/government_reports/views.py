from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ReportGeneration, RTEComplianceRecord
from .serializers import ReportGenerationSerializer, RTEComplianceRecordSerializer
from apps.government_reports.services.rte import RTEComplianceService
from apps.government_reports.tasks import generate_government_report_task

class GovernmentReportsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for generating and managing government reports (UDISE+, RTE, etc.)
    """
    queryset = ReportGeneration.objects.all()
    serializer_class = ReportGenerationSerializer
    permission_classes = [IsAuthenticated] # Should refine to Admin roles

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        report_type = request.data.get('report_type')
        academic_year = request.data.get('academic_year')
        
        if not report_type or not academic_year:
            return Response({'error': 'report_type and academic_year are required'}, status=status.HTTP_400_BAD_REQUEST)

        valid_types = [choice[0] for choice in ReportGeneration.REPORT_TYPES]
        if report_type not in valid_types:
             return Response({'error': f'Invalid report type. Choices: {valid_types}'}, status=status.HTTP_400_BAD_REQUEST)

        # Create Report Record (Pending/Generating status)
        report = ReportGeneration.objects.create(
            report_type=report_type,
            academic_year=academic_year,
            status='PENDING', # Initially PENDING until worker picks it up
            created_by=request.user
        )

        try:
            # Offload to Celery
            generate_government_report_task.delay(report.id)
            
            return Response({
                'message': 'Report generation initiated successfully.',
                'report_id': report.id,
                'status': 'PENDING'
            }, status=status.HTTP_202_ACCEPTED)

        except Exception as e:
            report.status = 'FAILED'
            report.error_message = str(e)
            report.save()
            return Response({'error': f"Failed to queue task: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Keep this for backward compatibility or direct data checking if needed
    @action(detail=False, methods=['get'])
    def rte_compliance(self, request):
        academic_year = request.query_params.get('academic_year')
        if not academic_year:
            return Response({'error': 'academic_year is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            service = RTEComplianceService()
            data = service.get_compliance_status(academic_year)
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RTEComplianceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for RTE Compliance Records (Audit Trail)
    """
    queryset = RTEComplianceRecord.objects.all()
    serializer_class = RTEComplianceRecordSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """
        Verify an RTE compliance record (Auditor/Admin action)
        """
        record = self.get_object()
        record.verification_status = 'VERIFIED'
        record.verified_by = request.user
        record.verification_date = timezone.now()
        record.save()
        return Response(self.get_serializer(record).data)
