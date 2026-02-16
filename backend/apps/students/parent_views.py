"""
Parent Engagement Portal API views.

Provides a comprehensive parent dashboard that aggregates data from
attendance, examinations, finance, communication, and timetable modules.
Feature-gated: parent_portal (STANDARD tier).
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q, Sum, Avg, Count
from django.utils import timezone
from datetime import timedelta

from apps.authentication.permissions import HasFeature
from .models import StudentParent, Student


class ParentDashboardView(APIView):
    """
    GET /api/v1/students/parent-portal/dashboard/

    Returns aggregated dashboard data for a parent's children.
    Query param: ?student_id=X to filter to a specific child.
    """
    permission_classes = [IsAuthenticated, HasFeature]
    required_feature = 'parent_portal'

    def get(self, request):
        user = request.user
        if user.user_type != 'PARENT':
            return Response(
                {'error': 'This endpoint is for parent accounts only.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get linked students
        parent_links = StudentParent.objects.filter(
            parent=user, is_deleted=False
        ).select_related('student__user')

        if not parent_links.exists():
            return Response({
                'children': [],
                'message': 'No children linked to your account.',
            })

        # Optional filter to a specific child
        student_id = request.query_params.get('student_id')
        if student_id:
            parent_links = parent_links.filter(student_id=student_id)

        children_data = []
        for link in parent_links:
            student = link.student
            child_data = {
                'student_id': student.id,
                'name': student.get_full_name(),
                'admission_number': student.admission_number,
                'photo_url': student.photo.url if student.photo else None,
                'relation': link.get_relation_display(),
                'enrollment': self._get_enrollment(student),
                'attendance': self._get_attendance_summary(student),
                'recent_exam_results': self._get_recent_results(student),
                'fee_summary': self._get_fee_summary(student),
                'latest_note': self._get_latest_note(student),
                'upcoming_events': [],
                'recent_notices': [],
            }
            children_data.append(child_data)

        # Fetch shared data (notices, events)
        notices = self._get_recent_notices()
        events = self._get_upcoming_events()

        return Response({
            'children': children_data,
            'notices': notices,
            'events': events,
        })

    def _get_enrollment(self, student):
        try:
            from apps.academics.models import StudentEnrollment
            enrollment = StudentEnrollment.objects.filter(
                student=student, is_active=True, is_deleted=False
            ).select_related('section__class_instance', 'academic_year').first()
            if enrollment:
                return {
                    'class': enrollment.section.class_instance.display_name,
                    'section': enrollment.section.name,
                    'roll_number': enrollment.roll_number,
                    'academic_year': enrollment.academic_year.name,
                }
        except Exception:
            pass
        return None

    def _get_attendance_summary(self, student):
        try:
            from apps.attendance.models import AttendanceSummary, StudentAttendance
            from apps.academics.models import AcademicYear

            current_year = AcademicYear.objects.filter(is_current=True).first()
            if not current_year:
                return None

            # Aggregated summary
            summaries = AttendanceSummary.objects.filter(
                student=student, academic_year=current_year
            )
            totals = summaries.aggregate(
                total_days=Sum('total_days'),
                present_days=Sum('present_days'),
                absent_days=Sum('absent_days'),
                late_days=Sum('late_days'),
            )
            total = totals['total_days'] or 0
            present = totals['present_days'] or 0

            # Last 7 days detail
            week_ago = timezone.now().date() - timedelta(days=7)
            recent = StudentAttendance.objects.filter(
                student=student, date__gte=week_ago
            ).values('date', 'status').order_by('-date')[:7]

            return {
                'total_working_days': total,
                'days_present': present,
                'days_absent': totals['absent_days'] or 0,
                'days_late': totals['late_days'] or 0,
                'attendance_percentage': round(
                    (present / total * 100) if total > 0 else 0, 2
                ),
                'recent_7_days': list(recent),
            }
        except Exception:
            return None

    def _get_recent_results(self, student):
        try:
            from apps.examinations.models import ExamResult
            results = ExamResult.objects.filter(
                student=student,
                examination__is_published=True,
            ).select_related('examination').order_by('-examination__start_date')[:5]

            return [{
                'examination_name': r.examination.name,
                'percentage': float(r.percentage),
                'grade': r.overall_grade,
                'rank': r.rank,
                'is_passed': r.is_passed,
                'subjects_passed': r.subjects_passed,
                'subjects_failed': r.subjects_failed,
            } for r in results]
        except Exception:
            return []

    def _get_fee_summary(self, student):
        try:
            from apps.finance.models import StudentFee, Payment

            fees = StudentFee.objects.filter(student=student)
            total_due = fees.aggregate(total=Sum('final_amount'))['total'] or 0
            total_paid = fees.aggregate(total=Sum('paid_amount'))['total'] or 0
            outstanding = float(total_due) - float(total_paid)

            overdue_count = fees.filter(status='OVERDUE').count()
            pending_count = fees.filter(status__in=['PENDING', 'PARTIAL']).count()

            recent_payments = Payment.objects.filter(
                student=student, status='COMPLETED'
            ).order_by('-payment_date')[:5]

            return {
                'total_fee': float(total_due),
                'total_paid': float(total_paid),
                'outstanding': round(outstanding, 2),
                'overdue_count': overdue_count,
                'pending_count': pending_count,
                'recent_payments': [{
                    'amount': float(p.amount),
                    'date': str(p.payment_date),
                    'method': p.get_payment_method_display(),
                    'receipt': p.receipt_number,
                } for p in recent_payments],
            }
        except Exception:
            return None

    def _get_recent_notices(self):
        try:
            from apps.communication.models import Notice
            notices = Notice.objects.filter(
                is_published=True,
                target_audience__in=['ALL', 'PARENTS'],
            ).order_by('-created_at')[:5]
            return [{
                'id': n.id,
                'title': n.title,
                'priority': n.priority,
                'date': str(n.created_at.date()),
            } for n in notices]
        except Exception:
            return []

    def _get_upcoming_events(self):
        try:
            from apps.communication.models import Event
            today = timezone.now().date()
            events = Event.objects.filter(
                start_date__gte=today, is_public=True
            ).order_by('start_date')[:5]
            return [{
                'id': e.id,
                'title': e.title,
                'event_type': e.event_type,
                'start_date': str(e.start_date),
                'end_date': str(e.end_date) if e.end_date else None,
                'location': e.location,
            } for e in events]
        except Exception:
            return []

    def _get_latest_note(self, student):
        try:
            from .models import StudentNote
            note = StudentNote.objects.filter(
                student=student, is_private=False, is_deleted=False
            ).select_related('created_by').order_by('-created_at').first()
            if note:
                return {
                    'content': note.content,
                    'created_at': str(note.created_at.date()),
                    'teacher_name': note.created_by.get_full_name(),
                    'note_type': note.note_type,
                }
        except Exception:
            pass
        return None


class ParentChildAttendanceView(APIView):
    """
    GET /api/v1/students/parent-portal/attendance/?student_id=X&month=1&year=2025

    Detailed attendance for a specific child.
    """
    permission_classes = [IsAuthenticated, HasFeature]
    required_feature = 'parent_portal'

    def get(self, request):
        user = request.user
        if user.user_type != 'PARENT':
            return Response({'error': 'Parent account required.'}, status=403)

        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response({'error': 'student_id is required.'}, status=400)

        # Verify parent has access to this student
        if not StudentParent.objects.filter(
            parent=user, student_id=student_id, is_deleted=False
        ).exists():
            return Response({'error': 'Not authorized for this student.'}, status=403)

        month = request.query_params.get('month')
        year = request.query_params.get('year')

        try:
            from apps.attendance.models import StudentAttendance
            qs = StudentAttendance.objects.filter(student_id=student_id)

            if month and year:
                qs = qs.filter(date__month=int(month), date__year=int(year))

            records = qs.order_by('-date').values(
                'date', 'status', 'check_in_time', 'check_out_time', 'remarks'
            )[:60]

            return Response({'attendance': list(records)})
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class ParentChildResultsView(APIView):
    """
    GET /api/v1/students/parent-portal/results/?student_id=X

    All exam results for a specific child with subject-wise details.
    """
    permission_classes = [IsAuthenticated, HasFeature]
    required_feature = 'parent_portal'

    def get(self, request):
        user = request.user
        if user.user_type != 'PARENT':
            return Response({'error': 'Parent account required.'}, status=403)

        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response({'error': 'student_id is required.'}, status=400)

        if not StudentParent.objects.filter(
            parent=user, student_id=student_id, is_deleted=False
        ).exists():
            return Response({'error': 'Not authorized for this student.'}, status=403)

        try:
            from apps.examinations.models import ExamResult, StudentMark

            results = ExamResult.objects.filter(
                student_id=student_id,
                examination__is_published=True,
            ).select_related(
                'examination__exam_type', 'class_obj', 'section'
            ).order_by('-examination__start_date')

            data = []
            for result in results:
                marks = StudentMark.objects.filter(
                    exam_schedule__examination=result.examination,
                    student_id=student_id,
                ).select_related('exam_schedule__subject').order_by('exam_schedule__subject__name')

                data.append({
                    'examination': {
                        'name': result.examination.name,
                        'type': result.examination.exam_type.name,
                        'start_date': str(result.examination.start_date),
                    },
                    'overall': {
                        'percentage': float(result.percentage),
                        'grade': result.overall_grade,
                        'rank': result.rank,
                        'cgpa': float(result.cgpa or 0),
                        'is_passed': result.is_passed,
                        'subjects_passed': result.subjects_passed,
                        'subjects_failed': result.subjects_failed,
                    },
                    'subjects': [{
                        'name': m.exam_schedule.subject.name,
                        'marks_obtained': float(m.marks_obtained or 0),
                        'max_marks': float(m.exam_schedule.max_marks),
                        'percentage': float(m.percentage or 0),
                        'grade': m.grade,
                        'is_passed': m.is_passed,
                    } for m in marks],
                })

            return Response({'results': data})
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class ParentChildFeesView(APIView):
    """
    GET /api/v1/students/parent-portal/fees/?student_id=X

    Fee details for a specific child.
    """
    permission_classes = [IsAuthenticated, HasFeature]
    required_feature = 'parent_portal'

    def get(self, request):
        user = request.user
        if user.user_type != 'PARENT':
            return Response({'error': 'Parent account required.'}, status=403)

        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response({'error': 'student_id is required.'}, status=400)

        if not StudentParent.objects.filter(
            parent=user, student_id=student_id, is_deleted=False
        ).exists():
            return Response({'error': 'Not authorized for this student.'}, status=403)

        try:
            from apps.finance.models import StudentFee, Payment

            fees = StudentFee.objects.filter(
                student_id=student_id
            ).select_related('fee_structure__fee_category').order_by('-due_date')

            fee_data = [{
                'id': f.id,
                'category': f.fee_structure.fee_category.name,
                'amount': float(f.final_amount),
                'paid': float(f.paid_amount),
                'balance': float(f.final_amount) - float(f.paid_amount),
                'due_date': str(f.due_date),
                'status': f.status,
            } for f in fees]

            payments = Payment.objects.filter(
                student_id=student_id, status='COMPLETED'
            ).order_by('-payment_date')[:20]

            payment_data = [{
                'receipt': p.receipt_number,
                'amount': float(p.amount),
                'date': str(p.payment_date),
                'method': p.get_payment_method_display(),
            } for p in payments]

            return Response({
                'fees': fee_data,
                'payments': payment_data,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class ParentChildTimetableView(APIView):
    """
    GET /api/v1/students/parent-portal/timetable/?student_id=X

    Weekly timetable for a specific child.
    """
    permission_classes = [IsAuthenticated, HasFeature]
    required_feature = 'parent_portal'

    def get(self, request):
        user = request.user
        if user.user_type != 'PARENT':
            return Response({'error': 'Parent account required.'}, status=403)

        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response({'error': 'student_id is required.'}, status=400)

        if not StudentParent.objects.filter(
            parent=user, student_id=student_id, is_deleted=False
        ).exists():
            return Response({'error': 'Not authorized for this student.'}, status=403)

        try:
            from apps.academics.models import StudentEnrollment, AcademicYear
            from apps.timetable.models import ClassTimetable

            current_year = AcademicYear.objects.filter(is_current=True).first()
            if not current_year:
                return Response({'timetable': []})

            enrollment = StudentEnrollment.objects.filter(
                student_id=student_id,
                academic_year=current_year,
                is_active=True,
                is_deleted=False,
            ).select_related('section__class_instance').first()

            if not enrollment:
                return Response({'timetable': []})

            entries = ClassTimetable.objects.filter(
                academic_year=current_year,
                class_obj=enrollment.section.class_instance,
                section=enrollment.section,
                is_active=True,
            ).select_related('subject', 'teacher', 'time_slot').order_by(
                'day_of_week', 'time_slot__order'
            )

            timetable = {}
            for entry in entries:
                day = entry.day_of_week
                if day not in timetable:
                    timetable[day] = []
                timetable[day].append({
                    'period': entry.time_slot.name,
                    'time': f"{entry.time_slot.start_time.strftime('%H:%M')} - {entry.time_slot.end_time.strftime('%H:%M')}",
                    'subject': entry.subject.name if entry.subject else None,
                    'teacher': entry.teacher.get_full_name() if entry.teacher else None,
                    'room': entry.room_number,
                })

            return Response({'timetable': timetable})
        except Exception as e:
            return Response({'error': str(e)}, status=500)
