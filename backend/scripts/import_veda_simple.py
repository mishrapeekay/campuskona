"""
Simple Veda Data Import Script

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

# Setup Django
sys.path.append(str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
from apps.tenants.models import School

print("="*80)
print("VEDA DATA IMPORT - SIMPLE VERSION")
print("="*80)
print()

# Configuration
TENANT_SUBDOMAIN = "vedatest"
SQL_FILE = "G:/School Mgmt System/mock_data/Veda_files/veda_vidyalaya_schema_inserts.sql"

# Step 1: Find tenant
print("[1/3] Finding tenant...")
try:
    tenant = School.objects.get(subdomain=TENANT_SUBDOMAIN)
    print(f"   ✅ Found tenant: {tenant.name}")
    print(f"   ✅ Schema: {tenant.schema_name}")
except School.DoesNotExist:
    print(f"   ❌ Tenant '{TENANT_SUBDOMAIN}' not found!")
    print()
    print("Please create the tenant first:")
    print("1. Go to http://localhost:8000/admin/")
    print("2. Login as superadmin")
    print("3. Go to Tenants → Schools → Add School")
    print("4. Fill in:")
    print("   - Name: Veda Test")
    print("   - Code: VEDATEST")
    print("   - Subdomain: vedatest")
    print("   - Email: admin@vedatest.com")
    print("   - Phone: +91-9876543210")
    print("   - Address: Gwalior, MP")
    print("   - City: Gwalior")
    print("   - State: Madhya Pradesh")
    print("   - Pincode: 474001")
    print("   - Select a subscription plan")
    print("5. Save")
    print()
    print("Then run this script again.")
    sys.exit(1)

# Step 2: Import SQL data
print("\n[2/3] Importing data from SQL file...")
try:
    with connection.cursor() as cursor:
        # Switch to tenant schema
        cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')
        print(f"   Switched to schema: {tenant.schema_name}")
        
        # Read SQL file
        with open(SQL_FILE, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        print(f"   Executing SQL inserts...")
        # Execute in transaction
        cursor.execute("BEGIN;")
        cursor.execute(sql_content)
        cursor.execute("COMMIT;")
        
        print(f"   ✅ Data imported successfully")
except Exception as e:
    print(f"   ❌ Error importing data: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 3: Verify data
print("\n[3/3] Verifying imported data...")
try:
    with connection.cursor() as cursor:
        cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')
        
        # Count records
        tables = {
            'academic_years': 2,
            'classes': 14,
            'sections': 35,
            'subjects': 18,
        }
        
        print()
        for table, expected in tables.items():
            try:
                cursor.execute(f'SELECT COUNT(*) FROM {table}')
                count = cursor.fetchone()[0]
                status = "✅" if count == expected else "⚠️"
                print(f"   {status} {table}: {count} records (expected: {expected})")
            except Exception as e:
                print(f"   ❌ {table}: Error - {e}")
        
        print()
        print("   Note: User accounts (students, staff, parents) need to be")
        print("   created separately in the public.users table.")
        
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
print(f"1. Create user accounts for students and staff")
print(f"2. Test login via web/mobile app")
print(f"3. Verify all data is accessible")
print("\n" + "="*80)
