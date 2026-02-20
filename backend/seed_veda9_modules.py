"""
Seed script: Populates Veda9 tenant with demo data for empty sub-modules.
Run via: docker exec school_mgmt_backend_prod python /app/seed_veda9_modules.py

Modules seeded:
- Lesson Plans (10 plans across subjects/sections)
- Syllabus Units (8 units per subject x 3 subjects)
- HR Departments + Designations + Salary Components
- Hostel + Rooms
- Student + Staff Leave Requests
"""
import os
import sys
import django
import random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
django.setup()

from django_tenants.utils import schema_context

SCHEMA = 'tenant_veda_v9'
ACADEMIC_YEAR_ID = '4c1df336-619e-43ad-9eba-e67df04947e9'  # 2024-2025

SUBJECT_IDS = {
    'Mathematics': 'c6e9871b-2eac-4a1c-b0c2-8071d9a254a8',
    'Science': '0e6ee1b4-bfa2-4a94-95ac-d2e698ac9165',
    'English': 'a2b65ed7-962e-432d-83c2-3814af475d19',
    'Hindi': '8e95a410-a511-4e00-b269-885bd4919814',
    'Social Science': '620f671e-2913-4f8e-8a4f-8f02a852b32b',
    'Physics': '6c920a83-bb63-4400-818d-b7b6cc153f0a',
    'Chemistry': 'd383fabf-286e-408f-af1b-2d2ba1dd107d',
    'Biology': '762ac15d-576e-4b73-b3fc-95612a24bf96',
    'Computer Science': '13993a57-5e4f-4835-b402-fabb7642ac6d',
    'EVS': 'f7e2152d-a399-4f1c-aece-726316aaecb7',
}


def seed_syllabus_units():
    """Seed SyllabusUnit records (required before LessonPlanItems)."""
    from apps.academics.models import SyllabusUnit, AcademicYear, Class, Subject

    ay = AcademicYear.objects.get(id=ACADEMIC_YEAR_ID)

    # SyllabusUnit uses class_instance, not section
    classes = list(Class.objects.all()[:5])
    if not classes:
        print('  ERROR: No classes found')
        return []

    units_data = {
        'Mathematics': [
            (1, 'Number System', 'Real numbers, rational and irrational numbers and their properties.', 8, 20),
            (2, 'Algebra', 'Polynomials, linear equations, quadratic equations and applications.', 10, 25),
            (3, 'Geometry', 'Lines, angles, triangles, congruence and similarity theorems.', 12, 30),
            (4, 'Statistics & Probability', 'Mean, median, mode, data representation and basic probability.', 6, 15),
        ],
        'Science': [
            (1, 'Matter and Its Nature', 'States of matter, atoms, molecules and their properties.', 8, 20),
            (2, 'Life Processes', 'Nutrition, respiration, transportation in living organisms.', 10, 25),
            (3, 'Electricity and Magnetism', 'Electric current, circuits, Ohm law and magnetic effects.', 8, 20),
            (4, 'Light and Optics', 'Reflection, refraction, lenses and mirror formula.', 8, 20),
        ],
        'English': [
            (1, 'Prose Literature', 'Reading and analysis of selected prose passages from textbook.', 10, 25),
            (2, 'Poetry Appreciation', 'Understanding and appreciation of selected poems.', 8, 20),
            (3, 'Grammar and Language Use', 'Tenses, voice, narration and sentence transformation.', 10, 25),
            (4, 'Writing Skills', 'Essay, letter, report and notice writing.', 8, 20),
        ],
    }

    created = 0
    units_map = {}

    for subj_name, units in units_data.items():
        subj_id = SUBJECT_IDS.get(subj_name)
        if not subj_id:
            continue
        subj = Subject.objects.filter(id=subj_id).first()
        if not subj:
            continue
        cls = classes[0]
        subj_units = []
        for unit_number, title, description, hours, weightage in units:
            obj, flag = SyllabusUnit.objects.get_or_create(
                subject=subj,
                class_instance=cls,
                unit_number=unit_number,
                defaults={
                    'title': title,
                    'description': description,
                    'learning_objectives': f'Students will understand {title.lower()} and apply concepts effectively.',
                    'expected_hours': Decimal(str(hours)),
                    'weightage': Decimal(str(weightage)),
                }
            )
            subj_units.append(obj)
            if flag:
                created += 1
        units_map[subj_name] = subj_units

    print(f'  Syllabus Units: created {created} units')
    return units_map


