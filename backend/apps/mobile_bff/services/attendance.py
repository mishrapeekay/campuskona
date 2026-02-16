from asgiref.sync import sync_to_async
from apps.students.models import Student
from apps.academics.models import StudentEnrollment
from apps.attendance.models import StudentAttendance
from django.utils import timezone
from datetime import datetime
import asyncio

class AttendanceAggregator:
    @staticmethod
    async def get_class_roster(section_id, date_str=None):
        """
        Get lightweight roster for attendance marking.
        """
        target_date = timezone.now().date()
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except:
                pass

        @sync_to_async
        def get_roster_data():
            # 1. Get Enrollments (Students in section)
            # This is a synchronous DB call
            enrollments = list(StudentEnrollment.objects.filter(
                section_id=section_id,
                is_active=True
            ).select_related('student').order_by('student__first_name'))

            # 2. Get existing attendance for this date
            attendance_map = {}
            attendances = StudentAttendance.objects.filter(
                date=target_date,
                student__class_enrollments__section_id=section_id
            )
            for att in attendances:
                attendance_map[att.student_id] = att.status

            roster = []
            for enrollment in enrollments:
                student = enrollment.student
                roster.append({
                    "student_id": student.id,
                    "name": student.get_full_name(),
                    # Assuming photo is an ImageField, needs handling if None
                    "photo_thumbnail": student.photo.url if student.photo else None,
                    "roll_number": enrollment.roll_number,
                    "current_status": attendance_map.get(student.id, "PENDING") 
                })
            return roster

        return await get_roster_data()
