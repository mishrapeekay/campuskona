from django.core.management.base import BaseCommand
from apps.government_reports.models import UDISECodeMapping
from django_tenants.utils import get_tenant_model, tenant_context

class Command(BaseCommand):
    help = 'Populate initial UDISE+ Code Mappings for all tenants'

    def handle(self, *args, **options):
        Tenant = get_tenant_model()
        self.stdout.write("Fetching tenants...")
        
        tenants = Tenant.objects.exclude(schema_name='public')
        self.stdout.write(f"Found {tenants.count()} tenant(s). Seeding UDISE codes...")

        for tenant in tenants:
            self.stdout.write(f"Processing tenant: {tenant.schema_name}")
            with tenant_context(tenant):
                self._seed_mappings()

    def _seed_mappings(self):
        mappings = [
            # Gender (Internal: M/F/O -> UDISE: 1/2/3)
            {'category': 'GENDER', 'internal_value': 'M', 'udise_code': '1', 'udise_description': 'Boys'},
            {'category': 'GENDER', 'internal_value': 'F', 'udise_code': '2', 'udise_description': 'Girls'},
            {'category': 'GENDER', 'internal_value': 'O', 'udise_code': '3', 'udise_description': 'Transgender'},

            # Social Category
            {'category': 'SOCIAL_CATEGORY', 'internal_value': 'GENERAL', 'udise_code': '1', 'udise_description': 'General'},
            {'category': 'SOCIAL_CATEGORY', 'internal_value': 'SC', 'udise_code': '2', 'udise_description': 'Scheduled Caste'},
            {'category': 'SOCIAL_CATEGORY', 'internal_value': 'ST', 'udise_code': '3', 'udise_description': 'Scheduled Tribe'},
            {'category': 'SOCIAL_CATEGORY', 'internal_value': 'OBC', 'udise_code': '4', 'udise_description': 'OBC'},
            # Note: EWS is not a separate social category in UDISE usually, but covered under General/OBC with income criteria, 
            # but sometimes mapped to General or specific code if state defines. Mapping EWS to General for now as base category.
            {'category': 'SOCIAL_CATEGORY', 'internal_value': 'EWS', 'udise_code': '1', 'udise_description': 'General (EWS)'}, 

            # Religion
            {'category': 'RELIGION', 'internal_value': 'HINDU', 'udise_code': '1', 'udise_description': 'Hindu'},
            {'category': 'RELIGION', 'internal_value': 'MUSLIM', 'udise_code': '2', 'udise_description': 'Muslim'},
            {'category': 'RELIGION', 'internal_value': 'CHRISTIAN', 'udise_code': '3', 'udise_description': 'Christian'},
            {'category': 'RELIGION', 'internal_value': 'SIKH', 'udise_code': '4', 'udise_description': 'Sikh'},
            {'category': 'RELIGION', 'internal_value': 'BUDDHIST', 'udise_code': '5', 'udise_description': 'Buddhist'},
            {'category': 'RELIGION', 'internal_value': 'PARSI', 'udise_code': '6', 'udise_description': 'Parsi'},
            {'category': 'RELIGION', 'internal_value': 'JAIN', 'udise_code': '7', 'udise_description': 'Jain'},
            {'category': 'RELIGION', 'internal_value': 'OTHER', 'udise_code': '8', 'udise_description': 'Other'},

            # Disability (CWSN)
            {'category': 'DISABILITY', 'internal_value': 'BLINDNESS', 'udise_code': '1', 'udise_description': 'Blindness'},
            {'category': 'DISABILITY', 'internal_value': 'LOW_VISION', 'udise_code': '2', 'udise_description': 'Low-Vision'},
            {'category': 'DISABILITY', 'internal_value': 'HEARING_IMPAIRMENT', 'udise_code': '3', 'udise_description': 'Hearing Impairment'},
            {'category': 'DISABILITY', 'internal_value': 'LOCOMOTOR_DISABILITY', 'udise_code': '4', 'udise_description': 'Locomotor Disability'},
            # Add more as needed based on specific needs

            # Medium of Instruction
            {'category': 'MEDIUM_OF_INSTRUCTION', 'internal_value': 'ENGLISH', 'udise_code': '19', 'udise_description': 'English'},
            {'category': 'MEDIUM_OF_INSTRUCTION', 'internal_value': 'HINDI', 'udise_code': '04', 'udise_description': 'Hindi'},
            {'category': 'MEDIUM_OF_INSTRUCTION', 'internal_value': 'MARATHI', 'udise_code': '09', 'udise_description': 'Marathi'},
            {'category': 'MEDIUM_OF_INSTRUCTION', 'internal_value': 'GUJARATI', 'udise_code': '03', 'udise_description': 'Gujarati'},
            {'category': 'MEDIUM_OF_INSTRUCTION', 'internal_value': 'TAMIL', 'udise_code': '16', 'udise_description': 'Tamil'},
        ]

        count = 0
        for m in mappings:
            obj, created = UDISECodeMapping.objects.get_or_create(
                category=m['category'],
                internal_value=m['internal_value'],
                defaults={
                    'udise_code': m['udise_code'],
                    'udise_description': m['udise_description']
                }
            )
            if created:
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} UDISE+ mappings."))
