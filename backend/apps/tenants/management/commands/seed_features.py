"""
Management command to seed FeatureDefinition data.

Usage:
    python manage.py seed_features          # Create/update all features
    python manage.py seed_features --sync   # Also sync TenantFeature overrides for existing schools
"""

from django.core.management.base import BaseCommand
from apps.tenants.models import FeatureDefinition, TenantFeature, School
from apps.tenants.features import invalidate_all_feature_caches


# Feature registry: (code, name, description, category, minimum_tier)
FEATURES = [
    # ── CORE (Basic tier) ────────────────────────────────────────────────
    ('student_management', 'Student Management', 'Student enrollment, profiles, and records', 'CORE', 'BASIC'),
    ('teacher_management', 'Teacher Management', 'Teacher profiles and assignments', 'CORE', 'BASIC'),
    ('class_management', 'Class & Section Management', 'Class, section, and stream configuration', 'CORE', 'BASIC'),
    ('timetable_view', 'Timetable Viewing', 'View class and teacher timetables', 'CORE', 'BASIC'),
    ('attendance_basic', 'Basic Attendance', 'Daily attendance marking and reports', 'CORE', 'BASIC'),
    ('fee_management_basic', 'Basic Fee Management', 'Fee structure, collection, and receipts', 'FINANCE', 'BASIC'),
    ('exam_management', 'Exam Management', 'Exam scheduling, marks entry, and results', 'ACADEMICS', 'BASIC'),
    ('announcements', 'Announcements', 'School-wide announcements and notices', 'COMMUNICATION', 'BASIC'),

    # ── STANDARD tier ────────────────────────────────────────────────────
    ('online_payments', 'Online Payments', 'Accept fee payments online via payment gateway', 'FINANCE', 'STANDARD'),
    ('sms_notifications', 'SMS Notifications', 'Send SMS alerts to parents and staff', 'COMMUNICATION', 'STANDARD'),
    ('email_notifications', 'Email Notifications', 'Automated email notifications', 'COMMUNICATION', 'STANDARD'),
    ('library_management', 'Library Management', 'Book catalog, issue/return tracking', 'OPERATIONS', 'STANDARD'),
    ('transport_management', 'Transport Management', 'Bus routes, stops, and student assignments', 'OPERATIONS', 'STANDARD'),
    ('report_cards_basic', 'Basic Report Cards', 'Standard report card generation', 'ACADEMICS', 'STANDARD'),
    ('parent_portal', 'Parent Portal', 'Parent login for student info and communication', 'COMMUNICATION', 'STANDARD'),
    ('substitution_management', 'Substitution Management', 'Teacher substitution requests and approvals', 'ACADEMICS', 'STANDARD'),

    # ── PREMIUM tier ─────────────────────────────────────────────────────
    ('ai_timetable_generator', 'AI Timetable Generator', 'AI-powered automatic timetable generation', 'AI_PREMIUM', 'PREMIUM'),
    ('smart_substitution', 'Smart Substitution Engine', 'AI-assisted substitute teacher matching', 'AI_PREMIUM', 'PREMIUM'),
    ('advanced_analytics', 'Advanced Analytics', 'Dashboards with predictive insights', 'AI_PREMIUM', 'PREMIUM'),
    ('report_card_engine', 'Advanced Report Card Engine', 'Customizable multi-format report cards', 'ACADEMICS', 'PREMIUM'),
    ('fee_reminders_auto', 'Automated Fee Reminders', 'Scheduled payment reminders via SMS/email', 'FINANCE', 'PREMIUM'),
    ('biometric_attendance', 'Biometric Attendance', 'Integration with biometric devices', 'OPERATIONS', 'PREMIUM'),
    ('hostel_management', 'Hostel Management', 'Hostel rooms, allocation, and mess management', 'OPERATIONS', 'PREMIUM'),
    ('hr_payroll', 'HR & Payroll', 'Staff payroll, leave management, and HR workflows', 'OPERATIONS', 'PREMIUM'),

    # ── ENTERPRISE tier ──────────────────────────────────────────────────
    ('ai_exam_scheduler', 'AI Exam Scheduler', 'AI-powered exam scheduling and invigilation', 'AI_PREMIUM', 'ENTERPRISE'),
    ('predictive_analytics', 'Predictive Analytics', 'Student performance prediction and early warnings', 'AI_PREMIUM', 'ENTERPRISE'),
    ('multi_branch', 'Multi-Branch Management', 'Manage multiple school branches from one admin', 'OPERATIONS', 'ENTERPRISE'),
    ('regulatory_compliance', 'Regulatory Compliance', 'UDISE+, RTE, and board compliance reporting', 'OPERATIONS', 'ENTERPRISE'),
    ('staff_appraisal', 'Staff Appraisal System', '360-degree teacher and staff performance evaluation', 'OPERATIONS', 'ENTERPRISE'),
    ('financial_forecasting', 'Financial Forecasting', 'Revenue and expense prediction models', 'FINANCE', 'ENTERPRISE'),
    ('custom_branding', 'Custom Branding', 'White-label branding with custom domain', 'CORE', 'ENTERPRISE'),
    ('api_access', 'API Access', 'REST API access for third-party integrations', 'CORE', 'ENTERPRISE'),
]


