"""
Report Card Generator Service.

Collects student exam data and generates structured report card JSON.
Supports single-exam and cumulative (multi-exam) report cards.
PDF rendering is handled separately by report_card_pdf.py.
"""

import logging
from decimal import Decimal
from django.db.models import Avg, Sum, Max, Min, Count
from django.utils import timezone

logger = logging.getLogger(__name__)


class ReportCardGenerator:
    """
    Generates report card data (JSON) for a student.
    """

    def __init__(self, student, academic_year, template=None):
        self.student = student
        self.academic_year = academic_year
        self.template = template

    def generate_single_exam(self, exam_result):
        """
        Generate report card data for a single examination result.

        Returns:
            dict: Complete report card data structure.
        """
        from apps.examinations.models import StudentMark

        marks = StudentMark.objects.filter(
            exam_schedule__examination=exam_result.examination,
            student=self.student,
        ).select_related(
            'exam_schedule__subject',
            'exam_schedule__examination__grade_scale',
        ).order_by('exam_schedule__subject__name')

        subjects = []
        for mark in marks:
            subjects.append({
                'subject_name': mark.exam_schedule.subject.name,
                'subject_code': mark.exam_schedule.subject.code,
                'subject_type': mark.exam_schedule.subject.subject_type,
                'max_marks': float(mark.exam_schedule.max_marks),
                'min_passing_marks': float(mark.exam_schedule.min_passing_marks),
                'marks_obtained': float(mark.marks_obtained or 0),
                'percentage': float(mark.percentage or 0),
                'grade': mark.grade,
                'grade_point': float(mark.grade_point or 0),
                'is_passed': mark.is_passed,
                'status': mark.status,
            })

        # Attendance data
        attendance_data = self._get_attendance_data()

        # Class statistics for ranking context
        class_stats = self._get_class_statistics(exam_result)

        enrollment = self._get_enrollment()

        data = {
            'student': self._student_info(enrollment),
            'school': self._school_info(),
            'examination': {
                'name': exam_result.examination.name,
                'type': exam_result.examination.exam_type.name,
                'academic_year': self.academic_year.name,
                'start_date': str(exam_result.examination.start_date),
                'end_date': str(exam_result.examination.end_date),
            },
            'subjects': subjects,
            'overall': {
                'total_marks_obtained': float(exam_result.total_marks_obtained),
                'total_max_marks': float(exam_result.total_max_marks),
                'percentage': float(exam_result.percentage),
                'cgpa': float(exam_result.cgpa or 0),
                'overall_grade': exam_result.overall_grade,
                'rank': exam_result.rank,
                'total_students_in_class': class_stats.get('total_students', 0),
                'is_passed': exam_result.is_passed,
                'subjects_passed': exam_result.subjects_passed,
                'subjects_failed': exam_result.subjects_failed,
            },
            'attendance': attendance_data,
            'class_statistics': class_stats,
            'grade_scale': self._get_grade_scale(exam_result.examination.grade_scale),
            'generated_at': timezone.now().isoformat(),
        }

        return data

    def generate_cumulative(self, examinations):
        """
        Generate cumulative report card across multiple examinations.

        Args:
            examinations: QuerySet of Examination objects to include.

        Returns:
            dict: Cumulative report card data.
        """
        from apps.examinations.models import ExamResult, StudentMark

        exam_results = ExamResult.objects.filter(
            examination__in=examinations,
            student=self.student,
        ).select_related('examination__exam_type', 'examination__grade_scale')

        if not exam_results.exists():
            return None

        # Build per-exam breakdown
        exam_breakdowns = []
        subject_aggregate = {}

        for result in exam_results:
            marks = StudentMark.objects.filter(
                exam_schedule__examination=result.examination,
                student=self.student,
                status='PRESENT',
            ).select_related('exam_schedule__subject')

            exam_data = {
                'exam_name': result.examination.name,
                'exam_type': result.examination.exam_type.name,
                'weightage': float(result.examination.exam_type.weightage),
                'percentage': float(result.percentage),
                'grade': result.overall_grade,
                'rank': result.rank,
                'subjects': [],
            }

            for mark in marks:
                subj_name = mark.exam_schedule.subject.name
                subj_code = mark.exam_schedule.subject.code
                exam_data['subjects'].append({
                    'subject_name': subj_name,
                    'marks_obtained': float(mark.marks_obtained or 0),
                    'max_marks': float(mark.exam_schedule.max_marks),
                    'percentage': float(mark.percentage or 0),
                    'grade': mark.grade,
                })

                # Aggregate for weighted average
                if subj_code not in subject_aggregate:
                    subject_aggregate[subj_code] = {
                        'subject_name': subj_name,
                        'subject_code': subj_code,
                        'exams': [],
                    }
                subject_aggregate[subj_code]['exams'].append({
                    'exam_name': result.examination.name,
                    'weightage': float(result.examination.exam_type.weightage),
                    'marks_obtained': float(mark.marks_obtained or 0),
                    'max_marks': float(mark.exam_schedule.max_marks),
                    'percentage': float(mark.percentage or 0),
                    'grade': mark.grade,
                })

            exam_breakdowns.append(exam_data)

        # Calculate weighted averages per subject
        cumulative_subjects = []
        for code, agg in subject_aggregate.items():
            total_weight = sum(e['weightage'] for e in agg['exams'])
            if total_weight > 0:
                weighted_pct = sum(
                    e['percentage'] * e['weightage'] for e in agg['exams']
                ) / total_weight
            else:
                weighted_pct = 0

            cumulative_subjects.append({
                'subject_name': agg['subject_name'],
                'subject_code': agg['subject_code'],
                'weighted_percentage': round(weighted_pct, 2),
                'exam_count': len(agg['exams']),
                'exams': agg['exams'],
            })

        # Overall cumulative
        overall_weighted_pct = 0
        if cumulative_subjects:
            overall_weighted_pct = sum(
                s['weighted_percentage'] for s in cumulative_subjects
            ) / len(cumulative_subjects)

        enrollment = self._get_enrollment()

        data = {
            'student': self._student_info(enrollment),
            'school': self._school_info(),
            'academic_year': self.academic_year.name,
            'is_cumulative': True,
            'exam_breakdowns': exam_breakdowns,
            'cumulative_subjects': cumulative_subjects,
            'cumulative_overall': {
                'weighted_percentage': round(overall_weighted_pct, 2),
                'total_exams': len(exam_breakdowns),
            },
            'attendance': self._get_attendance_data(),
            'grade_scale': self._get_grade_scale(
                exam_results.first().examination.grade_scale
            ) if exam_results.exists() else [],
            'generated_at': timezone.now().isoformat(),
        }

        return data

    def _student_info(self, enrollment=None):
        """Build student info dict."""
        info = {
            'name': self.student.get_full_name(),
            'admission_number': self.student.admission_number,
            'date_of_birth': str(self.student.date_of_birth),
            'gender': self.student.get_gender_display(),
            'father_name': self.student.father_name,
            'mother_name': self.student.mother_name,
            'photo_url': self.student.photo.url if self.student.photo else None,
        }
        if enrollment:
            info['class'] = enrollment.section.class_instance.display_name
            info['section'] = enrollment.section.name
            info['roll_number'] = enrollment.roll_number
        return info

    def _school_info(self):
        """Build school info from tenant."""
        from django.db import connection
        try:
            from apps.tenants.models import School
            school = School.objects.filter(
                schema_name=connection.schema_name
            ).first()
            if school:
                return {
                    'name': school.name,
                    'address': getattr(school, 'address', ''),
                    'phone': getattr(school, 'phone_number', ''),
                    'email': getattr(school, 'email', ''),
                }
        except Exception:
            pass
        return {'name': '', 'address': '', 'phone': '', 'email': ''}

    def _get_enrollment(self):
        """Get current enrollment for the student."""
        from apps.academics.models import StudentEnrollment
        return StudentEnrollment.objects.filter(
            student=self.student,
            academic_year=self.academic_year,
            is_active=True,
            is_deleted=False,
        ).select_related(
            'section__class_instance'
        ).first()

    def _get_attendance_data(self):
        """Get attendance summary for the academic year."""
        try:
            from apps.attendance.models import AttendanceSummary
            summaries = AttendanceSummary.objects.filter(
                student=self.student,
                academic_year=self.academic_year,
            )
            if not summaries.exists():
                return None

            totals = summaries.aggregate(
                total_days=Sum('total_days'),
                present_days=Sum('present_days'),
                absent_days=Sum('absent_days'),
                late_days=Sum('late_days'),
            )
            total = totals['total_days'] or 0
            present = totals['present_days'] or 0
            return {
                'total_working_days': total,
                'days_present': present,
                'days_absent': totals['absent_days'] or 0,
                'days_late': totals['late_days'] or 0,
                'attendance_percentage': round(
                    (present / total * 100) if total > 0 else 0, 2
                ),
            }
        except Exception:
            return None

    def _get_class_statistics(self, exam_result):
        """Get class-level statistics for context."""
        from apps.examinations.models import ExamResult
        class_results = ExamResult.objects.filter(
            examination=exam_result.examination,
            class_obj=exam_result.class_obj,
            section=exam_result.section,
        )
        stats = class_results.aggregate(
            total_students=Count('id'),
            avg_percentage=Avg('percentage'),
            highest_percentage=Max('percentage'),
            lowest_percentage=Min('percentage'),
        )
        return {
            'total_students': stats['total_students'] or 0,
            'class_average': round(float(stats['avg_percentage'] or 0), 2),
            'highest_percentage': round(float(stats['highest_percentage'] or 0), 2),
            'lowest_percentage': round(float(stats['lowest_percentage'] or 0), 2),
        }

    def _get_grade_scale(self, grade_scale):
        """Return grade scale as list of dicts for display."""
        if not grade_scale:
            return []
        return [
            {
                'grade': g.grade,
                'min_percentage': float(g.min_percentage),
                'max_percentage': float(g.max_percentage),
                'grade_point': float(g.grade_point),
                'description': g.description,
            }
            for g in grade_scale.grades.all().order_by('-min_percentage')
        ]
