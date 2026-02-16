"""
Populate Student Dashboard Data
Creates sample data for the student dashboard to display:
- Timetable entries
- Assignments/Homework
- Fee records
- Attendance
- Exams
- Teacher remarks
"""

import os
import sys
import django
from datetime import datetime, timedelta, time
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.utils import timezone
from django.db import transaction
from apps.students.models import Student, StudentNote
from apps.academics.models import AcademicYear, Class, Section, Subject, StudentEnrollment
from apps.staff.models import StaffMember
from apps.timetable.models import TimeSlot, ClassTimetable
from apps.assignments.models import Assignment
from apps.finance.models import FeeCategory, FeeStructure, StudentFee
from apps.attendance.models import StudentAttendance
from apps.examinations.models import Examination, ExamSchedule, ExamType, GradeScale
from apps.authentication.models import User


def get_or_create_time_slots():
    """Create standard time slots for the day"""
    slots_data = [
        (1, "Period 1", time(8, 0), time(8, 45), 45, "CLASS"),
        (2, "Period 2", time(8, 45), time(9, 30), 45, "CLASS"),
        (3, "Short Break", time(9, 30), time(9, 45), 15, "BREAK"),
        (4, "Period 3", time(9, 45), time(10, 30), 45, "CLASS"),
        (5, "Period 4", time(10, 30), time(11, 15), 45, "CLASS"),
        (6, "Lunch Break", time(11, 15), time(12, 0), 45, "BREAK"),
        (7, "Period 5", time(12, 0), time(12, 45), 45, "CLASS"),
        (8, "Period 6", time(12, 45), time(13, 30), 45, "CLASS"),
        (9, "Period 7", time(13, 30), time(14, 15), 45, "CLASS"),
    ]
    
    slots = []
    for order, name, start, end, duration, slot_type in slots_data:
        slot, _ = TimeSlot.objects.get_or_create(
            order=order,
            defaults={
                'name': name,
                'start_time': start,
                'end_time': end,
                'duration_minutes': duration,
                'slot_type': slot_type,
            }
        )
        slots.append(slot)
    
    return slots


def populate_timetable(student, enrollment, subjects, teacher):
    """Create timetable entries for the student's section"""
    print("Creating timetable entries...")
    
    slots = get_or_create_time_slots()
    class_slots = [s for s in slots if s.slot_type == 'CLASS']
    
    # Create timetable for Monday to Friday
    days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    
    timetable_entries = []
    for day in days:
        for i, slot in enumerate(class_slots[:6]):  # 6 periods per day
            subject = subjects[i % len(subjects)]
            
            entry, created = ClassTimetable.objects.get_or_create(
                academic_year=enrollment.academic_year,
                class_obj=enrollment.section.class_instance,  # Added this required field
                section=enrollment.section,
                day_of_week=day,
                time_slot=slot,
                defaults={
                    'subject': subject,
                    'teacher': teacher,
                    'room_number': f"Room {101 + i}",
                    'is_active': True,
                }
            )
            if created:
                timetable_entries.append(entry)
    
    print(f"✓ Created {len(timetable_entries)} timetable entries")
    return timetable_entries


