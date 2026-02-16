from asgiref.sync import sync_to_async
from apps.students.models import StudentParent, Student
from apps.attendance.models import StudentAttendance, AttendanceSummary
from apps.finance.models import Payment
from apps.academics.models import StudentEnrollment
from django.db.models import Sum
from django.utils import timezone
import asyncio

class ParentAggregator:
    @staticmethod
    async def get_parent_overview(user):
        """
        Aggregates overview for all children of a parent.
        """
        # 1. Get all students linked to this parent (Sync)
        @sync_to_async
        def get_students():
            links = StudentParent.objects.filter(parent=user).select_related('student')
            return [link.student for link in links]

        students = await get_students()
        
        # 2. For each student, gather details in parallel
        tasks = [ParentAggregator._get_student_summary(student) for student in students]
        children_data = await asyncio.gather(*tasks)

        return {
            "children": children_data,
            "notifications_count": 0, # Placeholder
            "server_time": timezone.now().isoformat()
        }

    @staticmethod
    async def _get_student_summary(student):
        """
        Gather details for a single student.
        """
        
        @sync_to_async
        def get_enrollment():
            return student.get_current_class_enrollment()
            
        @sync_to_async
        def get_attendance_summary():
            # Get latest summary
            summary = AttendanceSummary.objects.filter(student=student).order_by('-month').first()
            if summary:
                return {
                    "percentage": summary.attendance_percentage,
                    "present_days": summary.present_days,
                    "total_days": summary.total_days
                }
            return None

        @sync_to_async
        def get_fee_summary():
            # Using Payment model
            last_payment = Payment.objects.filter(student=student).order_by('-payment_date').first()
            return {
                "last_payment_amount": last_payment.amount if last_payment else 0,
                "last_payment_date": last_payment.payment_date if last_payment else None
            }

        enrollment, attendance, fees = await asyncio.gather(
            get_enrollment(),
            get_attendance_summary(),
            get_fee_summary()
        )

        class_section = "N/A"
        if enrollment:
             section = enrollment.section
             class_section = f"{section.class_instance.display_name} - {section.name}"

        return {
            "id": student.id,
            "name": student.get_full_name(),
            "photo_url": student.photo.url if student.photo else None,
            "class_section": class_section,
            "admission_number": student.admission_number,
            "attendance": attendance,
            "fees": fees,
        }