def seed_lesson_plans(units_map):
    """Seed LessonPlan + LessonPlanItem records."""
    from apps.academics.models import LessonPlan, LessonPlanItem, AcademicYear, Section, Subject
    from apps.staff.models import StaffMember

    ay = AcademicYear.objects.get(id=ACADEMIC_YEAR_ID)
    sections = list(Section.objects.all()[:10])
    staff_members = list(StaffMember.objects.all()[:5])

    if not sections:
        print('  ERROR: No sections found')
        return
    if not staff_members:
        print('  ERROR: No staff found')
        return

    lesson_data = [
        {
            'subject_name': 'Mathematics',
            'start_date': date(2024, 6, 10),
            'end_date': date(2024, 6, 28),
            'status': 'APPROVED',
            'remarks': 'Covering Unit 1 and Unit 2 in Term 1.',
            'items': [
                ('Introduction to Real Numbers', date(2024, 6, 10), 'COMPLETED', date(2024, 6, 10)),
                ('Rational and Irrational Numbers', date(2024, 6, 13), 'COMPLETED', date(2024, 6, 13)),
                ('Linear Equations in One Variable', date(2024, 6, 17), 'COMPLETED', date(2024, 6, 17)),
                ('Word Problems on Linear Equations', date(2024, 6, 20), 'IN_PROGRESS', None),
                ('Introduction to Quadratic Equations', date(2024, 6, 24), 'PENDING', None),
            ],
        },
        {
            'subject_name': 'Science',
            'start_date': date(2024, 6, 12),
            'end_date': date(2024, 7, 5),
            'status': 'APPROVED',
            'remarks': 'Term 1 science plan covering matter and life processes.',
            'items': [
                ('States of Matter', date(2024, 6, 12), 'COMPLETED', date(2024, 6, 12)),
                ('Atoms and Molecules', date(2024, 6, 15), 'COMPLETED', date(2024, 6, 15)),
                ('Cell Structure', date(2024, 6, 19), 'COMPLETED', date(2024, 6, 19)),
                ('Photosynthesis', date(2024, 6, 22), 'IN_PROGRESS', None),
                ('Respiration in Organisms', date(2024, 6, 26), 'PENDING', None),
            ],
        },
        {
            'subject_name': 'English',
            'start_date': date(2024, 6, 15),
            'end_date': date(2024, 7, 10),
            'status': 'APPROVED',
            'remarks': 'Prose, poetry and grammar for Term 1.',
            'items': [
                ('The Lost Child - Prose', date(2024, 6, 15), 'COMPLETED', date(2024, 6, 15)),
                ('The Road Not Taken - Poetry', date(2024, 6, 19), 'COMPLETED', date(2024, 6, 19)),
                ('Active and Passive Voice', date(2024, 6, 22), 'COMPLETED', date(2024, 6, 22)),
                ('Direct and Indirect Speech', date(2024, 6, 26), 'IN_PROGRESS', None),
                ('Essay Writing Practice', date(2024, 7, 1), 'PENDING', None),
            ],
        },
        {
            'subject_name': 'Physics',
            'start_date': date(2024, 7, 1),
            'end_date': date(2024, 7, 25),
            'status': 'DRAFT',
            'remarks': 'Planned for Term 2 — pending approval.',
            'items': [
                ("Newton's First Law of Motion", date(2024, 7, 1), 'PENDING', None),
                ("Newton's Second Law and F=ma", date(2024, 7, 5), 'PENDING', None),
                ("Newton's Third Law and Examples", date(2024, 7, 8), 'PENDING', None),
                ('Friction and its Types', date(2024, 7, 12), 'PENDING', None),
                ('Gravitational Force', date(2024, 7, 16), 'PENDING', None),
            ],
        },
        {
            'subject_name': 'Social Science',
            'start_date': date(2024, 6, 20),
            'end_date': date(2024, 7, 15),
            'status': 'APPROVED',
            'remarks': 'Indian Freedom Movement — Term 1 History.',
            'items': [
                ('Revolt of 1857', date(2024, 6, 20), 'COMPLETED', date(2024, 6, 20)),
                ('Gandhian Era and Non-Cooperation', date(2024, 6, 25), 'COMPLETED', date(2024, 6, 25)),
                ('Civil Disobedience Movement', date(2024, 6, 29), 'COMPLETED', date(2024, 6, 29)),
                ('Quit India Movement', date(2024, 7, 3), 'IN_PROGRESS', None),
                ('Partition and Independence', date(2024, 7, 8), 'PENDING', None),
            ],
        },
        {
            'subject_name': 'Computer Science',
            'start_date': date(2024, 6, 10),
            'end_date': date(2024, 7, 20),
            'status': 'APPROVED',
            'remarks': 'Computer fundamentals and introduction to programming.',
            'items': [
                ('Hardware Components', date(2024, 6, 10), 'COMPLETED', date(2024, 6, 10)),
                ('Input/Output Devices', date(2024, 6, 13), 'COMPLETED', date(2024, 6, 13)),
                ('Operating Systems', date(2024, 6, 17), 'COMPLETED', date(2024, 6, 17)),
                ('Introduction to Python', date(2024, 6, 21), 'IN_PROGRESS', None),
                ('Variables and Data Types', date(2024, 6, 25), 'PENDING', None),
            ],
        },
        {
            'subject_name': 'Chemistry',
            'start_date': date(2024, 7, 5),
            'end_date': date(2024, 8, 1),
            'status': 'SUBMITTED',
            'remarks': 'Chemical bonding unit awaiting HOD approval.',
            'items': [
                ('Types of Chemical Bonds', date(2024, 7, 5), 'PENDING', None),
                ('Ionic Bond Formation', date(2024, 7, 9), 'PENDING', None),
                ('Covalent Bond and Properties', date(2024, 7, 12), 'PENDING', None),
                ('Intermolecular Forces', date(2024, 7, 16), 'PENDING', None),
            ],
        },
        {
            'subject_name': 'Biology',
            'start_date': date(2024, 6, 18),
            'end_date': date(2024, 7, 12),
            'status': 'APPROVED',
            'remarks': 'Human body systems for Class 10 biology.',
            'items': [
                ('Digestive System Overview', date(2024, 6, 18), 'COMPLETED', date(2024, 6, 18)),
                ('Digestive Enzymes', date(2024, 6, 21), 'COMPLETED', date(2024, 6, 21)),
                ('Respiratory System', date(2024, 6, 25), 'COMPLETED', date(2024, 6, 25)),
                ('Circulatory System', date(2024, 6, 29), 'IN_PROGRESS', None),
                ('Excretory System', date(2024, 7, 5), 'PENDING', None),
            ],
        },
        {
            'subject_name': 'Hindi',
            'start_date': date(2024, 6, 12),
            'end_date': date(2024, 7, 8),
            'status': 'APPROVED',
            'remarks': 'Hindi prose and grammar for Term 1.',
            'items': [
                ('Premchand ki Kahaniyan', date(2024, 6, 12), 'COMPLETED', date(2024, 6, 12)),
                ('Sahitya Lahari Paath', date(2024, 6, 16), 'COMPLETED', date(2024, 6, 16)),
                ('Sandhi Viched', date(2024, 6, 20), 'IN_PROGRESS', None),
                ('Samaas Parichay', date(2024, 6, 24), 'PENDING', None),
            ],
        },
        {
            'subject_name': 'EVS',
            'start_date': date(2024, 6, 15),
            'end_date': date(2024, 7, 5),
            'status': 'APPROVED',
            'remarks': 'Environmental studies — ecosystems and conservation.',
            'items': [
                ('Ecosystems and Food Chains', date(2024, 6, 15), 'COMPLETED', date(2024, 6, 15)),
                ('Types of Pollution', date(2024, 6, 19), 'COMPLETED', date(2024, 6, 19)),
                ('Conservation of Natural Resources', date(2024, 6, 23), 'COMPLETED', date(2024, 6, 23)),
            ],
        },
    ]

    created = 0
    for i, data in enumerate(lesson_data):
        subj_id = SUBJECT_IDS.get(data['subject_name'])
        if not subj_id:
            continue
        subj = Subject.objects.filter(id=subj_id).first()
        if not subj:
            continue
        section = sections[i % len(sections)]
        teacher = staff_members[i % len(staff_members)]

        plan, flag = LessonPlan.objects.get_or_create(
            subject=subj,
            section=section,
            academic_year=ay,
            start_date=data['start_date'],
            defaults={
                'teacher': teacher,
                'end_date': data['end_date'],
                'status': data['status'],
                'remarks': data['remarks'],
            }
        )
        if flag:
            created += 1
            for order, (topic, planned_date, status, completion_date) in enumerate(data['items'], 1):
                LessonPlanItem.objects.create(
                    lesson_plan=plan,
                    topic=topic,
                    planned_date=planned_date,
                    status=status,
                    completion_date=completion_date,
                    resources_used='Textbook, Whiteboard, Charts' if status == 'COMPLETED' else '',
                    homework='Complete exercises 1-5' if status in ('COMPLETED', 'IN_PROGRESS') else '',
                )

    print(f'  Lesson Plans: created {created} plans with items')