def populate_assignments(student, enrollment, subjects, teacher):
    """Create homework/assignments"""
    print("Creating assignments...")
    
    today = timezone.now()
    assignments_data = [
        {
            'title': 'Math Worksheet - Algebra',
            'description': 'Complete exercises 1-15 from Chapter 5',
            'subject': subjects[0],
            'due_date': today + timedelta(days=1, hours=23, minutes=59),
            'max_marks': 20,
        },
        {
            'title': 'Science Project - Photosynthesis',
            'description': 'Create a model demonstrating photosynthesis process',
            'subject': subjects[1],
            'due_date': today + timedelta(days=3, hours=23, minutes=59),
            'max_marks': 30,
        },
        {
            'title': 'English Essay',
            'description': 'Write a 500-word essay on "The Importance of Reading"',
            'subject': subjects[2],
            'due_date': today + timedelta(days=5, hours=23, minutes=59),
            'max_marks': 25,
        },
        {
            'title': 'History Timeline',
            'description': 'Create a timeline of major events in Indian Independence',
            'subject': subjects[3] if len(subjects) > 3 else subjects[0],
            'due_date': today + timedelta(days=7, hours=23, minutes=59),
            'max_marks': 20,
        },
    ]
    
    assignments = []
    for data in assignments_data:
        assignment, created = Assignment.objects.get_or_create(
            section=enrollment.section,
            academic_year=enrollment.academic_year,
            title=data['title'],
            defaults={
                'description': data['description'],
                'subject': data['subject'],
                'teacher': teacher,
                'due_date': data['due_date'],
                'max_marks': data['max_marks'],
                'status': 'PUBLISHED',
                'is_deleted': False,
            }
        )
        if created:
            assignments.append(assignment)
    
    print(f"✓ Created {len(assignments)} assignments")
    return assignments


def populate_fees(student, enrollment):
    """Create fee records"""
    print("Creating fee records...")
    
    # Get or create fee categories
    tuition_cat, _ = FeeCategory.objects.get_or_create(
        name="Tuition Fee",
        defaults={'description': 'Monthly tuition fee', 'is_active': True, 'code': 'TUITION'}
    )
    
    transport_cat, _ = FeeCategory.objects.get_or_create(
        name="Transport Fee",
        defaults={'description': 'Monthly transport fee', 'is_active': True, 'code': 'TRANSPORT'}
    )
    
    # Create fee structures
    tuition_structure, _ = FeeStructure.objects.get_or_create(
        academic_year=enrollment.academic_year,
        fee_category=tuition_cat,
        class_obj=enrollment.section.class_instance,
        defaults={
            'amount': Decimal('5000.00'),
            'frequency': 'MONTHLY',
            'is_active': True,
        }
    )
    
    transport_structure, _ = FeeStructure.objects.get_or_create(
        academic_year=enrollment.academic_year,
        fee_category=transport_cat,
        class_obj=enrollment.section.class_instance,
        defaults={
            'amount': Decimal('1500.00'),
            'frequency': 'MONTHLY',
            'is_active': True,
        }
    )
    
    # Create student fees
    today = timezone.now().date()
    fees = []
    
    # Overdue fee
    overdue_fee, created = StudentFee.objects.get_or_create(
        student=student,
        fee_structure=tuition_structure,
        academic_year=enrollment.academic_year,
        due_date=today - timedelta(days=15),
        defaults={
            'amount': Decimal('5000.00'),
            'paid_amount': Decimal('0.00'),
            'status': 'OVERDUE',
        }
    )
    if created:
        fees.append(overdue_fee)
    
    # Due today
    due_today_fee, created = StudentFee.objects.get_or_create(
        student=student,
        fee_structure=transport_structure,
        academic_year=enrollment.academic_year,
        due_date=today,
        defaults={
            'amount': Decimal('1500.00'),
            'paid_amount': Decimal('0.00'),
            'status': 'PENDING',
        }
    )
    if created:
        fees.append(due_today_fee)
    
    # Upcoming fee
    upcoming_fee, created = StudentFee.objects.get_or_create(
        student=student,
        fee_structure=tuition_structure,
        academic_year=enrollment.academic_year,
        due_date=today + timedelta(days=15),
        defaults={
            'amount': Decimal('5000.00'),
            'paid_amount': Decimal('0.00'),
            'status': 'PENDING',
        }
    )
    if created:
        fees.append(upcoming_fee)
    
    print(f"✓ Created {len(fees)} fee records")
    return fees


