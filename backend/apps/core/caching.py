"""
Caching utilities for School Management System.

This module provides centralized caching functionality using Redis.
Implements caching strategies for different types of data.

Usage:
    from apps.core.caching import CacheManager, cache_response

    # Cache a view response
    @cache_response(timeout=300)
    def my_view(request):
        ...

    # Cache model data
    data = CacheManager.get_or_set('key', expensive_function, timeout=600)
"""

from django.core.cache import cache
from django.utils.encoding import force_str
from functools import wraps
import hashlib
import json


class CacheManager:
    """
    Centralized cache management with smart key generation and TTL settings.
    """

    # Cache TTL (Time To Live) settings in seconds
    TTL_STATIC = 86400  # 24 hours - for roles, permissions, settings
    TTL_SEMI_STATIC = 3600  # 1 hour - for classes, subjects, academic years
    TTL_DYNAMIC = 300  # 5 minutes - for dashboard stats, counts
    TTL_USER_DATA = 900  # 15 minutes - for user permissions, profiles
    TTL_SHORT = 60  # 1 minute - for frequently changing data

    @staticmethod
    def generate_key(*args, **kwargs):
        """
        Generate a unique cache key from arguments.

        Args:
            *args: Positional arguments to include in key
            **kwargs: Keyword arguments to include in key

        Returns:
            str: Unique cache key

        Example:
            key = CacheManager.generate_key('user', user_id, role='admin')
            # Returns: 'cache_abc123def456'
        """
        # Create a string representation of all arguments
        key_data = {
            'args': args,
            'kwargs': sorted(kwargs.items())
        }
        key_string = json.dumps(key_data, sort_keys=True)

        # Generate hash
        key_hash = hashlib.md5(key_string.encode()).hexdigest()

        return f"sms_cache_{key_hash}"

    @classmethod
    def get(cls, key, default=None):
        """
        Get value from cache.

        Args:
            key: Cache key
            default: Default value if key not found

        Returns:
            Cached value or default
        """
        return cache.get(key, default)

    @classmethod
    def set(cls, key, value, timeout=None):
        """
        Set value in cache.

        Args:
            key: Cache key
            value: Value to cache
            timeout: TTL in seconds (None = default)

        Returns:
            bool: True if successful
        """
        return cache.set(key, value, timeout)

    @classmethod
    def delete(cls, key):
        """
        Delete key from cache.

        Args:
            key: Cache key to delete

        Returns:
            bool: True if deleted
        """
        return cache.delete(key)

    @classmethod
    def get_or_set(cls, key, func, timeout=None, *args, **kwargs):
        """
        Get from cache or execute function and cache result.

        Args:
            key: Cache key
            func: Function to execute if cache miss
            timeout: TTL in seconds
            *args, **kwargs: Arguments to pass to func

        Returns:
            Cached or computed value

        Example:
            roles = CacheManager.get_or_set(
                'all_active_roles',
                Role.objects.filter,
                CacheManager.TTL_STATIC,
                is_active=True
            )
        """
        value = cls.get(key)

        if value is None:
            # Cache miss - execute function
            value = func(*args, **kwargs) if callable(func) else func
            cls.set(key, value, timeout)

        return value

    @classmethod
    def invalidate_pattern(cls, pattern):
        """
        Invalidate all keys matching a pattern.

        Args:
            pattern: Pattern to match (e.g., 'user_*')

        Note:
            This requires Redis backend with pattern support

        Example:
            # Invalidate all user caches
            CacheManager.invalidate_pattern('sms_cache_user_*')
        """
        try:
            from django_redis import get_redis_connection
            redis_conn = get_redis_connection("default")
            keys = redis_conn.keys(pattern)
            if keys:
                redis_conn.delete(*keys)
            return len(keys)
        except Exception:
            # Fallback if Redis not available
            return 0


# Cache keys for common data
class CacheKeys:
    """Centralized cache key definitions."""

    # Static data (24 hours)
    ALL_ROLES = 'sms_all_roles'
    ALL_PERMISSIONS = 'sms_all_permissions'
    ROLE_PERMISSIONS = lambda role_id: f'sms_role_{role_id}_permissions'

    # User-specific data (15 minutes)
    USER_PROFILE = lambda user_id: f'sms_user_{user_id}_profile'
    USER_PERMISSIONS = lambda user_id: f'sms_user_{user_id}_permissions'
    USER_ROLES = lambda user_id: f'sms_user_{user_id}_roles'

    # Dashboard stats (5 minutes)
    DASHBOARD_STATS = 'sms_dashboard_stats'
    STUDENT_COUNT = lambda status: f'sms_student_count_{status}'

    # Lists (1 hour)
    ACTIVE_CLASSES = 'sms_active_classes'
    ACTIVE_SUBJECTS = 'sms_active_subjects'
    ACADEMIC_YEARS = 'sms_academic_years'


