from django.core.management.base import BaseCommand
from apps.library.models import BookIssue

class Command(BaseCommand):
    help = 'Update overdue book statuses'

    def handle(self, *args, **options):
        updated = BookIssue.objects.update_overdue_status()
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated} overdue books')
        )