class Command(BaseCommand):
    help = 'Seed FeatureDefinition data and optionally sync tenant feature overrides'

    def add_arguments(self, parser):
        parser.add_argument(
            '--sync',
            action='store_true',
            help='Sync TenantFeature overrides from existing TenantConfig boolean flags',
        )

    def handle(self, *args, **options):
        self.stdout.write('Seeding feature definitions...')

        created_count = 0
        updated_count = 0

        for code, name, description, category, minimum_tier in FEATURES:
            feature, created = FeatureDefinition.objects.update_or_create(
                code=code,
                defaults={
                    'name': name,
                    'description': description,
                    'category': category,
                    'minimum_tier': minimum_tier,
                    'is_active': True,
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Features seeded: {created_count} created, {updated_count} updated '
                f'({created_count + updated_count} total)'
            )
        )

        if options['sync']:
            self._sync_tenant_configs()

        # Invalidate all caches
        invalidate_all_feature_caches()
        self.stdout.write(self.style.SUCCESS('Feature caches invalidated.'))

    def _sync_tenant_configs(self):
        """
        Migrate existing TenantConfig boolean flags to TenantFeature overrides.
        Only creates overrides where the boolean differs from what the tier would give.
        """
        self.stdout.write('Syncing TenantConfig flags to TenantFeature overrides...')

        # Mapping: TenantConfig field name -> FeatureDefinition code
        FLAG_MAP = {
            'enable_online_payments': 'online_payments',
            'enable_sms_notifications': 'sms_notifications',
            'enable_email_notifications': 'email_notifications',
            'enable_biometric_attendance': 'biometric_attendance',
            'enable_parent_portal': 'parent_portal',
            'enable_library': 'library_management',
            'enable_transport': 'transport_management',
            'enable_hostel': 'hostel_management',
            'enable_hr_payroll': 'hr_payroll',
        }

        from apps.tenants.features import _tier_gte

        # Pre-fetch feature definitions
        features_by_code = {
            f.code: f for f in FeatureDefinition.objects.filter(code__in=FLAG_MAP.values())
        }

        schools = School.objects.filter(is_active=True).select_related('config', 'subscription')
        override_count = 0

        for school in schools:
            config = getattr(school, 'config', None)
            if not config:
                continue

            school_tier = getattr(school.subscription, 'tier', 'BASIC') if school.subscription_id else 'BASIC'

            for config_field, feature_code in FLAG_MAP.items():
                feature_def = features_by_code.get(feature_code)
                if not feature_def:
                    continue

                config_value = getattr(config, config_field, None)
                if config_value is None:
                    continue

                # What would the tier give?
                tier_default = _tier_gte(school_tier, feature_def.minimum_tier)

                # Only create override if config value differs from tier default
                if config_value != tier_default:
                    _, created = TenantFeature.objects.update_or_create(
                        school=school,
                        feature=feature_def,
                        defaults={
                            'is_enabled': config_value,
                            'override_reason': 'Migrated from TenantConfig boolean flag',
                        }
                    )
                    if created:
                        override_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Sync complete: {override_count} overrides created for {schools.count()} schools'
            )
        )
