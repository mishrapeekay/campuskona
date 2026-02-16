"""
Fixed Veda Data Import Script

This script properly handles Django model fields including timestamps.

Prerequisites:
1. Create tenant via Django admin first:
   - Name: Veda Test
   - Subdomain: vedatest
   - Code: VEDATEST

2. Run this script to import data
"""

import os
import sys
import django
from pathlib import Path
from datetime import datetime

# Fix Windows console encoding
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Setup Django
sys.path.append(str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
from django.utils import timezone
from apps.tenants.models import School

print("="*80)
print("VEDA DATA IMPORT - FIXED VERSION")
print("="*80)
print()

# Configuration
TENANT_SUBDOMAIN = "vedatest"
SQL_FILE = "G:/School Mgmt System/mock_data/Veda_files/veda_vidyalaya_schema_inserts.sql"

# Step 1: Find tenant
print("[1/4] Finding tenant...")
try:
    tenant = School.objects.get(subdomain=TENANT_SUBDOMAIN)
    print(f"   ✅ Found tenant: {tenant.name}")
    print(f"   ✅ Schema: {tenant.schema_name}")
except School.DoesNotExist:
    print(f"   ❌ Tenant '{TENANT_SUBDOMAIN}' not found!")
    print()
    print("Please create the tenant first via Django admin.")
    sys.exit(1)

# Step 2: Read and modify SQL
print("\n[2/4] Processing SQL file...")
try:
    with open(SQL_FILE, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    print(f"   ✅ Read SQL file ({len(sql_content)} characters)")
except Exception as e:
    print(f"   ❌ Error reading SQL file: {e}")
    sys.exit(1)

# Step 3: Add timestamp columns to INSERT statements
print("\n[3/4] Fixing timestamp fields...")
try:
    import re

    # Get current timestamp in PostgreSQL format
    now = timezone.now().strftime('%Y-%m-%d %H:%M:%S.%f')

    # Track modifications
    modifications = [0]  # Use list to avoid nonlocal issues

    # Pattern to match INSERT statements
    # This pattern matches: INSERT INTO table_name (columns) VALUES (values);
    pattern = r"INSERT INTO (\w+) \(([^)]+)\) VALUES\s*\(([^)]+)\);"

    def fix_insert(match):
        table_name = match.group(1)
        columns = match.group(2)
        values = match.group(3)

        # Skip if already has created_at
        if 'created_at' in columns.lower():
            return match.group(0)

        # Add timestamp columns (required by BaseModel)
        modified_columns = columns + ", created_at, updated_at"
        modified_values = values + f", '{now}', '{now}'"

        # Add soft delete columns (required by SoftDeleteModel)
        # Most tenant models inherit from SoftDeleteModel
        modified_columns += ", is_deleted, deleted_at"
        modified_values += ", FALSE, NULL"

        modifications[0] += 1
        return f"INSERT INTO {table_name} ({modified_columns}) VALUES ({modified_values});"

    # Apply fixes
    fixed_sql = re.sub(pattern, fix_insert, sql_content, flags=re.IGNORECASE)

    print(f"   ✅ Modified {modifications[0]} INSERT statements")
    print(f"   ✅ Added created_at and updated_at timestamps")

except Exception as e:
    print(f"   ❌ Error fixing SQL: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 4: Import fixed SQL data
print("\n[4/4] Importing data to database...")
try:
    with connection.cursor() as cursor:
        # Switch to tenant schema
        cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')
        print(f"   Switched to schema: {tenant.schema_name}")

        # Execute in transaction
        print(f"   Executing SQL inserts...")
        cursor.execute("BEGIN;")

        # Split SQL into individual statements and execute
        statements = [s.strip() for s in fixed_sql.split(';') if s.strip() and not s.strip().startswith('--')]

        executed = 0
        for statement in statements:
            if statement.upper().startswith('INSERT INTO'):
                try:
                    cursor.execute(statement + ';')
                    executed += 1
                except Exception as e:
                    print(f"   ⚠️  Error in statement: {statement[:100]}...")
                    print(f"      Error: {e}")
                    # Continue with other statements

        cursor.execute("COMMIT;")
        print(f"   ✅ Successfully executed {executed} INSERT statements")

except Exception as e:
    print(f"   ❌ Error importing data: {e}")
    import traceback
    traceback.print_exc()

    # Rollback on error
    try:
        with connection.cursor() as cursor:
            cursor.execute("ROLLBACK;")
    except:
        pass

    sys.exit(1)

# Step 5: Verify data
print("\n[5/5] Verifying imported data...")
try:
    with connection.cursor() as cursor:
        cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')

        # Count records in key tables
        tables = [
            'academic_years',
            'classes',
            'sections',
            'subjects',
        ]

        print()
        total_records = 0
        for table in tables:
            try:
                cursor.execute(f'SELECT COUNT(*) FROM {table}')
                count = cursor.fetchone()[0]
                total_records += count
                print(f"   ✅ {table}: {count} records")
            except Exception as e:
                print(f"   ⚠️  {table}: {e}")

        print(f"\n   📊 Total records imported: {total_records}")

except Exception as e:
    print(f"   ❌ Error verifying data: {e}")

# Summary
print("\n" + "="*80)
print("IMPORT COMPLETE!")
print("="*80)
print(f"\n✅ Tenant: {tenant.name}")
print(f"✅ Subdomain: {tenant.subdomain}")
print(f"✅ Schema: {tenant.schema_name}")
print(f"\n📝 Next Steps:")
print(f"1. Access tenant at: http://{tenant.subdomain}.localhost:8000/")
print(f"2. Create user accounts for students and staff")
print(f"3. Test login and verify data accessibility")
print("\n" + "="*80)
