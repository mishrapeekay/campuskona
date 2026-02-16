"""
Redis Caching Strategy for Today View API
Implements per-student per-day caching with smart invalidation
"""

import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from django.core.cache import cache
from django.utils import timezone


class TodayViewCache:
    """
    Redis cache manager for Today View data
    Implements per-student per-day caching strategy
    """
    
    # Cache TTL configurations
    CACHE_TTL_SECONDS = 3600  # 1 hour default
    CACHE_TTL_MORNING = 7200  # 2 hours for morning (6 AM - 12 PM)
    CACHE_TTL_AFTERNOON = 3600  # 1 hour for afternoon (12 PM - 6 PM)
    CACHE_TTL_EVENING = 1800  # 30 minutes for evening (6 PM onwards)
    
    # Cache key prefixes
    PREFIX_TODAY_VIEW = "today_view"
    PREFIX_STUDENT = "student"
    PREFIX_PARENT = "parent"
    
    @classmethod
    def _get_cache_key(cls, student_id: str, date: str = None) -> str:
        """
        Generate cache key for student's today view
        Format: today_view:student:{student_id}:{date}
        """
        if date is None:
            date = timezone.now().date().isoformat()
        
        return f"{cls.PREFIX_TODAY_VIEW}:{cls.PREFIX_STUDENT}:{student_id}:{date}"
    
    @classmethod
    def _get_parent_cache_key(cls, parent_id: str, date: str = None) -> str:
        """
        Generate cache key for parent's today view
        Format: today_view:parent:{parent_id}:{date}
        """
        if date is None:
            date = timezone.now().date().isoformat()
        
        return f"{cls.PREFIX_TODAY_VIEW}:{cls.PREFIX_PARENT}:{parent_id}:{date}"
    
    @classmethod
    def _get_dynamic_ttl(cls) -> int:
        """
        Get dynamic TTL based on time of day
        Morning: longer cache (less changes expected)
        Evening: shorter cache (more updates like homework, remarks)
        """
        current_hour = timezone.now().hour
        
        if 6 <= current_hour < 12:
            return cls.CACHE_TTL_MORNING
        elif 12 <= current_hour < 18:
            return cls.CACHE_TTL_AFTERNOON
        else:
            return cls.CACHE_TTL_EVENING
    
    @classmethod
    def get(cls, student_id: str, date: str = None) -> Optional[Dict[str, Any]]:
        """
        Get cached today view data for a student
        """
        cache_key = cls._get_cache_key(student_id, date)
        cached_data = cache.get(cache_key)
        
        if cached_data:
            # Add cache metadata
            if isinstance(cached_data, dict):
                cached_data['_cache_hit'] = True
                cached_data['_cached_at'] = cache.get(f"{cache_key}:timestamp")
        
        return cached_data
    
    @classmethod
    def set(cls, student_id: str, data: Dict[str, Any], date: str = None, ttl: int = None) -> bool:
        """
        Set today view data in cache
        """
        cache_key = cls._get_cache_key(student_id, date)
        
        if ttl is None:
            ttl = cls._get_dynamic_ttl()
        
        # Add cache metadata to data
        data['_cache_hit'] = False
        data['_cache_ttl'] = ttl
        
        # Store data
        success = cache.set(cache_key, data, ttl)
        
        # Store timestamp separately for tracking
        if success:
            cache.set(f"{cache_key}:timestamp", timezone.now().isoformat(), ttl)
        
        return success
    
    @classmethod
    def get_parent(cls, parent_id: str, date: str = None) -> Optional[Dict[str, Any]]:
        """
        Get cached today view data for a parent
        """
        cache_key = cls._get_parent_cache_key(parent_id, date)
        cached_data = cache.get(cache_key)
        
        if cached_data:
            if isinstance(cached_data, dict):
                cached_data['_cache_hit'] = True
                cached_data['_cached_at'] = cache.get(f"{cache_key}:timestamp")
        
        return cached_data
    
    @classmethod
    def set_parent(cls, parent_id: str, data: Dict[str, Any], date: str = None, ttl: int = None) -> bool:
        """
        Set parent today view data in cache
        """
        cache_key = cls._get_parent_cache_key(parent_id, date)
        
        if ttl is None:
            ttl = cls._get_dynamic_ttl()
        
        data['_cache_hit'] = False
        data['_cache_ttl'] = ttl
        
        success = cache.set(cache_key, data, ttl)
        
        if success:
            cache.set(f"{cache_key}:timestamp", timezone.now().isoformat(), ttl)
        
        return success
    
    @classmethod
    def invalidate(cls, student_id: str, date: str = None) -> bool:
        """
        Invalidate cache for a specific student
        Used when data changes (new homework, fee payment, etc.)
        """
        cache_key = cls._get_cache_key(student_id, date)
        cache.delete(cache_key)
        cache.delete(f"{cache_key}:timestamp")
        return True
    
    @classmethod
    def invalidate_parent(cls, parent_id: str, date: str = None) -> bool:
        """
        Invalidate cache for a parent
        """
        cache_key = cls._get_parent_cache_key(parent_id, date)
        cache.delete(cache_key)
        cache.delete(f"{cache_key}:timestamp")
        return True
    
    @classmethod
    def invalidate_by_section(cls, section_id: str, date: str = None) -> int:
        """
        Invalidate cache for all students in a section
        Used when class-wide changes occur (timetable change, new assignment, etc.)
        """
        from apps.academics.models import StudentEnrollment
        
        # Get all students in this section
        enrollments = StudentEnrollment.objects.filter(
            section_id=section_id,
            is_active=True
        ).values_list('student_id', flat=True)
        
        count = 0
        for student_id in enrollments:
            if cls.invalidate(str(student_id), date):
                count += 1
        
        return count
    
    @classmethod
    def invalidate_multiple_students(cls, student_ids: list, date: str = None) -> int:
        """
        Invalidate cache for multiple students
        """
        count = 0
        for student_id in student_ids:
            if cls.invalidate(str(student_id), date):
                count += 1
        return count
    
    @classmethod
    def warm_cache(cls, student_id: str, data: Dict[str, Any], date: str = None) -> bool:
        """
        Warm cache proactively (e.g., after data update)
        """
        return cls.set(student_id, data, date)


