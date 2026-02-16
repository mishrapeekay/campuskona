from celery import shared_task
from django.core.files.base import ContentFile
from apps.government_reports.models import ReportGeneration
from apps.government_reports.services.udise import UDISEPlusService
from apps.government_reports.services.rte import RTEComplianceService
from apps.government_reports.services.board import BoardReportService
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

@shared_task
def generate_government_report_task(report_id):
    """
    Celery task to generate heavy government/compliance reports asynchronously.
    """
    try:
        report = ReportGeneration.objects.get(id=report_id)
    except ReportGeneration.DoesNotExist:
        logger.error(f"ReportGeneration with ID {report_id} not found.")
        return "Report Not Found"

    try:
        report.status = 'GENERATING'
        report.save()

        file_buffer = None
        academic_year = report.academic_year
        report_type = report.report_type
        filename = f"{report_type}_{academic_year}.xlsx"

        logger.info(f"Starting generation for Report {report_id} ({report_type})")

        if report_type == 'UDISE_PLUS':
            service = UDISEPlusService()
            data = service.generate_report_data(academic_year)
            file_buffer = service.generate_excel(data)
        
        elif report_type == 'RTE_ADMISSIONS':
            service = RTEComplianceService()
            data = service.get_compliance_status(academic_year)
            file_buffer = service.generate_excel(data)
        
        elif report_type == 'BOARD_EXPORT':
            service = BoardReportService()
            file_buffer = service.generate_cbse_format(academic_year)
        
        else:
            raise ValueError(f"Unsupported report type: {report_type}")

        if file_buffer:
            report.generated_file.save(filename, ContentFile(file_buffer.getvalue()))
            report.status = 'COMPLETED'
            report.save()
            logger.info(f"Report {report_id} generated successfully.")
            return f"Report {report_id} generated successfully."
        else:
             raise ValueError("Service returned empty file buffer")

    except Exception as e:
        logger.error(f"Failed to generate report {report_id}: {str(e)}")
        report.status = 'FAILED'
        report.error_message = str(e)
        report.save()
        # Re-raise to ensure Celery marks task as failed if needed, though we handled the state update
        raise e