def cache_response(timeout=300, key_prefix='view'):
    """
    Decorator to cache view responses.

    Args:
        timeout: Cache TTL in seconds
        key_prefix: Prefix for cache key

    Usage:
        @cache_response(timeout=300)
        def my_view(request):
            return Response(data)
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Generate cache key from view name, user, and query params
            query_string = request.META.get('QUERY_STRING', '')
            user_id = getattr(request.user, 'id', 'anon')

            cache_key = CacheManager.generate_key(
                key_prefix,
                view_func.__name__,
                user_id,
                query_string
            )

            # Try to get from cache
            cached_response = CacheManager.get(cache_key)
            if cached_response is not None:
                return cached_response

            # Execute view and cache response
            response = view_func(request, *args, **kwargs)

            # Only cache successful responses
            if response.status_code == 200:
                CacheManager.set(cache_key, response, timeout)

            return response

        return wrapper
    return decorator


def cache_queryset(model_name, timeout=300):
    """
    Decorator to cache queryset results.

    Args:
        model_name: Model name for cache key
        timeout: Cache TTL in seconds

    Usage:
        @cache_queryset('Student', timeout=300)
        def get_active_students():
            return Student.objects.filter(is_active=True)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = CacheManager.generate_key(
                'queryset',
                model_name,
                func.__name__,
                *args,
                **kwargs
            )

            return CacheManager.get_or_set(
                cache_key,
                func,
                timeout,
                *args,
                **kwargs
            )

        return wrapper
    return decorator


# Cache invalidation helpers

def invalidate_user_cache(user_id):
    """
    Invalidate all cache entries for a specific user.

    Args:
        user_id: User ID to invalidate

    Example:
        # After updating user permissions
        invalidate_user_cache(user.id)
    """
    keys_to_delete = [
        CacheKeys.USER_PROFILE(user_id),
        CacheKeys.USER_PERMISSIONS(user_id),
        CacheKeys.USER_ROLES(user_id),
    ]

    for key in keys_to_delete:
        CacheManager.delete(key)


def invalidate_role_cache(role_id=None):
    """
    Invalidate role-related cache entries.

    Args:
        role_id: Specific role ID or None for all roles

    Example:
        # After updating role permissions
        invalidate_role_cache(role.id)
    """
    if role_id:
        CacheManager.delete(CacheKeys.ROLE_PERMISSIONS(role_id))
    else:
        CacheManager.delete(CacheKeys.ALL_ROLES)
        CacheManager.delete(CacheKeys.ALL_PERMISSIONS)


def invalidate_dashboard_cache():
    """
    Invalidate dashboard statistics cache.

    Example:
        # After creating a new student
        invalidate_dashboard_cache()
    """
    CacheManager.delete(CacheKeys.DASHBOARD_STATS)

    # Invalidate all student count caches
    for status in ['INQUIRY', 'APPLIED', 'ADMITTED', 'REJECTED']:
        CacheManager.delete(CacheKeys.STUDENT_COUNT(status))


# Utility functions for common caching patterns

def get_cached_roles():
    """
    Get all active roles from cache or database.

    Returns:
        QuerySet: Active roles

    Example:
        roles = get_cached_roles()
    """
    from apps.authentication.models import Role

    return CacheManager.get_or_set(
        CacheKeys.ALL_ROLES,
        lambda: list(Role.objects.filter(is_active=True).prefetch_related('permissions')),
        CacheManager.TTL_STATIC
    )


def get_cached_permissions():
    """
    Get all active permissions from cache or database.

    Returns:
        QuerySet: Active permissions

    Example:
        permissions = get_cached_permissions()
    """
    from apps.authentication.models import Permission

    return CacheManager.get_or_set(
        CacheKeys.ALL_PERMISSIONS,
        lambda: list(Permission.objects.filter(is_active=True)),
        CacheManager.TTL_STATIC
    )


def get_cached_user_permissions(user_id):
    """
    Get user's permissions from cache or database.

    Args:
        user_id: User ID

    Returns:
        list: User's permission codes

    Example:
        permissions = get_cached_user_permissions(request.user.id)
    """
    from apps.authentication.models import User

    def fetch_permissions():
        user = User.objects.prefetch_related(
            'user_roles__role__permissions'
        ).get(id=user_id)

        permission_codes = []
        for user_role in user.user_roles.filter(is_active=True):
            for perm in user_role.role.permissions.filter(is_active=True):
                permission_codes.append(perm.code)

        return list(set(permission_codes))

    return CacheManager.get_or_set(
        CacheKeys.USER_PERMISSIONS(user_id),
        fetch_permissions,
        CacheManager.TTL_USER_DATA
    )
