"""
Veda Vidyalaya - Create Sample Data (Transport, Library, Communication, Examinations)

This script creates sample data for testing since the Excel structure doesn't match Django models.
"""

import os
import sys
import django
from pathlib import Path
from datetime import datetime, date, timedelta, time
import random
from uuid import uuid4

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
from apps.academics.models import AcademicYear

print("="*80)
print("VEDA VIDYALAYA - CREATE SAMPLE DATA")
print("="*80)
print()

# Statistics
stats = {
    'vehicles': 0,
    'routes': 0,
    'stops': 0,
    'categories': 0,
    'authors': 0,
    'books': 0,
    'notices': 0,
    'exams': 0,
}

# Find tenant
print("[1/6] Finding tenant...")
tenant = School.objects.get(subdomain="vedatest")
print(f"   ✅ {tenant.name} ({tenant.schema_name})")

# Switch schema
print("\n[2/6] Switching to tenant schema...")
with connection.cursor() as cursor:
    cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')
print(f"   ✅ Schema: {tenant.schema_name}")

# Get current academic year
current_ay = AcademicYear.objects.filter(is_current=True).first()

# Create Transport Data
print("\n[3/6] Creating transport data...")
try:
    from apps.transport.models import Vehicle, Route, Stop

    # Clear existing
    Stop.objects.all().delete()
    Route.objects.all().delete()
    Vehicle.objects.all().delete()

    # Create Vehicles
    print("   → Creating vehicles...")
    vehicles_data = [
        {"reg": "MP-07-GH-1460", "model": "School Bus", "capacity": 40},
        {"reg": "MP-07-EF-4676", "model": "School Van", "capacity": 20},
        {"reg": "MP-07-AB-1234", "model": "School Bus", "capacity": 40},
        {"reg": "MP-07-CD-5678", "model": "School Van", "capacity": 20},
        {"reg": "MP-07-XY-9012", "model": "School Bus", "capacity": 40},
    ]

    vehicles = []
    for v_data in vehicles_data:
        vehicle = Vehicle.objects.create(
            registration_number=v_data["reg"],
            model=v_data["model"],
            capacity=v_data["capacity"],
            status='ACTIVE',
            insurance_expiry=date.today() + timedelta(days=365),
            last_service_date=date.today() - timedelta(days=30)
        )
        vehicles.append(vehicle)
        stats['vehicles'] += 1

    print(f"      ✅ Created {stats['vehicles']} vehicles")

    # Create Routes
    print("   → Creating routes...")
    routes_data = [
        {"name": "Route 1 - North Zone", "start": "North Gate", "end": "School", "fare": 1000},
        {"name": "Route 2 - South Zone", "start": "South Gate", "end": "School", "fare": 1200},
        {"name": "Route 3 - East Zone", "start": "East Gate", "end": "School", "fare": 1100},
        {"name": "Route 4 - West Zone", "start": "West Gate", "end": "School", "fare": 1300},
        {"name": "Route 5 - Central Zone", "start": "Central Square", "end": "School", "fare": 900},
    ]

    routes = []
    for idx, r_data in enumerate(routes_data):
        route = Route.objects.create(
            name=r_data["name"],
            start_point=r_data["start"],
            end_point=r_data["end"],
            fare=r_data["fare"],
            vehicle=vehicles[idx]
        )
        routes.append(route)
        stats['routes'] += 1

    print(f"      ✅ Created {stats['routes']} routes")

    # Create Stops
    print("   → Creating stops...")
    stops_data = [
        # Route 1 stops
        {"route_idx": 0, "name": "Gandhi Nagar", "seq": 1, "time": time(7, 0), "fare": 300},
        {"route_idx": 0, "name": "MG Road", "seq": 2, "time": time(7, 10), "fare": 400},
        {"route_idx": 0, "name": "Station Road", "seq": 3, "time": time(7, 20), "fare": 500},
        # Route 2 stops
        {"route_idx": 1, "name": "South Extension", "seq": 1, "time": time(7, 5), "fare": 350},
        {"route_idx": 1, "name": "Green Park", "seq": 2, "time": time(7, 15), "fare": 450},
        # Route 3 stops
        {"route_idx": 2, "name": "Nehru Nagar", "seq": 1, "time": time(7, 0), "fare": 300},
        {"route_idx": 2, "name": "Model Town", "seq": 2, "time": time(7, 12), "fare": 400},
    ]

    for s_data in stops_data:
        Stop.objects.create(
            route=routes[s_data["route_idx"]],
            name=s_data["name"],
            sequence_order=s_data["seq"],
            arrival_time=s_data["time"],
            pickup_fare=s_data["fare"]
        )
        stats['stops'] += 1

    print(f"      ✅ Created {stats['stops']} stops")
    print(f"   ✅ Transport data created successfully")

except Exception as e:
    print(f"   ⚠️  Transport creation error: {e}")
    import traceback
    traceback.print_exc()

