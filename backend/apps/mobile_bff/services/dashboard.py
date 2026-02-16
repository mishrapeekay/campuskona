from asgiref.sync import sync_to_async
from django.db.models import Count, Sum, Q, Avg
from django.utils import timezone
from datetime import date, timedelta
from apps.students.models import Student, StudentParent
from apps.staff.models import StaffMember
from apps.finance.models import Payment
from apps.academics.models import AcademicYear, StudentEnrollment
from apps.attendance.models import StudentAttendance
from apps.timetable.models import TeacherTimetable, TimetableSubstitution
from apps.examinations.models import ExamSchedule
from apps.assignments.models import Assignment, AssignmentSubmission
from apps.attendance.models import StudentAttendance, StudentLeave
from apps.communication.models import Notification
from apps.core.models import AuditLog
import asyncio


class DashboardAggregator:

    @staticmethod
    async def get_admin_dashboard_data(tenant):
        """
        Aggregates data for the Admin Dashboard.
        Uses asyncio.gather for parallel execution of independent queries.
        """

        @sync_to_async
        def get_total_students():
            return Student.objects.count()

        @sync_to_async
        def get_total_staff():
            return StaffMember.objects.count()

        @sync_to_async
        def get_recent_revenue():
            thirty_days_ago = timezone.now() - timedelta(days=30)
            return Payment.objects.filter(
                created_at__gte=thirty_days_ago,
                status='SUCCESS'
            ).aggregate(total=Sum('amount'))['total'] or 0

        @sync_to_async
        def get_recent_activities():
            return list(
                AuditLog.objects.order_by('-created_at')[:10].values(
                    'action', 'model_name', 'object_repr', 'created_at', 'user__first_name'
                )
            )

        @sync_to_async
        def get_attendance_today():
            today = date.today()
            total = StudentAttendance.objects.filter(date=today).count()
            present = StudentAttendance.objects.filter(date=today, status='PRESENT').count()
            return {"total_marked": total, "present": present}

        total_students, total_staff, revenue, activities, attendance = await asyncio.gather(
            get_total_students(),
            get_total_staff(),
            get_recent_revenue(),
            get_recent_activities(),
            get_attendance_today()
        )

        return {
            "stats": {
                "students": total_students,
                "staff": total_staff,
                "revenue": float(revenue),
            },
            "attendance_today": attendance,
            "recent_activities": activities,
            "quick_actions": [
                {"label": "Add Student", "action": "navigate", "target": "AddStudent"},
                {"label": "Collect Fee", "action": "navigate", "target": "FeeCollection"},
                {"label": "Mark Attendance", "action": "navigate", "target": "Attendance"},
                {"label": "Send Notice", "action": "navigate", "target": "CreateNotice"},
            ]
        }

    @staticmethod
    async def get_teacher_dashboard_data(user):
        """
        Aggregates data for the Teacher Dashboard.
        """
        today = date.today()
        day_name = today.strftime('%A').upper()

        @sync_to_async
        def get_staff_member():
            try:
                return StaffMember.objects.get(user=user)
            except StaffMember.DoesNotExist:
                return None

        staff = await get_staff_member()
        if not staff:
            return {
                "greeting": f"Hello, {user.first_name}",
                "today_classes": [],
                "pending_attendance": 0,
                "upcoming_assignments": [],
            }

        @sync_to_async
        def get_today_classes():
            return list(
                TeacherTimetable.objects.filter(
                    teacher=staff,
                    day_of_week=day_name,
                    is_active=True,
                    academic_year__is_current=True,
                ).select_related(
                    'subject', 'section', 'section__class_instance', 'time_slot'
                ).order_by('time_slot__order').values(
                    'id',
                    'subject__name',
                    'section__name',
                    'section__class_instance__name',
                    'time_slot__name',
                    'time_slot__start_time',
                    'time_slot__end_time',
                    'room_number',
                )
            )

        @sync_to_async
        def get_pending_attendance():
            # Sections the teacher teaches today that don't have attendance marked
            teacher_sections_today = TeacherTimetable.objects.filter(
                teacher=staff,
                day_of_week=day_name,
                is_active=True,
                academic_year__is_current=True,
            ).values_list('section_id', flat=True).distinct()

            sections_with_attendance = StudentAttendance.objects.filter(
                date=today,
                student__class_enrollments__section_id__in=teacher_sections_today,
                student__class_enrollments__is_active=True,
            ).values_list(
                'student__class_enrollments__section_id', flat=True
            ).distinct()

            return len(set(teacher_sections_today) - set(sections_with_attendance))

        @sync_to_async
        def get_upcoming_assignments():
            return list(
                Assignment.objects.filter(
                    teacher=staff,
                    status='PUBLISHED',
                    due_date__gte=timezone.now(),
                ).order_by('due_date')[:5].values(
                    'id', 'title', 'subject__name',
                    'section__name', 'section__class_instance__name',
                    'due_date',
                )
            )

        today_classes, pending, assignments = await asyncio.gather(
            get_today_classes(),
            get_pending_attendance(),
            get_upcoming_assignments(),
        )

        return {
            "greeting": f"Hello, {user.first_name}",
            "today_classes": today_classes,
            "pending_attendance": pending,
            "upcoming_assignments": assignments,
        }

    @staticmethod
    async def get_teacher_home_data(user):
        """
        Aggregates action-oriented data for the Teacher Home screen.
        Optimized for mobile with minimal payload and single API call.
        """
        today = date.today()
        day_name = today.strftime('%A').upper()

        @sync_to_async
        def get_staff_member():
            try:
                # Use select_related for linked user if needed, though 'user' is passed
                return StaffMember.objects.select_related('user').get(user=user)
            except StaffMember.DoesNotExist:
                return None

        staff = await get_staff_member()
        if not staff:
             # Return empty structure if not a staff member
            return {
                "greeting": f"Hello, {user.first_name}",
                "date": today,
                "timetable": [],
                "pending_actions": [],
                "urgent_alerts": []
            }

        # 1. Today's Timetable
        @sync_to_async
        def get_timetable():
            return list(
                TeacherTimetable.objects.filter(
                    teacher=staff,
                    day_of_week=day_name,
                    is_active=True,
                    academic_year__is_current=True,
                ).select_related(
                    'subject', 'section', 'section__class_instance', 'time_slot'
                ).order_by('time_slot__start_time').values(
                    'id',
                    'subject__name',
                    'section__name',
                    'section__id',
                    'section__class_instance__name',
                    'time_slot__name',
                    'time_slot__start_time',
                    'time_slot__end_time',
                    'room_number',
                )
            )

        # 2. Pending Attendance
        @sync_to_async
        def get_pending_attendance(timetable_data):
            if not timetable_data:
                return []
            
            # Extract section IDs from today's timetable
            section_ids = {entry['section__id'] for entry in timetable_data}
            
            # Find sections where attendance is already marked for today
            marked_sections = set(StudentAttendance.objects.filter(
                date=today,
                student__class_enrollments__section_id__in=section_ids,
                student__class_enrollments__is_active=True
            ).values_list('student__class_enrollments__section_id', flat=True).distinct())

            # Identify pending sections (in timetable but not marked)
            pending_items = []
            for entry in timetable_data:
                if entry['section__id'] not in marked_sections:
                     # Only consider periods that have started or are past
                     # For simplicity, we list all today's periods that are not marked
                     # In a real app, might filter by time > entry['start_time']
                    pending_items.append({
                        "id": entry['section__id'],
                        "label": f"Mark Attendance: {entry['section__class_instance__name']} - {entry['section__name']}",
                        "action_url": f"/attendance/mark/{entry['section__id']}"
                    })
            
            # Remove duplicates if multiple periods for same section (or handle per period)
            # Assuming attendance is daily for now based on StudentAttendance model (date based)
            # If period-based, we'd check against specific periods.
            # The model allows period-wise, but 'marked_sections' query above checks ANY attendance for that section today.
            # Let's assume daily attendance for simplicity unless period is specified.
            unique_pending = {v['id']: v for v in pending_items}.values()
            return list(unique_pending)

        # 3. Assignments Pending Review
        @sync_to_async
        def get_pending_assignments():
            count = AssignmentSubmission.objects.filter(
                assignment__teacher=staff,
                status='SUBMITTED' # Submitted but not graded
            ).count()
            
            if count > 0:
                return [{
                    "type": "ASSIGNMENT",
                    "count": count,
                    "label": f"{count} Assignments to Review",
                    "items": [] # detailed list could be fetched if needed
                }]
            return []

        # 4. Unread Parent Messages / Leave Requests
        @sync_to_async
        def get_parent_messages():
            # Pending leave requests from students in classes taught by this teacher
            # (Assuming Class Teacher responsibility or subject teacher visibility)
            # Use 'is_class_teacher' flag or just show for all sections taught
            
            # 1. Notification count
            unread_notifs = Notification.objects.filter(
                recipient=user,
                is_read=False
            ).count()

            actions = []
            if unread_notifs > 0:
                 actions.append({
                    "type": "NOTIFICATION",
                    "count": unread_notifs,
                    "label": f"{unread_notifs} Unread Notifications",
                 })
            
            # 2. Pending Leave Requests (where teacher is the approver/class teacher)
            # If staff is class teacher, show pending leaves for that class
            if staff.is_class_teacher:
                 # Find classes where they are class teacher - simplistic check for now
                 # Model doesn't explicitly link Class -> Teacher for class teacher, 
                 # it has 'is_class_teacher' bool on Staff. 
                 # Usually defined in Class model. Let's assume we search sections.
                 # For now, just generic pending leaves query if relation existed.
                 pass

            return actions

        # 5. Urgent Alerts (Substitutions)
        @sync_to_async
        def get_urgent_alerts():
            alerts = []
            
            # Substitutions where this teacher is the substitute
            substitutions = TimetableSubstitution.objects.filter(
                substitute_teacher=staff,
                date=today,
                status='PENDING' # or APPROVED if they need to know
            ).select_related('original_entry', 'original_entry__class_obj', 'original_entry__section')
            
            for sub in substitutions:
                alerts.append({
                    "type": "SUBSTITUTION",
                    "message": f"Substitution: {sub.original_entry.class_obj.name}-{sub.original_entry.section.name} (Period {sub.original_entry.time_slot.order})",
                    "severity": "HIGH",
                    "action_url": f"/timetable/substitution/{sub.id}"
                })
            
            # Leave Clashes (if any logic exists)
            
            return alerts

        # Execute in parallel
        timetable_data, assignments_pending, parent_messages, alerts = await asyncio.gather(
            get_timetable(),
            get_pending_assignments(),
            get_parent_messages(),
            get_urgent_alerts()
        )
        
        # Pending attendance depends on timetable data, so run it after
        attendance_pending = await get_pending_attendance(timetable_data)
        
        # Construct Pending Actions List
        pending_actions = []
        if attendance_pending:
            pending_actions.append({
                "type": "ATTENDANCE",
                "count": len(attendance_pending),
                "label": "Mark Attendance",
                "items": attendance_pending
            })
        
        pending_actions.extend(assignments_pending)
        pending_actions.extend(parent_messages)

        return {
            "greeting": f"Good {'Morning' if timezone.now().hour < 12 else 'Afternoon'}, {user.first_name}",
            "date": today,
            "timetable": timetable_data,
            "pending_actions": pending_actions,
            "urgent_alerts": alerts
        }

    @staticmethod
    async def get_student_dashboard_data(user):
        """
        Aggregates data for the Student Dashboard.
        """
        today = date.today()

        @sync_to_async
        def get_student_and_enrollment():
            try:
                student = Student.objects.get(user=user)
                enrollment = StudentEnrollment.objects.filter(
                    student=student,
                    is_active=True,
                    academic_year__is_current=True,
                ).select_related('section', 'section__class_instance', 'academic_year').first()
                return student, enrollment
            except Student.DoesNotExist:
                return None, None

        student, enrollment = await get_student_and_enrollment()
        if not student or not enrollment:
            return {
                "attendance_percentage": 0,
                "upcoming_exams": [],
                "homework_due": [],
            }

        @sync_to_async
        def get_attendance_percentage():
            academic_year = enrollment.academic_year
            total = StudentAttendance.objects.filter(
                student=student,
                academic_year=academic_year,
            ).count()
            if total == 0:
                return 0.0
            present = StudentAttendance.objects.filter(
                student=student,
                academic_year=academic_year,
                status__in=['PRESENT', 'LATE'],
            ).count()
            return round((present / total) * 100, 1)

        @sync_to_async
        def get_upcoming_exams():
            return list(
                ExamSchedule.objects.filter(
                    section=enrollment.section,
                    exam_date__gte=today,
                ).select_related('subject', 'examination').order_by('exam_date')[:5].values(
                    'id', 'subject__name', 'exam_date',
                    'start_time', 'end_time', 'max_marks',
                    'examination__name',
                )
            )

        @sync_to_async
        def get_homework_due():
            return list(
                Assignment.objects.filter(
                    section=enrollment.section,
                    status='PUBLISHED',
                    due_date__gte=timezone.now(),
                ).exclude(
                    submissions__student=student,
                    submissions__status__in=['SUBMITTED', 'GRADED'],
                ).order_by('due_date')[:5].values(
                    'id', 'title', 'subject__name', 'due_date', 'max_marks',
                )
            )

        attendance_pct, exams, homework = await asyncio.gather(
            get_attendance_percentage(),
            get_upcoming_exams(),
            get_homework_due(),
        )

        return {
            "student_name": student.first_name,
            "class_name": f"{enrollment.section.class_instance.name} - {enrollment.section.name}",
            "attendance_percentage": attendance_pct,
            "upcoming_exams": exams,
            "homework_due": homework,
        }

    @staticmethod
    async def get_parent_dashboard_data(user):
        """
        Aggregates data for Parent Dashboard.
        Returns summary data for each child linked to this parent.
        """
        today = date.today()

        @sync_to_async
        def get_children_data():
            links = StudentParent.objects.filter(
                parent=user
            ).select_related('student').all()

            children_summary = []
            for link in links:
                student = link.student
                enrollment = StudentEnrollment.objects.filter(
                    student=student,
                    is_active=True,
                    academic_year__is_current=True,
                ).select_related('section', 'section__class_instance', 'academic_year').first()

                child_data = {
                    "student_id": str(student.id),
                    "name": student.first_name + (" " + student.last_name if student.last_name else ""),
                    "relation": link.relation,
                    "class_name": None,
                    "attendance_percentage": 0,
                    "pending_fees": 0,
                    "homework_pending": 0,
                }

                if enrollment:
                    child_data["class_name"] = f"{enrollment.section.class_instance.name} - {enrollment.section.name}"

                    # Attendance
                    total = StudentAttendance.objects.filter(
                        student=student,
                        academic_year=enrollment.academic_year,
                    ).count()
                    if total > 0:
                        present = StudentAttendance.objects.filter(
                            student=student,
                            academic_year=enrollment.academic_year,
                            status__in=['PRESENT', 'LATE'],
                        ).count()
                        child_data["attendance_percentage"] = round((present / total) * 100, 1)

                    # Pending fees
                    from apps.finance.models import StudentFee
                    pending = StudentFee.objects.filter(
                        student=student,
                        status='PENDING',
                    ).aggregate(total=Sum('balance'))['total'] or 0
                    child_data["pending_fees"] = float(pending)

                    # Pending homework
                    child_data["homework_pending"] = Assignment.objects.filter(
                        section=enrollment.section,
                        status='PUBLISHED',
                        due_date__gte=timezone.now(),
                    ).exclude(
                        submissions__student=student,
                        submissions__status__in=['SUBMITTED', 'GRADED'],
                    ).count()

                children_summary.append(child_data)
            return children_summary

        children = await get_children_data()

        return {
            "greeting": f"Hello, {user.first_name}",
            "children_summary": children,
        }