def populate_attendance(student, enrollment):
    """Create attendance records"""
    print("Creating attendance records...")
    
    today = timezone.now().date()
    start_date = today - timedelta(days=30)
    
    attendance_records = []
    current_date = start_date
    
    while current_date <= today:
        # Skip weekends
        if current_date.weekday() < 5:  # Monday to Friday
            # 90% attendance rate
            status = 'PRESENT' if current_date.day % 10 != 0 else 'ABSENT'
            
            record, created = StudentAttendance.objects.get_or_create(
                student=student,
                academic_year=enrollment.academic_year,
                date=current_date,
                defaults={
                    'status': status,
                    'remarks': 'Sick' if status == 'ABSENT' else '',
                }
            )
            if created:
                attendance_records.append(record)
        
        current_date += timedelta(days=1)
    
    print(f"✓ Created {len(attendance_records)} attendance records")
    return attendance_records


def populate_exams(student, enrollment, subjects):
    """Create exam schedules"""
    print("Creating exam schedules...")
    
    # Get or create Exam Type
    exam_type_obj, _ = ExamType.objects.get_or_create(
        name="Summative Assessment",
        defaults={
            'code': 'SUMMATIVE',
            'exam_type': 'SUMMATIVE',
            'weightage': Decimal('50.00'),
            'is_active': True,
        }
    )
    
    # Get or create Grade Scale
    grade_scale, _ = GradeScale.objects.get_or_create(
        name="Standard Grading",
        defaults={'description': 'Standard A-F grading', 'is_active': True}
    )
    
    # Create examination
    exam, _ = Examination.objects.get_or_create(
        academic_year=enrollment.academic_year,
        name="Mid-Term Examination",
        defaults={
            'exam_type': exam_type_obj,
            'grade_scale': grade_scale,
            'start_date': timezone.now().date() + timedelta(days=10),
            'end_date': timezone.now().date() + timedelta(days=15),
            'status': 'SCHEDULED',
            'is_published': True,
        }
    )
    
    # Create exam schedules
    exam_schedules = []
    base_date = timezone.now().date() + timedelta(days=10)
    
    for i, subject in enumerate(subjects[:5]):  # 5 subjects
        schedule, created = ExamSchedule.objects.get_or_create(
            examination=exam,
            class_obj=enrollment.section.class_instance,
            section=enrollment.section,
            subject=subject,
            defaults={
                'exam_date': base_date + timedelta(days=i),
                'start_time': time(9, 0),
                'end_time': time(11, 0),
                'duration_minutes': 120,
                'max_marks': Decimal('100.00'),
                'min_passing_marks': Decimal('40.00'),
                'room_number': f"Exam Hall {i+1}",
            }
        )
        if created:
            exam_schedules.append(schedule)
    
    print(f"✓ Created {len(exam_schedules)} exam schedules")
    return exam_schedules


def populate_teacher_remarks(student, teacher):
    """Create teacher remarks/notes"""
    print("Creating teacher remarks...")
    
    remarks_data = [
        {
            'title': 'Excellent Progress',
            'content': 'Kisan has shown remarkable improvement in Mathematics. Keep up the good work!',
            'note_type': 'ACADEMIC',
            'is_important': False,
        },
        {
            'title': 'Homework Reminder',
            'content': 'Please ensure to submit the Science project by Friday.',
            'note_type': 'GENERAL',
            'is_important': True,
        },
        {
            'title': 'Parent Meeting',
            'content': 'Request for parent-teacher meeting to discuss academic progress.',
            'note_type': 'GENERAL',
            'is_important': True,
        },
    ]
    
    remarks = []
    for data in remarks_data:
        note, created = StudentNote.objects.get_or_create(
            student=student,
            title=data['title'],
            defaults={
                'content': data['content'],
                'note_type': data['note_type'],
                'created_by': teacher.user,
                'is_important': data['is_important'],
                'is_private': False,
            }
        )
        if created:
            remarks.append(note)
    
    print(f"✓ Created {len(remarks)} teacher remarks")
    return remarks


from django_tenants.utils import schema_context

