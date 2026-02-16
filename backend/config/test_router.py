"""
Test-compatible database router that replaces django_tenants.routers.TenantSyncRouter.

In the test environment (SQLite), there are no PostgreSQL schemas, so the
standard TenantSyncRouter fails with 'DatabaseWrapper has no attribute schema_name'.
This router allows all migrations on the default database.
"""


class TestTenantSyncRouter:
    """Allow all models to migrate and be used on the default database."""

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return True

    def db_for_read(self, model, **hints):
        return 'default'

    def db_for_write(self, model, **hints):
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        return True
