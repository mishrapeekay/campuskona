from django.core.management.base import BaseCommand
from apps.government_reports.models import ReportGeneration
from apps.government_reports.tasks import generate_government_report_task
import time

class Command(BaseCommand):
    help = 'Generate Government/Compliance Report'

    def add_arguments(self, parser):
        parser.add_argument('report_type', type=str, help='Report Type: UDISE_PLUS, RTE_ADMISSIONS, BOARD_EXPORT')
        parser.add_argument('academic_year', type=str, help='Academic Year (e.g. 2023-2024)')

    def handle(self, *args, **options):
        report_type = options['report_type']
        academic_year = options['academic_year']
        
        # Validate report type matches choices
        valid_types = [choice[0] for choice in ReportGeneration.REPORT_TYPES]
        if report_type not in valid_types:
             self.stderr.write(self.style.ERROR(f"Invalid report type. Choices: {valid_types}"))
             return

        self.stdout.write(f"Starting generation of {report_type} for {academic_year}...")

        # Create Pending Record
        report_obj = ReportGeneration.objects.create(
            report_type=report_type,
            academic_year=academic_year,
            status='GENERATING',
        )

        try:
            # Call the task function synchronously (without .delay())
            result = generate_government_report_task(report_obj.id)
            
            # Since task updates status, we reload to check
            report_obj.refresh_from_db()
            
            if report_obj.status == 'COMPLETED':
                self.stdout.write(self.style.SUCCESS(f"Report generated successfully: {report_obj.generated_file.url}"))
            else:
                self.stdout.write(self.style.ERROR(f"Report failed with status: {report_obj.status}. Error: {report_obj.error_message}"))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Failed to execute task: {str(e)}"))
