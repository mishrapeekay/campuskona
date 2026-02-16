"""
Veda Data Import Script using Django ORM

This script uses Django models to import data, which automatically handles:
- Auto-generated fields (created_at, updated_at, is_deleted, etc.)
- Default values
- Field validation
- Proper foreign key relationships

Prerequisites:
1. Create tenant via Django admin:
   - Name: Veda Test
   - Subdomain: vedatest
   - Code: VEDATEST

2. Run this script
"""

import os
import sys
import django
from pathlib import Path

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
from apps.tenants.models import School
from apps.academics.models import AcademicYear, Board, Class, Section, Subject
from uuid import UUID
from datetime import date

print("="*80)
print("VEDA DATA IMPORT - Django ORM VERSION")
print("="*80)
print()

# Configuration
TENANT_SUBDOMAIN = "vedatest"

# Step 1: Find tenant
print("[1/5] Finding tenant...")
try:
    tenant = School.objects.get(subdomain=TENANT_SUBDOMAIN)
    print(f"   ✅ Found tenant: {tenant.name}")
    print(f"   ✅ Schema: {tenant.schema_name}")
except School.DoesNotExist:
    print(f"   ❌ Tenant '{TENANT_SUBDOMAIN}' not found!")
    sys.exit(1)

# Step 2: Switch to tenant schema
print("\n[2/5] Switching to tenant schema...")
# Use raw SQL to set search_path
with connection.cursor() as cursor:
    cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')
print(f"   ✅ Switched to schema: {tenant.schema_name}")

# Step 3: Create Academic Years
print("\n[3/5] Creating Academic Years...")
try:
    # Delete existing data
    AcademicYear.objects.all().delete()

    ay1 = AcademicYear.objects.create(
        id=UUID('d6f4e305-7c15-4ea3-afeb-611508f50da4'),
        name='2024-2025',
        start_date=date(2024, 4, 1),
        end_date=date(2025, 3, 31),
        is_current=True
    )
    print(f"   ✅ Created: {ay1.name} (Current)")

    ay2 = AcademicYear.objects.create(
        id=UUID('42ff0fd8-17ec-4030-bd33-46bfac7217f0'),
        name='2023-2024',
        start_date=date(2023, 4, 1),
        end_date=date(2024, 3, 31),
        is_current=False
    )
    print(f"   ✅ Created: {ay2.name}")

except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()

# Step 4: Create Board
print("\n[4/5] Creating Board...")
try:
    # Delete existing boards
    Board.objects.all().delete()

    board = Board.objects.create(
        id=UUID('fdfcf85f-0c8d-4256-84b3-f8242c3af3f1'),
        board_name='CBSE - Central Board of Secondary Education',
        board_code='CBSE',
        board_type='NATIONAL',
        grading_system='PERCENTAGE',
        minimum_passing_percentage=33.0,
        description='Central Board of Secondary Education',
        is_active=True
    )
    print(f"   ✅ Created: {board.board_name}")

except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()

# Step 5: Create Classes
print("\n[5/5] Creating Classes...")
try:
    # Delete existing classes
    Class.objects.all().delete()

    classes_data = [
        {'id': '1da65ddc-2cfe-4f27-b901-ef760d794df8', 'name': 'LKG', 'display_name': 'LKG', 'order': 1},
        {'id': '91ce0272-1378-413f-9641-15af0afcfc38', 'name': 'UKG', 'display_name': 'UKG', 'order': 2},
        {'id': 'd905de96-4623-4ac2-b164-83006b53a257', 'name': 'Class 1', 'display_name': 'Class 1', 'order': 3},
        {'id': '66bad94f-4bc2-4e10-9e73-7213d41f79b4', 'name': 'Class 2', 'display_name': 'Class 2', 'order': 4},
        {'id': 'bcc7662f-f57c-4f78-9e63-89a56b512388', 'name': 'Class 3', 'display_name': 'Class 3', 'order': 5},
        {'id': '9d22a791-7556-4efc-8c63-70fc37917e0c', 'name': 'Class 4', 'display_name': 'Class 4', 'order': 6},
        {'id': '1304aefa-69fa-47fc-91b8-c71de6d6a0c2', 'name': 'Class 5', 'display_name': 'Class 5', 'order': 7},
        {'id': '6d3310f5-1dea-4ba9-a349-429805296a0d', 'name': 'Class 6', 'display_name': 'Class 6', 'order': 8},
        {'id': '3b2e8d8e-bbef-475a-b783-3e9e23a8db72', 'name': 'Class 7', 'display_name': 'Class 7', 'order': 9},
        {'id': '07fafe05-0e14-4f0e-ba53-a6ba3e48f2e7', 'name': 'Class 8', 'display_name': 'Class 8', 'order': 10},
        {'id': 'c3c91a95-e4d8-4bf9-87cb-ba6bc0942eff', 'name': 'Class 9', 'display_name': 'Class 9', 'order': 11},
        {'id': '7700e5a8-0eea-4a41-92bf-7ce7da25ea1a', 'name': 'Class 10', 'display_name': 'Class 10', 'order': 12},
        {'id': '1007c9eb-a9d6-4ba5-9d47-3f5b66d4af76', 'name': 'Class 11', 'display_name': 'Class 11 (Science)', 'order': 13},
        {'id': '124fde5f-cc2d-4734-a7f2-b9e673a61e7d', 'name': 'Class 12', 'display_name': 'Class 12 (Science)', 'order': 14},
    ]

    created_count = 0
    for class_data in classes_data:
        try:
            cls = Class.objects.create(
                id=UUID(class_data['id']),
                name=class_data['name'],
                display_name=class_data['display_name'],
                class_order=class_data['order'],
                board=board,
                is_active=True
            )
            created_count += 1
            print(f"   ✅ Created: {cls.display_name}")
        except Exception as e:
            print(f"   ⚠️  Error creating {class_data['name']}: {e}")

    print(f"\n   📊 Total classes created: {created_count}/14")

except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()

# Summary
print("\n" + "="*80)
print("IMPORT COMPLETE!")
print("="*80)
print(f"\n✅ Tenant: {tenant.name}")
print(f"✅ Subdomain: {tenant.subdomain}")
print(f"✅ Schema: {tenant.schema_name}")

# Verify counts
try:
    ay_count = AcademicYear.objects.count()
    board_count = Board.objects.count()
    class_count = Class.objects.count()

    print(f"\n📊 Data Summary:")
    print(f"   - Academic Years: {ay_count}")
    print(f"   - Boards: {board_count}")
    print(f"   - Classes: {class_count}")

    if ay_count == 2 and board_count == 1 and class_count == 14:
        print(f"\n✅ All basic data imported successfully!")
    else:
        print(f"\n⚠️  Some data may be missing. Please review.")

except Exception as e:
    print(f"\n⚠️  Error verifying data: {e}")

print(f"\n📝 Next Steps:")
print(f"1. Create sections for classes")
print(f"2. Create subjects")
print(f"3. Create student and staff accounts")
print(f"4. Access tenant at: http://{tenant.subdomain}.localhost:8000/")
print("\n" + "="*80)
