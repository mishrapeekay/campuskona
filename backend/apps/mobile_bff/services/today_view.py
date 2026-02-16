"""
Today View Aggregation Service - Enhanced
Aggregates all student/parent "Today" data in a single optimized call
"""

import asyncio
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional
from django.db.models import Q, Prefetch, F, Count, Sum
from django.utils import timezone
from asgiref.sync import sync_to_async
from apps.students.models import Student, StudentNote
from apps.academics.models import AcademicYear, Section, StudentEnrollment
from apps.timetable.models import ClassTimetable, TimeSlot, TimetableSubstitution
from apps.assignments.models import Assignment, AssignmentSubmission
from apps.finance.models import StudentFee
from apps.attendance.models import StudentAttendance
from apps.examinations.models import ExamSchedule


class TodayViewService:
    """
    Service to aggregate all 'Today' data for a student/parent view
    """
    
    def __init__(self, student_id: str, user=None):
        self.student_id = student_id
        self.user = user
        self.today = timezone.now().date()
        self.current_day = self.today.strftime('%A').upper()
        
    async def get_today_data(self) -> Dict[str, Any]:
        """
        Main aggregation method - fetches all today data in parallel
        """
        # Run all data fetches in parallel
        results = await asyncio.gather(
            self._get_student_info(),
            self._get_timetable_data(),
            self._get_homework_data(),
            self._get_fees_due(),
            self._get_teacher_remarks(),
            self._get_attendance_status(),
            self._get_exam_data(),
            return_exceptions=True
        )
        
        # Unpack results (handle exceptions gracefully)
        student_info = results[0] if not isinstance(results[0], Exception) else {}
        timetable = results[1] if not isinstance(results[1], Exception) else {}
        homework = results[2] if not isinstance(results[2], Exception) else []
        fees = results[3] if not isinstance(results[3], Exception) else {}
        remarks = results[4] if not isinstance(results[4], Exception) else []
        attendance = results[5] if not isinstance(results[5], Exception) else {}
        exams = results[6] if not isinstance(results[6], Exception) else []
        
        return {
            'date': self.today.isoformat(),
            'day_of_week': self.current_day,
            'student': student_info,
            'timetable': timetable,
            'homework': homework,
            'fees_due': fees,
            'teacher_remarks': remarks,
            'attendance': attendance,
            'exams': exams,
            'generated_at': timezone.now().isoformat(),
        }
    
    @sync_to_async
    def _get_student_info(self) -> Dict[str, Any]:
        """Get basic student information"""
        try:
            student = Student.objects.select_related(
                'current_class',
                'current_section'
            ).get(id=self.student_id, is_deleted=False)
            
            # Get current enrollment
            enrollment = StudentEnrollment.objects.filter(
                student=student,
                is_active=True
            ).select_related('section__class_instance', 'academic_year').first()
            
            return {
                'id': str(student.id),
                'name': student.get_full_name(),
                'admission_number': student.admission_number,
                'class': enrollment.section.class_instance.display_name if enrollment else None,
                'section': enrollment.section.name if enrollment else None,
                'roll_number': enrollment.roll_number if enrollment else None,
            }
        except Student.DoesNotExist:
            return {}
    
    @sync_to_async
    def _get_timetable_data(self) -> Dict[str, Any]:
        """Get today's timetable or holiday information"""
        try:
            # Get student's current section
            enrollment = StudentEnrollment.objects.filter(
                student_id=self.student_id,
                is_active=True
            ).select_related('section', 'academic_year').first()
            
            if not enrollment:
                return {'is_holiday': False, 'periods': []}
            
            # Use current day from self.current_day
            is_weekend = self.today.weekday() in [5, 6]  # Saturday, Sunday
            
            # (Note: In a real system, you'd check a Holiday table here)
            if is_weekend:
                return {
                    'is_holiday': True,
                    'holiday_name': 'Weekend',
                    'periods': []
                }
            
            # Get timetable for today
            timetable_entries = ClassTimetable.objects.filter(
                academic_year=enrollment.academic_year,
                section=enrollment.section,
                day_of_week=self.current_day,
                is_active=True
            ).select_related(
                'time_slot',
                'subject',
                'teacher__user'
            ).order_by('time_slot__order')
            
            # Check for substitutions
            substitutions = TimetableSubstitution.objects.filter(
                date=self.today,
                status='APPROVED',
                original_entry__in=timetable_entries
            ).select_related('substitute_teacher__user')
            
            # Create substitution map
            sub_map = {sub.original_entry_id: sub for sub in substitutions}
            
            periods = []
            for entry in timetable_entries:
                substitution = sub_map.get(entry.id)
                teacher = substitution.substitute_teacher if substitution else entry.teacher
                
                periods.append({
                    'period_number': entry.time_slot.order if entry.time_slot else 0,
                    'time_slot': {
                        'start_time': entry.time_slot.start_time.strftime('%H:%M'),
                        'end_time': entry.time_slot.end_time.strftime('%H:%M'),
                        'duration_minutes': entry.time_slot.duration_minutes,
                        'slot_type': entry.time_slot.slot_type,
                        'name': entry.time_slot.name,
                    } if entry.time_slot else None,
                    'subject': {
                        'id': str(entry.subject.id) if entry.subject else None,
                        'name': entry.subject.name if entry.subject else 'Break',
                        'code': entry.subject.code if entry.subject else None,
                    } if entry.subject else None,
                    'teacher': {
                        'id': str(teacher.id) if teacher else None,
                        'name': teacher.user.get_full_name() if teacher and teacher.user else None,
                    } if teacher else None,
                    'room_number': entry.room_number,
                    'is_substitution': substitution is not None,
                    'substitution_reason': substitution.reason if substitution else None,
                })
            
            return {
                'is_holiday': False,
                'periods': periods,
                'total_periods': len(periods),
            }
            
        except Exception as e:
            return {'is_holiday': False, 'periods': [], 'error': str(e)}
    
    @sync_to_async
    def _get_homework_data(self) -> List[Dict[str, Any]]:
        """Get pending and upcoming homework/assignments"""
        try:
            enrollment = StudentEnrollment.objects.filter(
                student_id=self.student_id,
                is_active=True
            ).select_related('section', 'academic_year').first()
            
            if not enrollment:
                return []
            
            upcoming_date = self.today + timedelta(days=7)
            
            assignments = Assignment.objects.filter(
                section=enrollment.section,
                academic_year=enrollment.academic_year,
                status='PUBLISHED',
                due_date__gte=timezone.now(),
                due_date__date__lte=upcoming_date,
                is_deleted=False
            ).select_related('subject', 'teacher__user').order_by('due_date')[:10]
            
            submissions = AssignmentSubmission.objects.filter(
                student_id=self.student_id,
                assignment__in=assignments
            ).values_list('assignment_id', 'status')
            
            submission_map = {str(assignment_id): status for assignment_id, status in submissions}
            
            homework_list = []
            for assignment in assignments:
                submission_status = submission_map.get(str(assignment.id), 'PENDING')
                is_due_today = assignment.due_date.date() == self.today
                is_overdue = assignment.due_date < timezone.now() and submission_status == 'PENDING'
                
                homework_list.append({
                    'id': str(assignment.id),
                    'title': assignment.title,
                    'subject': {
                        'id': str(assignment.subject.id),
                        'name': assignment.subject.name,
                    },
                    'teacher': {
                        'name': assignment.teacher.user.get_full_name() if assignment.teacher and assignment.teacher.user else None,
                    },
                    'due_date': assignment.due_date.isoformat(),
                    'due_date_display': assignment.due_date.strftime('%d %b, %I:%M %p'),
                    'submission_status': submission_status,
                    'is_due_today': is_due_today,
                    'is_overdue': is_overdue,
                    'priority': 'high' if is_due_today or is_overdue else 'normal',
                })
            
            return homework_list
        except Exception:
            return []
    
    @sync_to_async
    def _get_fees_due(self) -> Dict[str, Any]:
        """Get fees due information"""
        try:
            fees = StudentFee.objects.filter(
                student_id=self.student_id,
                status__in=['PENDING', 'PARTIAL', 'OVERDUE']
            ).select_related('fee_structure__fee_category').order_by('due_date')
            
            total_due = 0
            overdue_amount = 0
            due_today_amount = 0
            upcoming_fees = []
            
            for fee in fees:
                # Use total_amount - paid_amount as balance if balance_amount() method not convenient in async
                balance = float(fee.amount - fee.paid_amount)
                total_due += balance
                
                is_overdue = fee.due_date < self.today if fee.due_date else False
                is_due_today = fee.due_date == self.today if fee.due_date else False
                
                if is_overdue:
                    overdue_amount += balance
                elif is_due_today:
                    due_today_amount += balance
                
                if fee.due_date and fee.due_date <= self.today + timedelta(days=30):
                    upcoming_fees.append({
                        'id': str(fee.id),
                        'category': fee.fee_structure.fee_category.name if fee.fee_structure else "Fee",
                        'balance': balance,
                        'due_date': fee.due_date.isoformat(),
                        'due_date_display': fee.due_date.strftime('%d %b'),
                        'status': fee.status,
                        'is_overdue': is_overdue,
                    })
            
            return {
                'total_due': total_due,
                'overdue_amount': overdue_amount,
                'due_today_amount': due_today_amount,
                'upcoming_fees': upcoming_fees[:5],
                'has_overdue': overdue_amount > 0,
            }
        except Exception:
            return {'total_due': 0, 'overdue_amount': 0, 'upcoming_fees': []}
    
    @sync_to_async
    def _get_teacher_remarks(self) -> List[Dict[str, Any]]:
        """Get recent teacher remarks"""
        try:
            week_ago = self.today - timedelta(days=7)
            notes = StudentNote.objects.filter(
                student_id=self.student_id,
                created_at__date__gte=week_ago,
                is_confidential=False
            ).select_related('created_by').order_by('-created_at')[:5]
            
            return [{
                'id': str(note.id),
                'type': note.note_type,
                'title': note.title,
                'content': note.content,
                'created_at': note.created_at.isoformat(),
                'created_at_display': note.created_at.strftime('%d %b'),
                'created_by': note.created_by.get_full_name() if note.created_by else 'Staff',
                'is_important': note.is_important,
            } for note in notes]
        except Exception:
            return []
    
    @sync_to_async
    def _get_attendance_status(self) -> Dict[str, Any]:
        """Get today's attendance status and term summary"""
        try:
            # 1. Today's status
            attendance = StudentAttendance.objects.filter(
                student_id=self.student_id,
                date=self.today
            ).first()
            
            # 2. Term summary
            enrollment = StudentEnrollment.objects.filter(
                student_id=self.student_id, is_active=True
            ).first()
            
            summary = {
                'percentage': 0,
                'present_days': 0,
                'total_days': 0
            }
            
            if enrollment:
                att_stats = StudentAttendance.objects.filter(
                    student_id=self.student_id,
                    academic_year=enrollment.academic_year
                ).aggregate(
                    total=Count('id'),
                    present=Count('id', filter=Q(status='PRESENT'))
                )
                
                total = att_stats['total'] or 0
                present = att_stats['present'] or 0
                summary = {
                    'percentage': round((present / total * 100), 1) if total > 0 else 0,
                    'present_days': present,
                    'total_days': total
                }
            
            return {
                'marked': attendance is not None,
                'status': attendance.status if attendance else None,
                'remarks': attendance.remarks if attendance else "",
                'summary': summary
            }
        except Exception:
            return {'marked': False, 'status': None, 'summary': {'percentage': 0}}

    @sync_to_async
    def _get_exam_data(self) -> List[Dict[str, Any]]:
        """Get upcoming exams for the student's section"""
        try:
            enrollment = StudentEnrollment.objects.filter(
                student_id=self.student_id, is_active=True
            ).select_related('section').first()
            
            if not enrollment:
                return []
                
            upcoming_exams = ExamSchedule.objects.filter(
                section=enrollment.section,
                exam_date__gte=self.today,
                exam_date__lte=self.today + timedelta(days=14)
            ).select_related('subject', 'examination').order_by('exam_date', 'start_time')[:5]
            
            return [{
                'id': str(exam.id),
                'exam_name': exam.examination.name,
                'subject': exam.subject.name,
                'date': exam.exam_date.isoformat(),
                'date_display': exam.exam_date.strftime('%d %b'),
                'start_time': exam.start_time.strftime('%I:%M %p'),
                'max_marks': float(exam.max_marks),
            } for exam in upcoming_exams]
        except Exception:
            return []