@transaction.atomic
def main():
    print("=" * 60)
    print("POPULATING STUDENT DASHBOARD DATA")
    print("=" * 60)

    target_schema = 'tenant_veda_v9'
    print(f"Switching to schema: {target_schema}")
    
    with schema_context(target_schema):
        # Get the first student
        try:
            student = Student.objects.filter(is_deleted=False).first()
            if not student:
                print("✗ No students found in the system.")
                return
            print(f"\n✓ Found student: {student.get_full_name()} ({student.admission_number})")
            print(f"  Email: {student.user.email}")
        except Exception as e:
            print(f"✗ Error finding student: {e}")
            return
        
        # Get active enrollment
        enrollment = StudentEnrollment.objects.filter(
            student=student,
            is_active=True
        ).select_related('section', 'academic_year', 'section__class_instance').first()
        
        if not enrollment:
            print("✗ No active enrollment found for student")
            return
        
        print(f"✓ Enrollment: {enrollment.section.class_instance.display_name} - {enrollment.section.name}")
        print(f"✓ Academic Year: {enrollment.academic_year.name}")
        
        # Get existing subjects
        print("\nGetting existing subjects...")
        subjects = list(Subject.objects.all()[:5])
        if not subjects:
            print("✗ No subjects found in the system. Please create subjects first.")
            return
        print(f"✓ Found {len(subjects)} subjects: {', '.join([s.name for s in subjects])}")
        
        # Get a teacher
        teacher = StaffMember.objects.filter(designation='TEACHER').first()
        if not teacher:
            print("✗ No teacher found. Creating a default teacher...")
            # Create a teacher user
            teacher_user, _ = User.objects.get_or_create(
                email='teacher@veda.edu',
                defaults={
                    'first_name': 'Rajesh',
                    'last_name': 'Kumar',
                    'user_type': 'TEACHER',
                    'role': 'TEACHER',
                    'is_active': True,
                }
            )
            teacher, _ = StaffMember.objects.get_or_create(
                user=teacher_user,
                defaults={
                    'employee_id': 'TEACH001',
                    'designation': 'TEACHER',
                    'department': 'ACADEMIC',
                    'joining_date': timezone.now().date(),
                    'first_name': 'Rajesh',
                    'last_name': 'Kumar',
                    'date_of_birth': timezone.now().date() - timedelta(days=365*35),
                    'gender': 'M',
                    'phone_number': '9876543210',
                    'email': 'teacher@veda.edu',
                    'emergency_contact_name': 'Emergency Contact',
                    'emergency_contact_number': '9876543211',
                    'emergency_contact_relation': 'Spouse',
                    'current_address_line1': 'Address Line 1',
                    'current_city': 'City',
                    'current_state': 'State',
                    'current_pincode': '123456',
                    'permanent_address_line1': 'Address Line 1',
                    'permanent_city': 'City',
                    'permanent_state': 'State',
                    'permanent_pincode': '123456',
                }
            )
        print(f"✓ Using teacher: {teacher.user.get_full_name()}")
        
        print("\n" + "=" * 60)
        print("POPULATING DATA...")
        print("=" * 60 + "\n")
        
        # Populate all data
        populate_timetable(student, enrollment, subjects, teacher)
        populate_assignments(student, enrollment, subjects, teacher)
        populate_fees(student, enrollment)
        populate_attendance(student, enrollment)
        populate_exams(student, enrollment, subjects)
        populate_teacher_remarks(student, teacher)
        
        print("\n" + "=" * 60)
        print("✓ DATA POPULATION COMPLETE!")
        print("=" * 60)
        print("\nRefresh the student dashboard to see the populated data.")
        print("The dashboard should now show:")
        print("  • Timetable for today")
        print("  • 4 pending assignments")
        print("  • Fee dues (₹6,500 overdue + ₹1,500 due today)")
        print("  • Attendance records (90% attendance)")
        print("  • 5 upcoming exams")
        print("  • 3 teacher remarks")
        print("\n")


if __name__ == '__main__':
    # Wrap in schema_context to ensure transaction commit hooks (like signals) run in correct schema
    with schema_context('tenant_veda_v9'):
        main()
