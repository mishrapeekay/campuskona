"""
Data Export Service - DPDP Act Section 11 (Right to Access)
Allows parents to export student data in machine-readable formats
"""
import json
import csv
from io import StringIO
from django.http import HttpResponse
from django.utils import timezone


class DataExportService:
    """
    Service to export student personal data in compliance with DPDP Act Section 11
    Supports JSON and CSV formats
    """

    @staticmethod
    def export_student_data_json(student):
        """
        Export all student data as JSON

        Args:
            student: Student model instance

        Returns:
            dict: Complete student data dictionary
        """
        data = {
            'export_info': {
                'exported_at': timezone.now().isoformat(),
                'format': 'JSON',
                'dpdp_compliance': 'Section 11 - Right to Access',
            },
            'personal_information': {
                'admission_number': student.admission_number,
                'first_name': student.first_name,
                'middle_name': student.middle_name or '',
                'last_name': student.last_name,
                'full_name': student.get_full_name(),
                'date_of_birth': str(student.date_of_birth),
                'age': student.get_age(),
                'gender': student.get_gender_display(),
                'blood_group': student.blood_group or '',
                'admission_date': str(student.admission_date),
                'admission_status': student.get_admission_status_display(),
            },
            'contact_information': {
                'phone_number': student.phone_number or '',
                'email': student.email or '',
                'emergency_contact': student.emergency_contact_number,
            },
            'current_address': {
                'line1': student.current_address_line1,
                'line2': student.current_address_line2 or '',
                'city': student.current_city,
                'state': student.current_state,
                'pincode': student.current_pincode,
            },
            'permanent_address': {
                'line1': student.permanent_address_line1,
                'line2': student.permanent_address_line2 or '',
                'city': student.permanent_city,
                'state': student.permanent_state,
                'pincode': student.permanent_pincode,
            },
            'family_information': {
                'father': {
                    'name': student.father_name,
                    'occupation': student.father_occupation or '',
                    'phone': student.father_phone,
                    'email': student.father_email or '',
                    'annual_income': str(student.father_annual_income) if student.father_annual_income else '',
                },
                'mother': {
                    'name': student.mother_name,
                    'occupation': student.mother_occupation or '',
                    'phone': student.mother_phone or '',
                    'email': student.mother_email or '',
                    'annual_income': str(student.mother_annual_income) if student.mother_annual_income else '',
                },
                'guardian': {
                    'name': student.guardian_name or '',
                    'relation': student.guardian_relation or '',
                    'phone': student.guardian_phone or '',
                    'email': student.guardian_email or '',
                },
            },
            'government_ids': {
                'aadhar_number': student.aadhar_number or '',
                'samagra_family_id': student.samagra_family_id or '',
                'samagra_member_id': student.samagra_member_id or '',
                'samagra_id_verified': student.samagra_id_verified,
            },
            'academic_background': {
                'previous_school': student.previous_school_name or '',
                'previous_board': student.previous_school_board or '',
                'previous_class': student.previous_class or '',
                'transfer_certificate': student.transfer_certificate_number or '',
            },
            'category_and_religion': {
                'category': student.get_category_display(),
                'religion': student.get_religion_display(),
            },
            'special_needs': {
                'is_differently_abled': student.is_differently_abled,
                'disability_details': student.disability_details or '',
            },
            'medical_information': {
                'medical_conditions': student.medical_conditions or '',
            },
            'metadata': {
                'created_at': student.created_at.isoformat() if student.created_at else '',
                'updated_at': student.updated_at.isoformat() if student.updated_at else '',
            },
            'privacy_notice': {
                'message': 'This data is provided as per your Right to Access under DPDP Act 2023, Section 11.',
                'data_retention': 'Data will be retained as per consent purposes (3-10 years).',
                'contact_dpo': 'For corrections or deletions, contact: dpo@school.edu.in',
            }
        }

        return data

    @staticmethod
    def export_student_data_csv(student):
        """
        Export student data as CSV

        Args:
            student: Student model instance

        Returns:
            str: CSV formatted string
        """
        output = StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow(['STUDENT DATA EXPORT (DPDP Act 2023 - Section 11)'])
        writer.writerow(['Exported At:', timezone.now().isoformat()])
        writer.writerow([])

        # Personal Information
        writer.writerow(['PERSONAL INFORMATION'])
        writer.writerow(['Field', 'Value'])
        writer.writerow(['Admission Number', student.admission_number])
        writer.writerow(['Full Name', student.get_full_name()])
        writer.writerow(['Date of Birth', str(student.date_of_birth)])
        writer.writerow(['Age', student.get_age()])
        writer.writerow(['Gender', student.get_gender_display()])
        writer.writerow(['Blood Group', student.blood_group or ''])
        writer.writerow([])

        # Contact Information
        writer.writerow(['CONTACT INFORMATION'])
        writer.writerow(['Phone', student.phone_number or ''])
        writer.writerow(['Email', student.email or ''])
        writer.writerow(['Emergency Contact', student.emergency_contact_number])
        writer.writerow([])

        # Address
        writer.writerow(['CURRENT ADDRESS'])
        writer.writerow(['Address Line 1', student.current_address_line1])
        writer.writerow(['Address Line 2', student.current_address_line2 or ''])
        writer.writerow(['City', student.current_city])
        writer.writerow(['State', student.current_state])
        writer.writerow(['PIN Code', student.current_pincode])
        writer.writerow([])

        # Government IDs
        writer.writerow(['GOVERNMENT IDs'])
        writer.writerow(['Aadhar Number', student.aadhar_number or ''])
        writer.writerow(['Samagra Family ID', student.samagra_family_id or ''])
        writer.writerow(['Samagra Member ID', student.samagra_member_id or ''])
        writer.writerow([])

        # Family Information
        writer.writerow(['FAMILY INFORMATION'])
        writer.writerow(['Father Name', student.father_name])
        writer.writerow(['Father Phone', student.father_phone])
        writer.writerow(['Mother Name', student.mother_name])
        writer.writerow(['Mother Phone', student.mother_phone or ''])
        writer.writerow([])

        # Privacy Notice
        writer.writerow(['PRIVACY NOTICE'])
        writer.writerow(['This data is provided as per Right to Access under DPDP Act 2023, Section 11.'])
        writer.writerow(['For corrections or deletions, contact: dpo@school.edu.in'])

        return output.getvalue()

    @staticmethod
    def create_export_response(student, format='json'):
        """
        Create HTTP response with student data export

        Args:
            student: Student model instance
            format: 'json' or 'csv'

        Returns:
            HttpResponse with appropriate content type
        """
        if format.lower() == 'json':
            data = DataExportService.export_student_data_json(student)
            response = HttpResponse(
                json.dumps(data, indent=2),
                content_type='application/json'
            )
            filename = f'student_data_{student.admission_number}_{timezone.now().strftime("%Y%m%d")}.json'
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

        elif format.lower() == 'csv':
            data = DataExportService.export_student_data_csv(student)
            response = HttpResponse(data, content_type='text/csv')
            filename = f'student_data_{student.admission_number}_{timezone.now().strftime("%Y%m%d")}.csv'
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

        else:
            raise ValueError(f"Unsupported format: {format}. Use 'json' or 'csv'.")

        return response