class ParentTodayViewService:
    """
    Service for parent's today view (multiple children)
    """
    
    def __init__(self, parent_user_id: str):
        self.parent_user_id = parent_user_id
    
    async def get_today_data(self) -> Dict[str, Any]:
        """Get today data for all children of a parent"""
        # Get all children
        children = await self._get_children()
        
        # Fetch today data for each child in parallel
        tasks = [
            TodayViewService(child['id']).get_today_data()
            for child in children
        ]
        
        children_data = await asyncio.gather(*tasks, return_exceptions=True)
        
        valid_children_data = []
        for i, data in enumerate(children_data):
            if isinstance(data, Exception):
                # Fallback basic info if service fails
                valid_children_data.append({
                    'student': children[i],
                    'error': True
                })
            else:
                valid_children_data.append(data)
        
        return {
            'date': timezone.now().date().isoformat(),
            'children': valid_children_data,
            'children_count': len(valid_children_data),
            'generated_at': timezone.now().isoformat(),
        }
    
    @sync_to_async
    def _get_children(self) -> List[Dict[str, Any]]:
        """Get list of children for this parent"""
        from apps.students.models import StudentParent
        
        student_parents = StudentParent.objects.filter(
            parent_id=self.parent_user_id
        ).select_related('student').order_by('-is_primary_contact')
        
        return [
            {
                'id': str(sp.student.id),
                'name': sp.student.get_full_name(),
                'relation': sp.relation,
            }
            for sp in student_parents
        ]