# Create Library Data
print("\n[4/6] Creating library data...")
try:
    from apps.library.models import Category, Author, Book

    # Clear existing
    Book.objects.all().delete()
    Author.objects.all().delete()
    Category.objects.all().delete()

    # Create Categories
    print("   → Creating categories...")
    categories_data = [
        {"name": "Fiction", "desc": "Fictional stories and novels"},
        {"name": "Science", "desc": "Science textbooks and reference"},
        {"name": "Mathematics", "desc": "Mathematics books"},
        {"name": "History", "desc": "History and social studies"},
        {"name": "Biography", "desc": "Biographical works"},
        {"name": "General Knowledge", "desc": "General knowledge and quiz books"},
    ]

    categories = {}
    for c_data in categories_data:
        category = Category.objects.create(
            name=c_data["name"],
            description=c_data["desc"]
        )
        categories[c_data["name"]] = category
        stats['categories'] += 1

    print(f"      ✅ Created {stats['categories']} categories")

    # Create Authors
    print("   → Creating authors...")
    authors_data = [
        "R.K. Narayan", "Ruskin Bond", "Rabindranath Tagore",
        "APJ Abdul Kalam", "Stephen Hawking", "Carl Sagan",
        "Ramanujan", "Aryabhata", "Vikram Seth"
    ]

    authors = {}
    for author_name in authors_data:
        author = Author.objects.create(
            name=author_name,
            bio=f"Biography of {author_name}"
        )
        authors[author_name] = author
        stats['authors'] += 1

    print(f"      ✅ Created {stats['authors']} authors")

    # Create Books
    print("   → Creating books...")
    books_data = [
        {"title": "Malgudi Days", "author": "R.K. Narayan", "category": "Fiction", "isbn": "978-0140183535", "year": 1982, "qty": 5},
        {"title": "The Room on the Roof", "author": "Ruskin Bond", "category": "Fiction", "isbn": "978-0143333654", "year": 1956, "qty": 3},
        {"title": "Gitanjali", "author": "Rabindranath Tagore", "category": "Fiction", "isbn": "978-8129115010", "year": 1910, "qty": 4},
        {"title": "Wings of Fire", "author": "APJ Abdul Kalam", "category": "Biography", "isbn": "978-8173711466", "year": 1999, "qty": 10},
        {"title": "A Brief History of Time", "author": "Stephen Hawking", "category": "Science", "isbn": "978-0553380163", "year": 1988, "qty": 3},
        {"title": "Cosmos", "author": "Carl Sagan", "category": "Science", "isbn": "978-0345331359", "year": 1980, "qty": 2},
        {"title": "The Man Who Knew Infinity", "author": "Ramanujan", "category": "Biography", "isbn": "978-0671750619", "year": 1991, "qty": 2},
        {"title": "A Suitable Boy", "author": "Vikram Seth", "category": "Fiction", "isbn": "978-0060977214", "year": 1993, "qty": 3},
    ]

    for b_data in books_data:
        Book.objects.create(
            title=b_data["title"],
            author=authors[b_data["author"]],
            category=categories[b_data["category"]],
            isbn=b_data["isbn"],
            publication_year=b_data["year"],
            quantity=b_data["qty"],
            available_copies=b_data["qty"],
            location=f"Shelf-{random.randint(1, 20)}"
        )
        stats['books'] += 1

    print(f"      ✅ Created {stats['books']} books")
    print(f"   ✅ Library data created successfully")

except Exception as e:
    print(f"   ⚠️  Library creation error: {e}")
    import traceback
    traceback.print_exc()

# Create Communication Data
print("\n[5/6] Creating communication data...")
try:
    from apps.communication.models import Notice
    from apps.authentication.models import User

    # Get admin user
    admin_user = User.objects.filter(user_type='SCHOOL_ADMIN').first()

    # Clear existing
    Notice.objects.all().delete()

    # Create Notices
    print("   → Creating notices...")
    notices_data = [
        {
            "title": "Annual Day Celebration",
            "content": "The Annual Day celebration will be held on March 15th, 2026. All students are requested to attend with their parents.",
            "audience": "ALL",
            "priority": "HIGH"
        },
        {
            "title": "Parent-Teacher Meeting",
            "content": "PTM scheduled for February 20th, 2026. Parents are requested to meet respective class teachers.",
            "audience": "PARENTS",
            "priority": "MEDIUM"
        },
        {
            "title": "Sports Day Event",
            "content": "Sports Day will be conducted on February 28th, 2026. Participants should report by 8:00 AM.",
            "audience": "STUDENTS",
            "priority": "MEDIUM"
        },
        {
            "title": "Mid-Term Examination Schedule",
            "content": "Mid-term exams will commence from March 1st, 2026. Detailed timetable will be shared soon.",
            "audience": "ALL",
            "priority": "HIGH"
        },
        {
            "title": "Library Timing Update",
            "content": "Library will remain open from 8:00 AM to 6:00 PM on all working days.",
            "audience": "STUDENTS",
            "priority": "LOW"
        },
    ]

    for n_data in notices_data:
        Notice.objects.create(
            title=n_data["title"],
            content=n_data["content"],
            target_audience=n_data["audience"],
            priority=n_data["priority"],
            posted_by=admin_user,
            is_published=True,
            display_until=date.today() + timedelta(days=30)
        )
        stats['notices'] += 1

    print(f"      ✅ Created {stats['notices']} notices")
    print(f"   ✅ Communication data created successfully")

