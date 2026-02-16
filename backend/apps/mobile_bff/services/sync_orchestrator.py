from django.utils import timezone
from django.utils.dateparse import parse_datetime
from apps.attendance.models import StudentAttendance
from apps.assignments.models import Assignment, AssignmentSubmission
from apps.examinations.models import ExamSchedule
from apps.communication.models import Notification
from asgiref.sync import sync_to_async
from django.db import transaction, DatabaseError
import logging

logger = logging.getLogger(__name__)


class SyncOrchestrator:
    """
    Orchestrates offline sync operations:
    - PUSH: Client sends batched changes -> We process them.
    - PULL: Client requests updates since timestamp -> We fetch them.
    """

    ALLOWED_ENTITIES = {
        'student_attendance': StudentAttendance,
        'assignment': Assignment,
        'assignment_submission': AssignmentSubmission,
    }

    # Entities available for pull (read) with their serialization fields
    PULL_ENTITIES = {
        'student_attendance': {
            'model': StudentAttendance,
            'fields': ['id', 'student_id', 'date', 'status', 'academic_year_id',
                        'period_id', 'check_in_time', 'check_out_time',
                        'marked_by_id', 'marked_at', 'updated_at'],
            'user_filter': None,
        },
        'assignments': {
            'model': Assignment,
            'fields': ['id', 'title', 'description', 'subject_id', 'section_id',
                        'teacher_id', 'academic_year_id', 'due_date', 'max_marks',
                        'status', 'updated_at'],
            'user_filter': None,
        },
        'assignment_submissions': {
            'model': AssignmentSubmission,
            'fields': ['id', 'assignment_id', 'student_id', 'submission_date',
                        'status', 'marks_obtained', 'teacher_feedback',
                        'graded_by_id', 'graded_at', 'updated_at'],
            'user_filter': None,
        },
        'exam_schedules': {
            'model': ExamSchedule,
            'fields': ['id', 'examination_id', 'class_obj_id', 'section_id',
                        'subject_id', 'exam_date', 'start_time', 'end_time',
                        'max_marks', 'room_number', 'updated_at'],
            'user_filter': None,
        },
        'notifications': {
            'model': Notification,
            'fields': ['id', 'title', 'message',
                        'is_read', 'link', 'created_at', 'updated_at'],
            'user_filter': 'recipient',
        },
    }

    @staticmethod
    async def process_push(user, payload):
        """
        Process pushed changes from mobile.
        """
        from apps.mobile_bff.models import SyncLog, SyncConflict

        results = []
        changes = payload.get('changes', [])
        failed_count = 0

        for change in changes:
            temp_id = change.get('temp_id')
            entity_name = change.get('entity')
            action = change.get('action')
            data = change.get('data')

            try:
                if entity_name not in SyncOrchestrator.ALLOWED_ENTITIES:
                    raise ValueError(f"Entity {entity_name} not supported for sync")

                model = SyncOrchestrator.ALLOWED_ENTITIES[entity_name]

                @sync_to_async
                def perform_db_action():
                    if action == 'CREATE':
                        obj = model.objects.create(**data)
                        return str(obj.id)
                    elif action == 'UPDATE':
                        obj_id = data.pop('id', None)
                        if not obj_id:
                            raise ValueError("Update requires ID")

                        # Conflict detection: reject if server version is newer
                        client_updated_at = data.pop('updated_at', None)
                        if client_updated_at:
                            parsed = parse_datetime(client_updated_at) if isinstance(client_updated_at, str) else client_updated_at
                            server_obj = model.objects.filter(id=obj_id).first()
                            if server_obj and parsed and server_obj.updated_at > parsed:
                                raise ValueError("Server version is newer — conflict detected")

                        model.objects.filter(id=obj_id).update(**data)
                        return str(obj_id)
                    return None

                new_id = await perform_db_action()

                results.append({
                    "temp_id": temp_id,
                    "status": "SUCCESS",
                    "server_id": new_id,
                    "synced_at": timezone.now().isoformat()
                })

            except Exception as e:
                failed_count += 1
                logger.error(f"Sync error for {entity_name}: {str(e)}")
                results.append({
                    "temp_id": temp_id,
                    "status": "ERROR",
                    "error": str(e)
                })

                await sync_to_async(SyncConflict.objects.create)(
                    user=user,
                    entity_name=entity_name or 'unknown',
                    client_version=data or {},
                    server_version={"error": str(e)},
                    resolution_strategy='REJECT'
                )

        # Log session
        status_str = 'SUCCESS'
        if failed_count == len(changes) and len(changes) > 0:
            status_str = 'ERROR'
        elif failed_count > 0:
            status_str = 'PARTIAL'

        await sync_to_async(SyncLog.objects.create)(
            user=user,
            operation='PUSH',
            status=status_str,
            details={"total": len(changes), "failed": failed_count, "results": results}
        )

        return {"results": results}

    @staticmethod
    async def process_pull(user, last_synced_at):
        """
        Fetch changes since last_synced_at for the requesting user.
        Returns updated records for each syncable entity, filtered by role.
        """
        from apps.mobile_bff.models import SyncLog

        since = None
        if last_synced_at:
            since = parse_datetime(last_synced_at)

        @sync_to_async
        def fetch_updates():
            updates = {}

            for entity_key, config in SyncOrchestrator.PULL_ENTITIES.items():
                model = config['model']
                fields = config['fields']
                user_filter_field = config['user_filter']

                qs = model.objects.all()

                # Apply time filter
                if since:
                    qs = qs.filter(updated_at__gt=since)

                # Apply user-specific filters based on role
                qs = SyncOrchestrator._apply_role_filter(
                    qs, entity_key, user, user_filter_field
                )

                # Limit to avoid huge payloads
                records = list(qs.order_by('-updated_at')[:200].values(*fields))

                # Convert non-serializable types to strings
                for record in records:
                    for key, val in record.items():
                        if hasattr(val, 'isoformat'):
                            record[key] = val.isoformat()
                        elif hasattr(val, 'hex'):
                            record[key] = str(val)

                if records:
                    updates[entity_key] = records

            return updates

        updates = await fetch_updates()

        # Log pull session
        await sync_to_async(SyncLog.objects.create)(
            user=user,
            operation='PULL',
            status='SUCCESS',
            details={
                "entities_returned": list(updates.keys()),
                "record_counts": {k: len(v) for k, v in updates.items()},
            }
        )

        return {
            "updates": updates,
            "new_sync_token": timezone.now().isoformat()
        }

    @staticmethod
    def _apply_role_filter(qs, entity_key, user, user_filter_field):
        """
        Apply role-based filtering so users only receive data they should see.
        """
        # Direct user filter (e.g., notifications → recipient=user)
        if user_filter_field:
            return qs.filter(**{user_filter_field: user})

        user_type = getattr(user, 'user_type', None)

        if user_type == 'STUDENT':
            from apps.students.models import Student
            try:
                student = Student.objects.get(user=user)
            except Student.DoesNotExist:
                return qs.none()

            if entity_key == 'student_attendance':
                return qs.filter(student=student)
            elif entity_key == 'assignments':
                from apps.academics.models import StudentEnrollment
                section_ids = StudentEnrollment.objects.filter(
                    student=student, is_active=True
                ).values_list('section_id', flat=True)
                return qs.filter(section_id__in=section_ids, status='PUBLISHED')
            elif entity_key == 'assignment_submissions':
                return qs.filter(student=student)
            elif entity_key == 'exam_schedules':
                from apps.academics.models import StudentEnrollment
                section_ids = StudentEnrollment.objects.filter(
                    student=student, is_active=True
                ).values_list('section_id', flat=True)
                return qs.filter(section_id__in=section_ids)

        elif user_type == 'TEACHER':
            from apps.staff.models import StaffMember
            try:
                staff = StaffMember.objects.get(user=user)
            except StaffMember.DoesNotExist:
                return qs.none()

            if entity_key == 'student_attendance':
                return qs.filter(marked_by=user)
            elif entity_key == 'assignments':
                return qs.filter(teacher=staff)
            elif entity_key == 'assignment_submissions':
                return qs.filter(assignment__teacher=staff)
            elif entity_key == 'exam_schedules':
                from apps.timetable.models import TeacherTimetable
                section_ids = TeacherTimetable.objects.filter(
                    teacher=staff, is_active=True, academic_year__is_current=True
                ).values_list('section_id', flat=True).distinct()
                return qs.filter(section_id__in=section_ids)

        elif user_type == 'PARENT':
            from apps.students.models import StudentParent
            student_ids = StudentParent.objects.filter(
                parent=user
            ).values_list('student_id', flat=True)

            if entity_key == 'student_attendance':
                return qs.filter(student_id__in=student_ids)
            elif entity_key in ('assignments', 'exam_schedules'):
                from apps.academics.models import StudentEnrollment
                section_ids = StudentEnrollment.objects.filter(
                    student_id__in=student_ids, is_active=True
                ).values_list('section_id', flat=True)
                return qs.filter(section_id__in=section_ids)
            elif entity_key == 'assignment_submissions':
                return qs.filter(student_id__in=student_ids)

        # ADMIN/SCHOOL_ADMIN roles: return unfiltered (tenant schema handles isolation)
        return qs