def seed_hr_departments():
    from apps.hr_payroll.models import Department, Designation, SalaryComponent

    departments_data = [
        ('Teaching', 'TEACH', 'Academic teaching staff across all classes and subjects'),
        ('Administration', 'ADMIN', 'Administrative and office management staff'),
        ('Accounts & Finance', 'ACCTS', 'Fee collection, payroll and financial management'),
        ('Library', 'LIB', 'Library management and resource curation'),
        ('Sports & Physical Education', 'SPORT', 'Sports training and physical education'),
        ('IT & Technical', 'TECH', 'ICT lab management and technical support'),
        ('Security & Housekeeping', 'SUPP', 'Campus security and cleanliness maintenance'),
    ]

    dept_created = 0
    depts = {}
    for name, code, desc in departments_data:
        obj, flag = Department.objects.get_or_create(
            code=code,
            defaults={'name': name, 'description': desc, 'is_active': True}
        )
        depts[code] = obj
        if flag:
            dept_created += 1

    designations_data = [
        ('Principal', 'ADMIN', 'A1', 'Head of the institution responsible for overall management'),
        ('Vice Principal', 'ADMIN', 'A2', 'Supports principal in academic and administrative functions'),
        ('PGT Teacher', 'TEACH', 'B1', 'Post Graduate Teacher for Classes 11-12'),
        ('TGT Teacher', 'TEACH', 'B2', 'Trained Graduate Teacher for Classes 6-10'),
        ('PRT Teacher', 'TEACH', 'B3', 'Primary teacher for Classes 1-5'),
        ('Head Clerk', 'ADMIN', 'C1', 'Manages office records and administrative tasks'),
        ('Accountant', 'ACCTS', 'C1', 'Handles fee records and financial accounts'),
        ('Librarian', 'LIB', 'C2', 'Manages book catalog, issue and return'),
        ('Sports Coach', 'SPORT', 'C2', 'Trains students in sports and physical education'),
        ('Lab Assistant', 'TECH', 'D1', 'Manages science/computer lab equipment'),
        ('Peon / Office Assistant', 'SUPP', 'D2', 'General office and campus support'),
        ('Security Guard', 'SUPP', 'D2', 'Campus gate and security duty'),
    ]

    desig_created = 0
    for name, dept_code, grade, desc in designations_data:
        dept = depts.get(dept_code)
        if not dept:
            continue
        obj, flag = Designation.objects.get_or_create(
            name=name,
            department=dept,
            defaults={'grade_level': grade, 'description': desc, 'is_active': True}
        )
        if flag:
            desig_created += 1

    components_data = [
        ('Basic Salary', 'EARNING', 'PERCENTAGE', True, True, 'Monthly basic pay — base for all allowances'),
        ('House Rent Allowance', 'EARNING', 'PERCENTAGE', True, False, 'HRA as per city category (40% of basic)'),
        ('Dearness Allowance', 'EARNING', 'PERCENTAGE', True, True, 'DA linked to All-India CPI index'),
        ('Transport Allowance', 'EARNING', 'FIXED', False, False, 'Monthly transport reimbursement — fixed amount'),
        ('Medical Allowance', 'EARNING', 'FIXED', False, False, 'Monthly medical reimbursement'),
        ('Provident Fund (Employee)', 'DEDUCTION', 'PERCENTAGE', False, True, 'EPF 12% of basic salary deducted from employee'),
        ('Professional Tax', 'DEDUCTION', 'FIXED', False, True, 'State professional tax per local slab'),
        ('TDS (Income Tax)', 'DEDUCTION', 'PERCENTAGE', False, False, 'Tax deducted at source on taxable income'),
    ]

    comp_created = 0
    for name, ctype, calc_type, taxable, mandatory, desc in components_data:
        obj, flag = SalaryComponent.objects.get_or_create(
            name=name,
            defaults={
                'component_type': ctype,
                'calculation_type': calc_type,
                'is_taxable': taxable,
                'is_mandatory': mandatory,
                'description': desc,
            }
        )
        if flag:
            comp_created += 1

    print(f'  HR: created {dept_created} departments, {desig_created} designations, {comp_created} salary components')