except Exception as e:
    print(f"   ⚠️  Communication creation error: {e}")
    import traceback
    traceback.print_exc()

# Create Examination Data
print("\n[6/6] Creating examination data...")
try:
    from apps.examinations.models import Examination

    # Clear existing
    Examination.objects.all().delete()

    # Create Examinations
    print("   → Creating examinations...")
    exams_data = [
        {
            "name": "First Term Examination",
            "type": "TERM",
            "start": date(2025, 7, 1),
            "end": date(2025, 7, 15),
            "result": date(2025, 7, 30),
            "status": "COMPLETED"
        },
        {
            "name": "Mid-Term Examination",
            "type": "MID_TERM",
            "start": date(2026, 3, 1),
            "end": date(2026, 3, 10),
            "result": date(2026, 3, 25),
            "status": "UPCOMING"
        },
        {
            "name": "Final Term Examination",
            "type": "FINAL",
            "start": date(2026, 5, 1),
            "end": date(2026, 5, 20),
            "result": date(2026, 6, 10),
            "status": "UPCOMING"
        },
        {
            "name": "Unit Test 1",
            "type": "UNIT_TEST",
            "start": date(2025, 8, 15),
            "end": date(2025, 8, 20),
            "result": date(2025, 8, 25),
            "status": "COMPLETED"
        },
    ]

    for e_data in exams_data:
        Examination.objects.create(
            name=e_data["name"],
            exam_type=e_data["type"],
            academic_year=current_ay,
            grade_scale='PERCENTAGE',
            start_date=e_data["start"],
            end_date=e_data["end"],
            result_date=e_data["result"],
            status=e_data["status"],
            description=f"Details for {e_data['name']}",
            is_published=True
        )
        stats['exams'] += 1

    print(f"      ✅ Created {stats['exams']} examinations")
    print(f"   ✅ Examination data created successfully")

except Exception as e:
    print(f"   ⚠️  Examination creation error: {e}")
    import traceback
    traceback.print_exc()

# Summary
print("\n" + "="*80)
print("SAMPLE DATA CREATION COMPLETE!")
print("="*80)

total = sum(stats.values())
print(f"\n📊 New Records Created: {total:,}")
print()

for key, value in stats.items():
    if value > 0:
        print(f"   {key.replace('_', ' ').title()}: {value:,}")

print("\n" + "="*80)
print("COMBINED TOTALS (Including Academic Structure from Step 1)")
print("="*80)
print()
print("✅ Academic Structure (Step 1): 79 records")
print("   - Academic Years: 2")
print("   - Education Board: 1 (CBSE)")
print("   - Classes: 14 (LKG to Class 12)")
print("   - Sections: 35")
print("   - Subjects: 27")
print()
print(f"✅ Additional Data (Step 2): {total} records")
print(f"   - Transport: {stats['vehicles'] + stats['routes'] + stats['stops']} records")
print(f"   - Library: {stats['categories'] + stats['authors'] + stats['books']} records")
print(f"   - Communication: {stats['notices']} records")
print(f"   - Examinations: {stats['exams']} records")
print()
print(f"✅ GRAND TOTAL: {79 + total} records")
print()
print("="*80)
print("🎉 VEDA TEST TENANT READY FOR TESTING!")
print("="*80)
print()
print("📝 Test the following modules:")
print()
print("1. 📚 Academic Management:")
print("   - View Classes (LKG to Class 12)")
print("   - View Sections (35 sections)")
print("   - View Subjects (27 subjects)")
print("   - Manage Academic Years")
print()
print("2. 🚌 Transport Management:")
print(f"   - {stats['vehicles']} Vehicles")
print(f"   - {stats['routes']} Routes with fare structure")
print(f"   - {stats['stops']} Stops with timing")
print()
print("3. 📖 Library Management:")
print(f"   - {stats['categories']} Categories")
print(f"   - {stats['authors']} Authors")
print(f"   - {stats['books']} Books with ISBN")
print()
print("4. 📢 Communication:")
print(f"   - {stats['notices']} Notices for different audiences")
print()
print("5. 📝 Examinations:")
print(f"   - {stats['exams']} Examinations scheduled")
print()
print("="*80)
print("LOGIN CREDENTIALS")
print("="*80)
print()
print("Frontend URL: http://localhost:3000")
print()
print("Admin Account:")
print("  Email:    admin@veda.com")
print("  Password: admin123")
print()
print("Super Admin (Django Admin):")
print("  URL:      http://127.0.0.1:8000/admin/")
print("  Email:    superadmin@schoolmgmt.com")
print("  Password: SuperAdmin@123")
print()
print("="*80)
