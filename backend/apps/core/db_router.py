"""
Database router for multi-tenant architecture.

This router ensures:
1. Authentication models (User) always use public schema
2. Tenant-specific models use the tenant schema from request context
3. Shared models (School, Domain) use public schema
"""

import logging
import contextvars
from django.db import connection
from psycopg2 import sql as psycopg2_sql

logger = logging.getLogger(__name__)

# Context-variable storage for tenant context (safe for both WSGI and ASGI)
_tenant_var = contextvars.ContextVar('current_tenant', default=None)


def get_current_tenant():
    """Get the current tenant from context variable."""
    return _tenant_var.get()


def set_current_tenant(tenant):
    """Set the current tenant in context variable."""
    _tenant_var.set(tenant)


def clear_current_tenant():
    """Clear the current tenant from context variable."""
    _tenant_var.set(None)


class TenantDatabaseRouter:
    """
    Database router that directs queries to the appropriate schema.
    
    - Authentication models (User) → public schema
    - Tenant models (School, Domain) → public schema  
    - Tenant-specific models (Student, Staff, etc.) → tenant schema
    """
    
    # Apps that should always use public schema
    PUBLIC_APPS = {
        'auth',
        'contenttypes',
        'sessions',
        'admin',
        'authentication',  # Users
        'tenants',  # School, Domain
        'core',
    }
    
    # Apps that use tenant schema
    TENANT_APPS = {
        'students',
        'staff',
        'academics',
        'attendance',
        'timetable',
        'examinations',
        'finance',
        'communication',
        'transport',
        'library',
        'admissions',
        'hostel',
        'hr_payroll',
        'reports',
        'privacy',
    }
    
    def db_for_read(self, model, **hints):
        """
        Route read operations.
        """
        # Always use default database (we handle schema switching separately)
        return 'default'
    
    def db_for_write(self, model, **hints):
        """
        Route write operations.
        """
        # Always use default database (we handle schema switching separately)
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations between objects.
        """
        # Allow all relations (we're using same database, different schemas)
        return True
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Determine if migration should run.
        """
        # Allow migrations on default database
        return db == 'default'


def switch_to_tenant_schema(tenant):
    """
    Switch the database connection to use the tenant's schema.

    Args:
        tenant: School instance or schema name string
    """
    if connection.vendor != 'postgresql':
        return  # Only works with PostgreSQL

    schema_name = tenant.schema_name if hasattr(tenant, 'schema_name') else tenant

    with connection.cursor() as cursor:
        cursor.execute(
            psycopg2_sql.SQL('SET search_path TO {}, "public"').format(
                psycopg2_sql.Identifier(schema_name)
            )
        )
        logger.debug("Switched to schema: %s, public", schema_name)


def switch_to_public_schema():
    """
    Switch the database connection back to the public schema.
    """
    if connection.vendor != 'postgresql':
        return  # Only works with PostgreSQL

    with connection.cursor() as cursor:
        cursor.execute('SET search_path TO "public"')
        logger.debug("Switched to schema: public")
