from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from apps.attendance.models import StudentAttendance, ClassAttendanceLog
from apps.academics.models import StudentEnrollment
from apps.mobile_bff.serializers.attendance_sync_serializers import BatchAttendanceSyncSerializer
import uuid

class OfflineAttendanceSyncView(APIView):
    """
    Handle offline attendance sync from mobile apps.
    Support batch uploads, idempotency, and conflict resolution.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BatchAttendanceSyncSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        results = []
        pushes = serializer.validated_data['pushes']

        for push in pushes:
            # Extract data
            section = push['section']
            date = push['date']
            period = push['period']
            client_timestamp = push['client_timestamp']
            sync_id = push['sync_id']
            records = push['records']
            
            # Conflict Resolution: Last Write Wins based on client_timestamp
            try:
                with transaction.atomic():
                    # Check for existing log
                    existing_log = ClassAttendanceLog.objects.filter(
                        section=section,
                        date=date,
                        period=period
                    ).select_for_update().first()

                    action_taken = "PROCESSED"

                    if existing_log:
                        # If existing log is newer (later timestamp), ignore this push
                        if existing_log.client_timestamp > client_timestamp:
                            results.append({
                                "sync_id": sync_id,
                                "status": "IGNORED_STALE",
                                "message": "Server has newer data"
                            })
                            continue
                        
                        # Idempotency check: If same sync_id, it's a retry
                        if existing_log.sync_id == sync_id:
                            results.append({
                                "sync_id": sync_id,
                                "status": "SUCCESS_IDEMPOTENT",
                                "message": "Already processed"
                            })
                            continue
                    
                    # Process Attendance
                    # 1. Get all students in the section
                    enrollments = StudentEnrollment.objects.filter(
                        section=section,
                        is_active=True
                    ).select_related('student')
                    
                    all_student_ids = set(enrollments.values_list('student_id', flat=True))
                    
                    # 2. Identify absentees from payload
                    absent_map = {r['student_id']: r for r in records}
                    absent_student_ids = set(absent_map.keys())
                    
                    # 3. Present students = All - Absent
                    present_student_ids = all_student_ids - absent_student_ids

                    # 4. Bulk Update/Create StudentAttendance
                    # Using loop for now as we might need detailed updates, but bulk_update is better for performance.
                    # Since we are "syncing", we should overwrite existing statuses for this day.

                    # Mark Absentees
                    for student_id in absent_student_ids:
                        if student_id not in all_student_ids:
                            continue # Skip if student not in section (validation?)
                        
                        record_data = absent_map[student_id]
                        StudentAttendance.objects.update_or_create(
                            student_id=student_id,
                            date=date,
                            period=period,
                            defaults={
                                'status': record_data['status'], # ABSENT, LATE, etc.
                                'remarks': record_data.get('remarks', ''),
                                'academic_year': section.academic_year, # Assuming section has AY
                                'marked_by': request.user,
                                'marked_at': timezone.now()
                            }
                        )

                    # Mark Present
                    # "Default state = All Present" logic
                    for student_id in present_student_ids:
                        StudentAttendance.objects.update_or_create(
                            student_id=student_id,
                            date=date,
                            period=period,
                            defaults={
                                'status': 'PRESENT',
                                'academic_year': section.academic_year,
                                'marked_by': request.user,
                                'marked_at': timezone.now()
                            }
                        )

                    # 5. Create/Update ClassAttendanceLog
                    log_defaults = {
                        'taken_by': request.user,
                        'client_timestamp': client_timestamp,
                        'sync_id': sync_id,
                        'total_students': len(all_student_ids),
                        'present_count': len(present_student_ids),
                        'absent_count': len(absent_student_ids)
                    }
                    
                    ClassAttendanceLog.objects.update_or_create(
                        section=section,
                        date=date,
                        period=period,
                        defaults=log_defaults
                    )

                    results.append({
                        "sync_id": sync_id,
                        "status": "SUCCESS",
                        "updated_log": True
                    })

            except Exception as e:
                # Log error
                print(f"Error syncing attendance batch {sync_id}: {e}")
                results.append({
                    "sync_id": sync_id,
                    "status": "ERROR",
                    "message": str(e)
                })

        return Response({"results": results}, status=status.HTTP_200_OK)