def seed_hostel():
    from apps.hostel.models import Hostel, Room

    hostels_data = [
        {
            'name': 'Saraswati Girls Hostel',
            'hostel_type': 'GIRLS',
            'address': 'Campus Block C, Veda Vidyalaya, Bangalore - 560001',
            'total_floors': 3,
            'contact_number': '080-23456789',
        },
        {
            'name': 'Arjuna Boys Hostel',
            'hostel_type': 'BOYS',
            'address': 'Campus Block D, Veda Vidyalaya, Bangalore - 560001',
            'total_floors': 3,
            'contact_number': '080-23456790',
        },
    ]

    hostel_created = 0
    room_created = 0

    room_configs = [
        ('101', 1, 'SINGLE', 1),
        ('102', 1, 'DOUBLE', 2),
        ('103', 1, 'DOUBLE', 2),
        ('104', 1, 'TRIPLE', 3),
        ('105', 1, 'TRIPLE', 3),
        ('201', 2, 'SINGLE', 1),
        ('202', 2, 'DOUBLE', 2),
        ('203', 2, 'DOUBLE', 2),
        ('204', 2, 'TRIPLE', 3),
        ('205', 2, 'TRIPLE', 3),
        ('301', 3, 'DOUBLE', 2),
        ('302', 3, 'DOUBLE', 2),
        ('303', 3, 'DORMITORY', 8),
        ('304', 3, 'DORMITORY', 8),
    ]

    for data in hostels_data:
        hostel, flag = Hostel.objects.get_or_create(
            name=data['name'],
            defaults={
                'hostel_type': data['hostel_type'],
                'address': data['address'],
                'total_floors': data['total_floors'],
                'contact_number': data['contact_number'],
                'is_active': True,
            }
        )
        if flag:
            hostel_created += 1
            for room_number, floor, room_type, capacity in room_configs:
                # Simulate ~70% occupancy
                occupied = min(capacity, int(capacity * 0.7))
                if room_type == 'SINGLE':
                    status = 'OCCUPIED' if occupied else 'AVAILABLE'
                elif occupied == 0:
                    status = 'AVAILABLE'
                elif occupied < capacity:
                    status = 'PARTIALLY_OCCUPIED'
                else:
                    status = 'OCCUPIED'

                Room.objects.create(
                    hostel=hostel,
                    room_number=room_number,
                    floor=floor,
                    room_type=room_type,
                    capacity=capacity,
                    occupied_beds=occupied,
                    status=status,
                    monthly_fee=Decimal('8500.00'),
                    amenities='Attached Bathroom, Study Desk, Wardrobe, Fan, Power Backup',
                )
                room_created += 1

    print(f'  Hostel: created {hostel_created} hostels, {room_created} rooms')


