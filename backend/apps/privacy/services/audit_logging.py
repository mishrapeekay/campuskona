"""
Audit Logging Service for Sensitive Data Access
Tracks all access to sensitive student data fields (DPDP compliance)
"""
import hashlib
from django.utils import timezone
from django.db.models import Count, Q
from apps.privacy.models import SensitiveDataAccess, AccessPatternAlert


class AuditLoggingService:
    """
    Service for logging and analyzing sensitive data access
    """

    # Define sensitive fields that require audit logging
    SENSITIVE_FIELDS = [
        # Government IDs (encrypted)
        'aadhar_number',
        'samagra_family_id',
        'samagra_member_id',

        # Financial data (encrypted)
        'father_annual_income',
        'mother_annual_income',
        'annual_income',

        # Health data (encrypted)
        'medical_conditions',
        'allergies',
        'blood_group',
        'disability_details',

        # Contact information (encrypted)
        'phone_number',
        'email',
        'emergency_contact_number',
        'father_phone',
        'mother_phone',
        'guardian_phone',

        # Behavioral data
        'behavioral_notes',
        'disciplinary_records',

        # Academic sensitive data
        'exam_marks',
        'grade',
        'attendance_percentage',
    ]

    @staticmethod
    def log_field_access(user, student, field_name, access_type, request=None, value=None, access_reason=''):
        """
        Log access to a sensitive field

        Args:
            user: User who accessed the data
            student: Student whose data was accessed
            field_name: Name of the field accessed
            access_type: Type of access (VIEW, EDIT, EXPORT, DELETE)
            request: HTTP request object (optional)
            value: Value accessed (for hash generation)
            access_reason: Why the data was accessed

        Returns:
            SensitiveDataAccess instance
        """
        # Only log if field is sensitive
        if field_name not in AuditLoggingService.SENSITIVE_FIELDS:
            return None

        # Generate hash of value if provided (for integrity verification)
        value_hash = ''
        if value:
            value_hash = hashlib.sha256(str(value).encode()).hexdigest()

        # Extract request metadata
        ip_address = AuditLoggingService._get_client_ip(request) if request else '0.0.0.0'
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:500] if request else ''
        session_id = request.session.session_key if request and hasattr(request, 'session') else ''
        request_method = request.method if request else ''
        request_path = request.path if request else ''

        # Check if user has valid consent
        has_valid_consent = AuditLoggingService._check_consent(user, student, field_name)

        # Create access log
        access_log = SensitiveDataAccess.objects.create(
            user=user,
            student=student,
            field_name=field_name,
            field_value_hash=value_hash,
            access_type=access_type,
            access_reason=access_reason,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id,
            request_method=request_method,
            request_path=request_path,
            has_valid_consent=has_valid_consent
        )

        # Check for suspicious patterns
        AuditLoggingService._check_suspicious_pattern(access_log)

        return access_log

    @staticmethod
    def log_bulk_field_access(user, students, field_names, access_type, request=None, access_reason=''):
        """
        Log access to multiple fields for multiple students (e.g., export)

        Args:
            user: User who accessed the data
            students: List of Student instances
            field_names: List of field names accessed
            access_type: Type of access (usually EXPORT)
            request: HTTP request object
            access_reason: Why the data was accessed

        Returns:
            List of SensitiveDataAccess instances
        """
        access_logs = []

        for student in students:
            for field_name in field_names:
                log = AuditLoggingService.log_field_access(
                    user=user,
                    student=student,
                    field_name=field_name,
                    access_type=access_type,
                    request=request,
                    access_reason=access_reason
                )
                if log:
                    access_logs.append(log)

        # Check for bulk access alert
        if len(access_logs) > 20:
            AuditLoggingService._create_bulk_access_alert(user, students, access_logs)

        return access_logs

    @staticmethod
    def _get_client_ip(request):
        """Extract client IP from request"""
        if not request:
            return '0.0.0.0'

        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR', '0.0.0.0')
        return ip

    @staticmethod
    def _check_consent(user, student, field_name):
        """Check if user has valid consent to access this data"""
        # Admin/staff always have access (institutional necessity)
        if user.user_type in ['ADMIN', 'SUPERADMIN', 'TEACHER']:
            return True

        # Parents need consent for certain purposes
        if user.user_type == 'PARENT':
            from apps.students.models import StudentParent
            from apps.privacy.models import ParentalConsent

            # Check if user is parent of this student
            is_parent = StudentParent.objects.filter(
                student=student,
                parent_user=user,
                is_deleted=False
            ).exists()

            if not is_parent:
                return False

            # Check if parent has given consent for relevant purpose
            # For health data, need HEALTH_SAFETY consent
            if field_name in ['medical_conditions', 'allergies', 'blood_group', 'disability_details']:
                consent = ParentalConsent.objects.filter(
                    student=student,
                    parent_user=user,
                    purpose__code='HEALTH_SAFETY',
                    consent_given=True,
                    withdrawn=False
                ).exists()
                return consent

            # For government IDs, need GOVERNMENT_ID_SAMAGRA or core consent
            if field_name in ['aadhar_number', 'samagra_family_id', 'samagra_member_id']:
                consent = ParentalConsent.objects.filter(
                    student=student,
                    parent_user=user,
                    purpose__code__in=['CORE_EDUCATIONAL', 'GOVERNMENT_ID_SAMAGRA'],
                    consent_given=True,
                    withdrawn=False
                ).exists()
                return consent

            # For behavioral data, need BEHAVIORAL_MONITORING consent
            if field_name in ['behavioral_notes', 'disciplinary_records']:
                consent = ParentalConsent.objects.filter(
                    student=student,
                    parent_user=user,
                    purpose__code='BEHAVIORAL_MONITORING',
                    consent_given=True,
                    withdrawn=False
                ).exists()
                return consent

            # Default: parent has access to their child's data
            return True

        # Students can access their own data
        if user.user_type == 'STUDENT':
            return student.user == user

        return False

    @staticmethod
    def _check_suspicious_pattern(access_log):
        """
        Check if access pattern is suspicious and flag if needed
        """
        user = access_log.user
        accessed_at = access_log.accessed_at

        # Check 1: Unusual hours (10 PM - 6 AM)
        hour = accessed_at.hour
        if hour >= 22 or hour <= 6:
            access_log.is_flagged = True
            access_log.flag_reason = f"Access during unusual hours ({hour}:00)"
            access_log.save()

            # Create alert
            AuditLoggingService._create_unusual_hours_alert(user, access_log)

        # Check 2: Bulk access in short time (20+ accesses in 5 minutes)
        recent_count = SensitiveDataAccess.objects.filter(
            user=user,
            accessed_at__gte=accessed_at - timezone.timedelta(minutes=5),
            accessed_at__lte=accessed_at
        ).count()

        if recent_count > 20:
            access_log.is_flagged = True
            access_log.flag_reason = f"Bulk access detected ({recent_count} accesses in 5 minutes)"
            access_log.save()

        # Check 3: Access without valid consent
        if not access_log.has_valid_consent:
            access_log.is_flagged = True
            access_log.flag_reason = "Access without valid consent"
            access_log.save()

            AuditLoggingService._create_no_consent_alert(user, access_log)

    @staticmethod
    def _create_bulk_access_alert(user, students, access_logs):
        """Create alert for bulk data access"""
        alert, created = AccessPatternAlert.objects.get_or_create(
            user=user,
            alert_type='BULK_ACCESS',
            status='NEW',
            detected_at__gte=timezone.now() - timezone.timedelta(minutes=10),
            defaults={
                'severity': 'MEDIUM',
                'description': f'User accessed sensitive data for {len(students)} students in bulk',
                'affected_students_count': len(students),
                'detection_rule': 'Bulk access > 20 students',
            }
        )

        if created:
            alert.affected_students.set(students)
            alert.related_accesses.set(access_logs)

    @staticmethod
    def _create_unusual_hours_alert(user, access_log):
        """Create alert for access during unusual hours"""
        alert, created = AccessPatternAlert.objects.get_or_create(
            user=user,
            alert_type='UNUSUAL_HOURS',
            status='NEW',
            detected_at__gte=timezone.now() - timezone.timedelta(hours=1),
            defaults={
                'severity': 'MEDIUM',
                'description': f'User accessed sensitive data during unusual hours ({access_log.accessed_at.hour}:00)',
                'affected_students_count': 1,
                'detection_rule': 'Access between 22:00-06:00',
            }
        )

        if created:
            alert.affected_students.add(access_log.student)
            alert.related_accesses.add(access_log)

    @staticmethod
    def _create_no_consent_alert(user, access_log):
        """Create alert for access without valid consent"""
        alert, created = AccessPatternAlert.objects.get_or_create(
            user=user,
            alert_type='NO_CONSENT',
            status='NEW',
            detected_at__gte=timezone.now() - timezone.timedelta(hours=1),
            defaults={
                'severity': 'HIGH',
                'description': f'User accessed data without valid consent',
                'affected_students_count': 1,
                'detection_rule': 'No valid consent found',
            }
        )

        if created:
            alert.affected_students.add(access_log.student)
            alert.related_accesses.add(access_log)

    @staticmethod
    def get_global_access_summary(days=30, tenant=None):
        """
        Get aggregate summary of all sensitive data accesses
        """
        cutoff_date = timezone.now() - timezone.timedelta(days=days)

        accesses = SensitiveDataAccess.objects.filter(
            accessed_at__gte=cutoff_date
        )
        
        if tenant:
            accesses = accesses.filter(student__tenant=tenant)

        summary = {
            'total_accesses': accesses.count(),
            'unique_students': accesses.values('student').distinct().count(),
            'unique_users': accesses.values('user').distinct().count(),
            'flagged_count': accesses.filter(is_flagged=True).count(),
            'flagged_percentage': 0,
            'without_consent': accesses.filter(has_valid_consent=False).count(),
            'by_access_type': {},
            'by_field': {},
            'by_user': [],
            'by_hour': [],
            'consent_compliance': {
                'with_consent': accesses.filter(has_valid_consent=True).count(),
                'without_consent': accesses.filter(has_valid_consent=False).count(),
            }
        }

        if summary['total_accesses'] > 0:
            summary['flagged_percentage'] = (summary['flagged_count'] / summary['total_accesses']) * 100

        # Group by access type
        for access_type in ['VIEW', 'EDIT', 'EXPORT', 'DELETE']:
            summary['by_access_type'][access_type] = accesses.filter(
                access_type=access_type
            ).count()

        # Group by field (top 15)
        field_counts = accesses.values('field_name').annotate(
            count=Count('field_name')
        ).order_by('-count')[:15]

        for item in field_counts:
            summary['by_field'][item['field_name']] = item['count']

        # Top Users by access count
        user_counts = accesses.values('user__id', 'user__first_name', 'user__last_name').annotate(
            total_accesses=Count('id'),
            flagged_count=Count('id', filter=Q(is_flagged=True)),
            without_consent=Count('id', filter=Q(has_valid_consent=False))
        ).order_by('-total_accesses')[:10]

        for item in user_counts:
            compliance_rate = 100
            if item['total_accesses'] > 0:
                compliance_rate = ((item['total_accesses'] - item['without_consent']) / item['total_accesses']) * 100
            
            summary['by_user'].append({
                'user_id': item['user__id'],
                'user_name': f"{item['user__first_name']} {item['user__last_name']}",
                'total_accesses': item['total_accesses'],
                'flagged_count': item['flagged_count'],
                'compliance_rate': compliance_rate
            })

        # Hourly distribution
        hourly_counts = accesses.extra(select={'hour': "EXTRACT(HOUR FROM accessed_at)"}).values('hour').annotate(count=Count('id')).order_by('hour')
        for item in hourly_counts:
            summary['by_hour'].append({
                'hour': int(item['hour']),
                'count': item['count']
            })

        return summary

    @staticmethod
    def get_user_access_summary(user, days=30):
        """
        Get summary of user's access to sensitive data

        Args:
            user: User to get summary for
            days: Number of days to look back

        Returns:
            dict with access statistics
        """
        cutoff_date = timezone.now() - timezone.timedelta(days=days)

        accesses = SensitiveDataAccess.objects.filter(
            user=user,
            accessed_at__gte=cutoff_date
        )

        summary = {
            'total_accesses': accesses.count(),
            'unique_students': accesses.values('student').distinct().count(),
            'by_access_type': {},
            'by_field': {},
            'flagged_count': accesses.filter(is_flagged=True).count(),
            'without_consent': accesses.filter(has_valid_consent=False).count(),
        }

        # Group by access type
        for access_type in ['VIEW', 'EDIT', 'EXPORT', 'DELETE']:
            summary['by_access_type'][access_type] = accesses.filter(
                access_type=access_type
            ).count()

        # Group by field (top 10)
        field_counts = accesses.values('field_name').annotate(
            count=Count('field_name')
        ).order_by('-count')[:10]

        for item in field_counts:
            summary['by_field'][item['field_name']] = item['count']

        return summary

    @staticmethod
    def get_student_access_history(student, days=90):
        """
        Get access history for a specific student

        Args:
            student: Student instance
            days: Number of days to look back

        Returns:
            QuerySet of SensitiveDataAccess
        """
        cutoff_date = timezone.now() - timezone.timedelta(days=days)

        return SensitiveDataAccess.objects.filter(
            student=student,
            accessed_at__gte=cutoff_date
        ).select_related('user').order_by('-accessed_at')

    @staticmethod
    def get_pending_alerts():
        """Get all unresolved access pattern alerts"""
        return AccessPatternAlert.objects.filter(
            status__in=['NEW', 'INVESTIGATING']
        ).select_related('user').prefetch_related('affected_students').order_by('-severity', '-detected_at')

    @staticmethod
    def resolve_alert(alert, resolved_by, resolution_notes):
        """Mark alert as resolved"""
        alert.status = 'RESOLVED'
        alert.resolved_at = timezone.now()
        alert.resolution_notes = resolution_notes
        alert.save()

        # Unflag related accesses
        alert.related_accesses.update(
            reviewed_by=resolved_by,
            reviewed_at=timezone.now()
        )

    @staticmethod
    def mark_as_false_positive(alert, resolved_by, notes):
        """Mark alert as false positive"""
        alert.status = 'FALSE_POSITIVE'
        alert.resolved_at = timezone.now()
        alert.resolution_notes = notes
        alert.save()

        # Unflag related accesses
        alert.related_accesses.update(
            is_flagged=False,
            reviewed_by=resolved_by,
            reviewed_at=timezone.now()
        )