class CacheInvalidationTriggers:
    """
    Defines when to invalidate today view cache
    These can be integrated into Django signals
    """
    
    @staticmethod
    def on_assignment_created(assignment):
        """Invalidate cache when new assignment is created"""
        section_id = assignment.section_id
        date = assignment.due_date.date().isoformat()
        return TodayViewCache.invalidate_by_section(section_id, date)
    
    @staticmethod
    def on_assignment_updated(assignment):
        """Invalidate cache when assignment is updated"""
        section_id = assignment.section_id
        date = assignment.due_date.date().isoformat()
        return TodayViewCache.invalidate_by_section(section_id, date)
    
    @staticmethod
    def on_fee_payment(payment):
        """Invalidate cache when fee payment is made"""
        student_id = str(payment.student_id)
        return TodayViewCache.invalidate(student_id)
    
    @staticmethod
    def on_student_note_created(note):
        """Invalidate cache when teacher adds a note"""
        student_id = str(note.student_id)
        return TodayViewCache.invalidate(student_id)
    
    @staticmethod
    def on_timetable_substitution(substitution):
        """Invalidate cache when timetable substitution is created"""
        # Get section from the original timetable entry
        original_entry = substitution.original_entry
        if original_entry:
            section_id = original_entry.section_id
            date = substitution.date.isoformat()
            return TodayViewCache.invalidate_by_section(section_id, date)
        return 0
    
    @staticmethod
    def on_attendance_marked(attendance):
        """Invalidate cache when attendance is marked"""
        student_id = str(attendance.student_id)
        date = attendance.date.isoformat()
        return TodayViewCache.invalidate(student_id, date)


class CacheWarmer:
    """
    Proactive cache warming strategies
    Can be run as scheduled tasks
    """
    
    @staticmethod
    async def warm_section_cache(section_id: str, date: str = None):
        """
        Warm cache for all students in a section
        Useful to run early morning before students/parents check
        """
        from apps.academics.models import StudentEnrollment
        from apps.mobile_bff.services.today_view import TodayViewService
        
        enrollments = await StudentEnrollment.objects.filter(
            section_id=section_id,
            is_active=True
        ).values_list('student_id', flat=True)
        
        for student_id in enrollments:
            service = TodayViewService(str(student_id))
            data = await service.get_today_data()
            TodayViewCache.set(str(student_id), data, date)
    
    @staticmethod
    async def warm_all_active_students(date: str = None):
        """
        Warm cache for all active students
        Run as a scheduled task (e.g., 5:30 AM daily)
        """
        from apps.students.models import Student
        from apps.mobile_bff.services.today_view import TodayViewService
        
        active_students = await Student.objects.filter(
            admission_status='ACTIVE',
            is_deleted=False
        ).values_list('id', flat=True)
        
        count = 0
        for student_id in active_students:
            try:
                service = TodayViewService(str(student_id))
                data = await service.get_today_data()
                if TodayViewCache.set(str(student_id), data, date):
                    count += 1
            except Exception:
                continue
        
        return count


# Cache statistics and monitoring
class CacheStats:
    """
    Track cache performance metrics
    """
    
    STATS_KEY_PREFIX = "today_view:stats"
    
    @classmethod
    def record_hit(cls, student_id: str):
        """Record a cache hit"""
        key = f"{cls.STATS_KEY_PREFIX}:hits:{timezone.now().date().isoformat()}"
        cache.incr(key, 1)
        # Set expiry to 7 days
        cache.expire(key, 7 * 24 * 3600)
    
    @classmethod
    def record_miss(cls, student_id: str):
        """Record a cache miss"""
        key = f"{cls.STATS_KEY_PREFIX}:misses:{timezone.now().date().isoformat()}"
        cache.incr(key, 1)
        cache.expire(key, 7 * 24 * 3600)
    
    @classmethod
    def get_today_stats(cls) -> Dict[str, int]:
        """Get today's cache statistics"""
        today = timezone.now().date().isoformat()
        hits = cache.get(f"{cls.STATS_KEY_PREFIX}:hits:{today}") or 0
        misses = cache.get(f"{cls.STATS_KEY_PREFIX}:misses:{today}") or 0
        
        total = hits + misses
        hit_rate = (hits / total * 100) if total > 0 else 0
        
        return {
            'hits': hits,
            'misses': misses,
            'total': total,
            'hit_rate': round(hit_rate, 2),
        }
