"""
Management command to seed consent purposes master data
Usage: python manage.py seed_consent_purposes
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.privacy.models import ConsentPurpose


class Command(BaseCommand):
    help = 'Seeds consent purposes master data for DPDP compliance'

    def handle(self, *args, **options):
        self.stdout.write('Seeding consent purposes...')

        consent_purposes = [
            {
                'code': 'CORE_EDUCATIONAL',
                'name': 'Core Educational Activities',
                'description': 'Processing student data for enrollment, class assignments, academic records, examinations, report cards, and attendance tracking. This is essential for providing educational services and cannot be withdrawn.',
                'is_mandatory': True,
                'category': 'EDUCATIONAL',
                'legal_basis': 'Essential for fulfilling the educational contract between school and parent/guardian. Required under Right to Education Act, 2009.',
                'retention_period_days': 3650,  # 10 years
                'is_active': True,
            },
            {
                'code': 'HEALTH_SAFETY',
                'name': 'Health & Safety Records',
                'description': 'Storing health records, medical conditions, allergies, vaccination records, and emergency contact information to ensure student safety and well-being during school hours.',
                'is_mandatory': True,
                'category': 'HEALTH',
                'legal_basis': 'Legal obligation under Disaster Management Act, 2005 and duty of care to ensure student safety. Required for emergency response.',
                'retention_period_days': 3650,
                'is_active': True,
            },
            {
                'code': 'COMMUNICATION_NOTICES',
                'name': 'Communication & Notices',
                'description': 'Sending emails, SMS, and app notifications for school notices, event updates, academic communications, holiday announcements, and parent-teacher meeting schedules.',
                'is_mandatory': False,
                'category': 'COMMUNICATION',
                'legal_basis': 'Legitimate interest in keeping parents informed about school activities. Parents may opt-out and choose alternative communication methods.',
                'retention_period_days': 365,
                'is_active': True,
            },
            {
                'code': 'FEE_MANAGEMENT',
                'name': 'Fee Management & Financial Processing',
                'description': 'Processing fee payments, generating invoices, tracking financial transactions, payment reminders, and maintaining fee payment history for accounting purposes.',
                'is_mandatory': True,
                'category': 'FINANCIAL',
                'legal_basis': 'Contractual obligation for fee collection and legal requirement under Income Tax Act, 1961 for financial record retention (7 years).',
                'retention_period_days': 2555,  # 7 years
                'is_active': True,
            },
            {
                'code': 'ATTENDANCE_TRACKING',
                'name': 'Attendance Tracking & Monitoring',
                'description': 'Recording daily attendance, tracking absence patterns, generating attendance reports, and monitoring punctuality for academic assessment and safety purposes.',
                'is_mandatory': True,
                'category': 'EDUCATIONAL',
                'legal_basis': 'Educational necessity under Right to Education Act and safety monitoring requirement. Essential for tracking student presence on campus.',
                'retention_period_days': 1825,  # 5 years
                'is_active': True,
            },
            {
                'code': 'BEHAVIORAL_MONITORING',
                'name': 'Behavioral Monitoring & Development Notes',
                'description': 'Recording behavioral incidents, achievements, developmental observations, disciplinary actions, and teacher remarks for student development and counseling purposes.',
                'is_mandatory': False,
                'category': 'EDUCATIONAL',
                'legal_basis': 'Educational development and student welfare. Helps track behavioral patterns and provide appropriate counseling support.',
                'retention_period_days': 1825,
                'is_active': True,
            },
            {
                'code': 'PHOTO_MEDIA',
                'name': 'Photo & Media Storage',
                'description': 'Storing student photographs for ID cards, school records, yearbooks, website galleries, and promotional materials. Photos may be used in school publications and events.',
                'is_mandatory': False,
                'category': 'ADMINISTRATIVE',
                'legal_basis': 'Administrative convenience for identification purposes. Parents may decline photo usage in public materials while allowing ID card photos.',
                'retention_period_days': 1095,  # 3 years
                'is_active': True,
            },
            {
                'code': 'ANALYTICS_IMPROVEMENT',
                'name': 'Analytics & System Improvement',
                'description': 'Analyzing academic performance trends, attendance patterns, usage statistics, and system performance data to improve educational outcomes and optimize school operations.',
                'is_mandatory': False,
                'category': 'ANALYTICS',
                'legal_basis': 'Legitimate interest in improving educational services and system efficiency. Data is anonymized where possible for trend analysis.',
                'retention_period_days': 730,  # 2 years
                'is_active': True,
            },
            {
                'code': 'THIRD_PARTY_SMS',
                'name': 'Third-Party SMS Service (Twilio)',
                'description': 'Sharing phone numbers with Twilio SMS service for sending text notifications about attendance, fee reminders, exam schedules, and emergency alerts.',
                'is_mandatory': False,
                'category': 'THIRD_PARTY',
                'legal_basis': 'Service delivery via authorized vendor with Data Processing Agreement. Twilio processes data only as per our instructions.',
                'retention_period_days': 365,
                'is_active': True,
            },
            {
                'code': 'THIRD_PARTY_PAYMENT',
                'name': 'Third-Party Payment Gateway (Razorpay/PayU/Stripe)',
                'description': 'Sharing payment details with payment gateway providers (Razorpay, PayU, Stripe) for processing online fee payments securely. Payment data is tokenized and encrypted.',
                'is_mandatory': False,
                'category': 'THIRD_PARTY',
                'legal_basis': 'Service delivery via PCI-DSS compliant payment processors. Required for online payment processing with Data Processing Agreements in place.',
                'retention_period_days': 2555,
                'is_active': True,
            },
            {
                'code': 'GOVERNMENT_ID_SAMAGRA',
                'name': 'Government ID Collection (Samagra ID - MP)',
                'description': 'Collection and storage of Samagra Family ID (8 digits) and Samagra Member ID (9 digits) for students in Madhya Pradesh. Required for scholarship applications (MPTAAS), mid-day meal tracking, social welfare schemes, and government benefit distribution through the Samagra Social Security Mission (SSSM) portal.',
                'is_mandatory': False,
                'category': 'COMPLIANCE',
                'legal_basis': 'Government mandate for scholarship eligibility and welfare scheme access in Madhya Pradesh. Required by MP Samagra Shiksha program for student identification and benefit delivery. Collection is voluntary but necessary for accessing state government scholarships and benefits.',
                'retention_period_days': 3650,  # 10 years
                'is_active': True,
            },
        ]

        created_count = 0
        updated_count = 0

        for purpose_data in consent_purposes:
            purpose, created = ConsentPurpose.objects.get_or_create(
                code=purpose_data['code'],
                defaults=purpose_data
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'[+] Created: {purpose.code} - {purpose.name}')
                )
            else:
                # Update existing record
                for key, value in purpose_data.items():
                    setattr(purpose, key, value)
                purpose.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'[*] Updated: {purpose.code} - {purpose.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n[SUCCESS] Seeding complete: {created_count} created, {updated_count} updated'
            )
        )