def seed_leave_requests():
    from apps.attendance.models import StudentLeave, StaffLeave
    from apps.students.models import Student
    from apps.staff.models import StaffMember

    students = list(Student.objects.all()[:20])
    staff_members = list(StaffMember.objects.all()[:10])
    today = date.today()

    student_reasons = [
        ('SICK', 'Suffering from fever and viral infection. Doctor has advised 3 days bed rest.'),
        ('FAMILY', 'Family function — relatives visiting from outstation for a week.'),
        ('MEDICAL', 'Dental procedure scheduled. Requires 1 day off for recovery.'),
        ('CASUAL', 'Personal work that requires travel to hometown.'),
        ('EMERGENCY', 'Family emergency requiring immediate travel.'),
        ('OTHER', 'Attending state level science olympiad competition.'),
    ]

    statuses_cycle = ['PENDING', 'APPROVED', 'APPROVED', 'APPROVED', 'REJECTED', 'PENDING']
    student_created = 0

    for i, student in enumerate(students[:15]):
        reason_type, reason = student_reasons[i % len(student_reasons)]
        start = today - timedelta(days=random.randint(5, 45))
        duration = random.randint(1, 4)
        end = start + timedelta(days=duration - 1)
        status = statuses_cycle[i % len(statuses_cycle)]

        obj, flag = StudentLeave.objects.get_or_create(
            student=student,
            start_date=start,
            defaults={
                'end_date': end,
                'leave_type': reason_type,
                'reason': reason,
                'status': status,
                'approval_remarks': 'Approved by class teacher.' if status == 'APPROVED' else (
                    'Insufficient reason provided.' if status == 'REJECTED' else ''
                ),
            }
        )
        if flag:
            student_created += 1

    staff_reasons = [
        ('SICK', 'Medical checkup and treatment at government hospital.'),
        ('CASUAL', 'Personal urgent work — required to attend to family matters.'),
        ('EARNED', 'Annual earned leave for family vacation travel.'),
        ('BEREAVEMENT', 'Bereavement leave — attending last rites of a relative.'),
        ('COMPENSATORY', 'Compensatory off for Saturday duties performed last month.'),
        ('MATERNITY', 'Maternity leave as per government policy.'),
    ]

    staff_cycle = ['APPROVED', 'APPROVED', 'PENDING', 'APPROVED', 'REJECTED', 'APPROVED']
    staff_created = 0

    for i, staff in enumerate(staff_members[:8]):
        reason_type, reason = staff_reasons[i % len(staff_reasons)]
        start = today - timedelta(days=random.randint(10, 50))
        duration = random.randint(1, 6)
        end = start + timedelta(days=duration - 1)
        status = staff_cycle[i % len(staff_cycle)]

        obj, flag = StaffLeave.objects.get_or_create(
            staff_member=staff,
            start_date=start,
            defaults={
                'end_date': end,
                'leave_type': reason_type,
                'reason': reason,
                'status': status,
                'is_half_day': False,
                'approval_remarks': 'Approved by Principal.' if status == 'APPROVED' else (
                    'Leave not permissible during exam period.' if status == 'REJECTED' else ''
                ),
            }
        )
        if flag:
            staff_created += 1

    print(f'  Leave Requests: created {student_created} student + {staff_created} staff leaves')


def main():
    print(f'Seeding Veda9 tenant (schema: {SCHEMA})...\n')
    with schema_context(SCHEMA):
        print('1. Seeding Syllabus Units...')
        try:
            units_map = seed_syllabus_units()
        except Exception as e:
            import traceback; traceback.print_exc()
            units_map = {}

        print('2. Seeding Lesson Plans...')
        try:
            seed_lesson_plans(units_map)
        except Exception as e:
            import traceback; traceback.print_exc()

        print('3. Seeding HR Departments + Designations + Salary Components...')
        try:
            seed_hr_departments()
        except Exception as e:
            import traceback; traceback.print_exc()

        print('4. Seeding Hostel data...')
        try:
            seed_hostel()
        except Exception as e:
            import traceback; traceback.print_exc()

        print('5. Seeding Leave Requests...')
        try:
            seed_leave_requests()
        except Exception as e:
            import traceback; traceback.print_exc()

    print('\nDone! All modules seeded.')


if __name__ == '__main__':
    main()
