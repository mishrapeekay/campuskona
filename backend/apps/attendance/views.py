"""
Views and ViewSets for Attendance Management
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Count, Q, Avg, F
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from collections import defaultdict

from .models import (
    AttendancePeriod,
    StudentAttendance,
    StaffAttendance,
    StudentLeave,
    StaffLeave,
    Holiday,
    AttendanceSummary
)
from .serializers import (
    AttendancePeriodSerializer,
    StudentAttendanceSerializer,
    StudentAttendanceListSerializer,
    BulkAttendanceSerializer,
    StaffAttendanceSerializer,
    StaffAttendanceListSerializer,
    StudentLeaveSerializer,
    StudentLeaveApprovalSerializer,
    StaffLeaveSerializer,
    StaffLeaveApprovalSerializer,
    HolidaySerializer,
    AttendanceSummarySerializer,
    AttendanceReportSerializer,
    ClassAttendanceSerializer,
    StudentAttendanceStatsSerializer
)
from apps.students.models import Student
from apps.academics.models import Section, AcademicYear, StudentEnrollment


class AttendancePeriodViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing attendance periods/time slots
    """
    queryset = AttendancePeriod.objects.all()
    serializer_class = AttendancePeriodSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['period_type', 'is_active']
    search_fields = ['name']
    ordering_fields = ['order', 'start_time']
    ordering = ['order']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active periods"""
        periods = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(periods, many=True)
        return Response(serializer.data)


class StudentAttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for student attendance management
    """
    queryset = StudentAttendance.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'date', 'academic_year', 'period', 'biometric_verified']
    search_fields = ['student__first_name', 'student__last_name', 'student__admission_number']
    ordering_fields = ['date', 'student__first_name']
    ordering = ['-date']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return StudentAttendanceListSerializer
        return StudentAttendanceSerializer

    def get_queryset(self):
        """Optimize queryset with select_related and custom filtering"""
        queryset = self.queryset.select_related(
            'student',
            'period',
            'academic_year',
            'marked_by'
        )
        
        # Custom filtering for class and section
        class_id = self.request.query_params.get('class_id')
        section_id = self.request.query_params.get('section_id')
        
        if class_id or section_id:
            # Get students enrolled in the specified class/section
            from apps.academics.models import StudentEnrollment
            
            enrollment_filters = {'is_active': True}
            if class_id:
                enrollment_filters['section__class_instance_id'] = class_id
            if section_id:
                enrollment_filters['section_id'] = section_id
            
            student_ids = StudentEnrollment.objects.filter(
                **enrollment_filters
            ).values_list('student_id', flat=True)
            
            queryset = queryset.filter(student_id__in=student_ids)
        
        return queryset

    def perform_create(self, serializer):
        """Set marked_by to current user"""
        serializer.save(marked_by=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_bulk(self, request):
        """
        Mark attendance for multiple students at once
        
        Expected payload:
        {
            "class_id": 1,
            "section_id": 1,
            "date": "2025-12-24",
            "period_id": 1,  // optional
            "attendance_data": [
                {"student_id": 1, "status": "PRESENT", "check_in_time": "09:00"},
                {"student_id": 2, "status": "ABSENT"},
                ...
            ]
        }
        """
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        class_id = data['class_id']
        section_id = data['section_id']
        date = data['date']
        period_id = data.get('period_id')
        attendance_data = data['attendance_data']
        
        # Get academic year
        academic_year = AcademicYear.objects.filter(is_current=True).first()
        if not academic_year:
            return Response(
                {'error': 'No active academic year found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get section
        section = get_object_or_404(Section, id=section_id, class_instance_id=class_id)
        
        # Get period if provided
        period = None
        if period_id:
            period = get_object_or_404(AttendancePeriod, id=period_id)
        
        # Create or update attendance records
        created_count = 0
        updated_count = 0
        
        for record in attendance_data:
            student_id = record['student_id']
            attendance_status = record['status']
            check_in_time = record.get('check_in_time')
            check_out_time = record.get('check_out_time')
            remarks = record.get('remarks', '')
            
            # Get or create attendance
            attendance, created = StudentAttendance.objects.update_or_create(
                student_id=student_id,
                date=date,
                period=period,
                defaults={
                    'academic_year': academic_year,
                    'status': attendance_status,
                    'check_in_time': check_in_time,
                    'check_out_time': check_out_time,
                    'remarks': remarks,
                    'marked_by': request.user if request.user.is_authenticated else None
                }
            )
            
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        return Response({
            'message': 'Attendance marked successfully',
            'created': created_count,
            'updated': updated_count,
            'total': created_count + updated_count
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def class_attendance(self, request):
        """
        Get attendance for a specific class on a specific date
        
        Query params:
        - class_id: Class ID
        - section_id: Section ID
        - date: Date (YYYY-MM-DD)
        - period_id: Period ID (optional)
        """
        class_id = request.query_params.get('class_id')
        section_id = request.query_params.get('section_id')
        date_str = request.query_params.get('date')
        period_id = request.query_params.get('period_id')
        
        if not all([class_id, section_id, date_str]):
            return Response(
                {'error': 'class_id, section_id, and date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get section
        section = get_object_or_404(Section, id=section_id, class_instance_id=class_id)
        
        # Get active enrollments for the section
        # We use StudentEnrollment because it links Student to Section
        enrollments = StudentEnrollment.objects.filter(
            section_id=section_id,
            is_active=True,
            student__admission_status='ACTIVE'
        ).select_related('student').order_by('roll_number', 'student__first_name')
        
        if not enrollments.exists():
            return Response({
                'class_id': class_id,
                'section_id': section_id,
                'date': date,
                'total_students': 0,
                'students': []
            })
            
        # Get student IDs from enrollments
        student_ids = [e.student_id for e in enrollments]
        
        # Get attendance records
        attendance_filter = {
            'student_id__in': student_ids,
            'date': date
        }
        if period_id:
            attendance_filter['period_id'] = period_id
        
        attendance_records = StudentAttendance.objects.filter(
            **attendance_filter
        ).select_related('student')
        
        # Create a map of student_id to attendance
        attendance_map = {
            record.student_id: {
                'id': record.id,
                'status': record.status,
                'check_in_time': record.check_in_time,
                'check_out_time': record.check_out_time,
                'remarks': record.remarks
            }
            for record in attendance_records
        }
        
        # Build response with all students
        result = []
        for enrollment in enrollments:
            student = enrollment.student
            attendance = attendance_map.get(student.id)
            result.append({
                'student_id': student.id,
                'student_name': student.get_full_name(),
                'admission_number': student.admission_number,
                'roll_number': enrollment.roll_number,
                'attendance': attendance
            })
        
        return Response({
            'class_id': class_id,
            'section_id': section_id,
            'date': date,
            'total_students': len(result),
            'students': result
        })

    @action(detail=False, methods=['get'])
    def student_summary(self, request):
        """
        Get attendance summary for a specific student
        
        Query params:
        - student_id: Student ID
        - start_date: Start date (optional)
        - end_date: End date (optional)
        """
        student_id = request.query_params.get('student_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not student_id:
            return Response(
                {'error': 'student_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
             student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
             return Response(
                 {'error': 'Student not found'},
                 status=status.HTTP_404_NOT_FOUND
             )
        
        # Build filter
        filters = {'student_id': student_id}
        if start_date:
            filters['date__gte'] = start_date
        if end_date:
            filters['date__lte'] = end_date
        
        # Get attendance records
        attendance = StudentAttendance.objects.filter(**filters)
        
        # Calculate statistics
        total_days = attendance.count()
        present_days = attendance.filter(status__in=['PRESENT', 'LATE']).count()
        absent_days = attendance.filter(status='ABSENT').count()
        late_days = attendance.filter(status='LATE').count()
        leave_days = attendance.filter(status='LEAVE').count()
        half_days = attendance.filter(status='HALF_DAY').count()
        
        attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0
        
        return Response({
            'student_id': student.id,
            'student_name': student.get_full_name(),
            'admission_number': student.admission_number,
            'class': student.current_class.name if student.current_class else None,
            'section': student.current_section.name if student.current_section else None,
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'statistics': {
                'total_days': total_days,
                'present_days': present_days,
                'absent_days': absent_days,
                'late_days': late_days,
                'leave_days': leave_days,
                'half_days': half_days,
                'attendance_percentage': round(attendance_percentage, 2)
            }
        })

    @action(detail=False, methods=['post'])
    def export_report(self, request):
        """
        Generate and export attendance report as CSV
        """
        import csv
        from django.http import HttpResponse
        from datetime import datetime
        
        # Get parameters
        report_type = request.data.get('report_type', 'daily')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        class_id = request.data.get('class_id')
        section_id = request.data.get('section_id')
        export_format = request.data.get('format', 'csv')
        
        # Build queryset
        queryset = self.get_queryset()
        
        # Apply date filters
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Get data
        attendance_records = queryset.select_related(
            'student', 'period', 'academic_year'
        ).order_by('date', 'student__first_name')
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="attendance_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Date', 'Student Name', 'Class-Section', 'Status', 'Check In', 'Check Out', 'Remarks'])
        
        for record in attendance_records:
            # Get class/section from enrollment
            class_section = '-'
            try:
                from apps.academics.models import StudentEnrollment
                enrollment = StudentEnrollment.objects.filter(
                    student=record.student,
                    is_active=True
                ).select_related('section', 'section__class_instance').first()
                
                if enrollment and enrollment.section:
                    class_name = enrollment.section.class_instance.name if enrollment.section.class_instance else ''
                    section_name = enrollment.section.name
                    class_section = f"{class_name} - {section_name}" if class_name else section_name
            except Exception:
                pass
            
            writer.writerow([
                record.date.strftime('%Y-%m-%d'),
                record.student.get_full_name(),
                class_section,
                record.get_status_display(),
                record.check_in_time.strftime('%H:%M') if record.check_in_time else '-',
                record.check_out_time.strftime('%H:%M') if record.check_out_time else '-',
                record.remarks or '-'
            ])
        
        return response


class StaffAttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for staff attendance management
    """
    queryset = StaffAttendance.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'date', 'biometric_verified']
    search_fields = ['staff_member__first_name', 'staff_member__last_name', 'staff_member__employee_id']
    ordering_fields = ['date', 'staff_member__first_name']
    ordering = ['-date']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return StaffAttendanceListSerializer
        return StaffAttendanceSerializer

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'staff_member',
            'marked_by'
        )

    def perform_create(self, serializer):
        """Set marked_by to current user"""
        serializer.save(marked_by=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get attendance summary for staff
        
        Query params:
        - staff_id: Staff member ID (optional)
        - start_date: Start date (optional)
        - end_date: End date (optional)
        - department_id: Department ID (optional)
        """
        staff_id = request.query_params.get('staff_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        department_id = request.query_params.get('department_id')
        
        # Build filter
        filters = {}
        if staff_id:
            filters['staff_member_id'] = staff_id
        if start_date:
            filters['date__gte'] = start_date
        if end_date:
            filters['date__lte'] = end_date
        if department_id:
            filters['staff_member__department_id'] = department_id
        
        # Get attendance records
        attendance = StaffAttendance.objects.filter(**filters)
        
        # Calculate statistics
        total_days = attendance.count()
        present_days = attendance.filter(status__in=['PRESENT', 'WORK_FROM_HOME']).count()
        absent_days = attendance.filter(status='ABSENT').count()
        leave_days = attendance.filter(status='LEAVE').count()
        half_days = attendance.filter(status='HALF_DAY').count()
        
        # Calculate average working hours
        avg_working_hours = attendance.filter(
            working_hours__isnull=False
        ).aggregate(avg=Avg('working_hours'))['avg'] or 0
        
        attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0
        
        return Response({
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'statistics': {
                'total_days': total_days,
                'present_days': present_days,
                'absent_days': absent_days,
                'leave_days': leave_days,
                'half_days': half_days,
                'attendance_percentage': round(attendance_percentage, 2),
                'average_working_hours': round(float(avg_working_hours), 2)
            }
        })


class StudentLeaveViewSet(viewsets.ModelViewSet):
    """
    ViewSet for student leave management
    """
    queryset = StudentLeave.objects.all()
    serializer_class = StudentLeaveSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'leave_type', 'start_date', 'end_date']
    search_fields = ['student__first_name', 'student__last_name', 'reason']
    ordering_fields = ['requested_at', 'start_date']
    ordering = ['-requested_at']

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'student',
            'requested_by',
            'approved_by'
        )

    def perform_create(self, serializer):
        """Set requested_by to current user"""
        serializer.save(requested_by=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a leave request"""
        leave = self.get_object()
        
        if leave.status != 'PENDING':
            return Response(
                {'error': 'Only pending leaves can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = StudentLeaveApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        remarks = serializer.validated_data.get('remarks', '')
        leave.approve(request.user)
        leave.approval_remarks = remarks
        leave.save()
        
        return Response({
            'message': 'Leave approved successfully',
            'leave': StudentLeaveSerializer(leave).data
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a leave request"""
        leave = self.get_object()
        
        if leave.status != 'PENDING':
            return Response(
                {'error': 'Only pending leaves can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = StudentLeaveApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        remarks = serializer.validated_data.get('remarks', '')
        leave.reject(request.user, remarks)
        
        return Response({
            'message': 'Leave rejected',
            'leave': StudentLeaveSerializer(leave).data
        })

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending leave requests"""
        pending_leaves = self.queryset.filter(status='PENDING')
        serializer = self.get_serializer(pending_leaves, many=True)
        return Response(serializer.data)


class StaffLeaveViewSet(viewsets.ModelViewSet):
    """
    ViewSet for staff leave management
    """
    queryset = StaffLeave.objects.all()
    serializer_class = StaffLeaveSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'leave_type', 'start_date', 'end_date']
    search_fields = ['staff_member__first_name', 'staff_member__last_name', 'reason']
    ordering_fields = ['requested_at', 'start_date']
    ordering = ['-requested_at']

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'staff_member',
            'staff_member__department',
            'approved_by'
        )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a leave request"""
        leave = self.get_object()
        
        if leave.status != 'PENDING':
            return Response(
                {'error': 'Only pending leaves can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = StaffLeaveApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        remarks = serializer.validated_data.get('remarks', '')
        leave.approve(request.user)
        leave.approval_remarks = remarks
        leave.save()
        
        return Response({
            'message': 'Leave approved successfully',
            'leave': StaffLeaveSerializer(leave).data
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a leave request"""
        leave = self.get_object()
        
        if leave.status != 'PENDING':
            return Response(
                {'error': 'Only pending leaves can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = StaffLeaveApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        remarks = serializer.validated_data.get('remarks', '')
        leave.reject(request.user, remarks)
        
        return Response({
            'message': 'Leave rejected',
            'leave': StaffLeaveSerializer(leave).data
        })

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending leave requests"""
        pending_leaves = self.queryset.filter(status='PENDING')
        serializer = self.get_serializer(pending_leaves, many=True)
        return Response(serializer.data)


class HolidayViewSet(viewsets.ModelViewSet):
    """
    ViewSet for holiday management
    """
    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['holiday_type', 'academic_year', 'is_optional', 'date']
    search_fields = ['name', 'description']
    ordering_fields = ['date']
    ordering = ['date']

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related('academic_year')

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming holidays"""
        today = timezone.now().date()
        upcoming_holidays = self.queryset.filter(date__gte=today).order_by('date')[:10]
        serializer = self.get_serializer(upcoming_holidays, many=True)
        return Response(serializer.data)


class AttendanceSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for attendance summary (read-only)
    """
    queryset = AttendanceSummary.objects.all()
    serializer_class = AttendanceSummarySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'academic_year', 'month']
    ordering_fields = ['month', 'attendance_percentage']
    ordering = ['-month']

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'student',
            'academic_year'
        )

    @action(detail=True, methods=['post'])
    def recalculate(self, request, pk=None):
        """Recalculate attendance summary"""
        summary = self.get_object()
        summary.calculate()
        serializer = self.get_serializer(summary)
        return Response({
            'message': 'Summary recalculated successfully',
            'summary': serializer.data
        })

    @action(detail=False, methods=['get'])
    def defaulters(self, request):
        """
        Get students with low attendance (< 75%)
        
        Query params:
        - academic_year_id: Academic year ID
        - threshold: Attendance percentage threshold (default: 75)
        """
        academic_year_id = request.query_params.get('academic_year_id')
        threshold = float(request.query_params.get('threshold', 75))
        
        if not academic_year_id:
            return Response(
                {'error': 'academic_year_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        defaulters = self.queryset.filter(
            academic_year_id=academic_year_id,
            attendance_percentage__lt=threshold
        ).order_by('attendance_percentage')
        
        serializer = self.get_serializer(defaulters, many=True)
        return Response({
            'threshold': threshold,
            'count': defaulters.count(),
            'defaulters': serializer.data
        })
