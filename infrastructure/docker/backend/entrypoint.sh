#!/bin/bash
# =============================================================================
# Docker entrypoint for Django backend (production)
#
# Runs migrate_schemas on startup so every migration is always applied to:
#   - public schema
#   - all real tenant schemas (excluding demo tenants)
#
# Demo tenants (schema names containing "demo") are deliberately skipped
# so their data stays frozen for presentation purposes.
# =============================================================================

set -e

echo "[entrypoint] Waiting for database to be ready..."
until python -c "
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
django.setup()
from django.db import connection
connection.ensure_connection()
print('DB ready')
" 2>/dev/null; do
  echo "[entrypoint] Database not ready, retrying in 2s..."
  sleep 2
done

echo "[entrypoint] Running migrations on public schema..."
python manage.py migrate_schemas --schema=public --no-input

echo "[entrypoint] Running migrations on all non-demo tenant schemas..."
python manage.py shell -c "
import django
from django_tenants.utils import get_tenant_model
TenantModel = get_tenant_model()

# Get all tenant schemas, skip any with 'demo' in the schema name
tenants = TenantModel.objects.exclude(schema_name='public')
skip_patterns = ['demo']

for tenant in tenants:
    schema = tenant.schema_name
    if any(pattern in schema.lower() for pattern in skip_patterns):
        print(f'[entrypoint] Skipping demo tenant: {schema}')
        continue
    print(f'[entrypoint] Migrating tenant: {schema}')
    import subprocess
    result = subprocess.run(
        ['python', 'manage.py', 'migrate_schemas', f'--schema={schema}', '--no-input'],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f'[entrypoint] WARNING: Migration failed for {schema}:')
        print(result.stderr)
    else:
        print(f'[entrypoint] Done: {schema}')
"

echo "[entrypoint] All migrations complete. Starting gunicorn..."
exec "$@"
