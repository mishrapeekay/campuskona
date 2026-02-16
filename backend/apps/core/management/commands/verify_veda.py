"""
Quick verification of Veda Vidyalaya data — all modules
"""
from django.core.management.base import BaseCommand
from django.db import connection
from apps.tenants.models import School


class Command(BaseCommand):
    help = 'Verify Veda Vidyalaya data across all modules'

    def handle(self, *args, **options):
        try:
            school = School.objects.get(code='VV9')
            self.stdout.write(f"\nSchool: {school.name}")
            self.stdout.write(f"Location: {school.city}, {school.state}")
            self.stdout.write(f"Schema: {school.schema_name}\n")
        except School.DoesNotExist:
            self.stdout.write(self.style.ERROR("School not found!"))
            return

        # Switch to tenant schema
        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{school.schema_name}", public')

            # Table names match db_table in models (or Django default {app}_{model})
            tables = {
                # Academics (explicit db_table)
                'academic_years': 'Academic Years',
                'classes': 'Classes',
                'sections': 'Sections',
                'subjects': 'Subjects',
                # Students (explicit db_table)
                'students': 'Students',
                'student_enrollments': 'Student Enrollments',
                'student_parents': 'Student Parents',
                # Staff (explicit db_table)
                'staff_members': 'Staff Members',
                # Attendance (Django default: {app}_{model})
                'attendance_staffattendance': 'Staff Attendance',
                # Transport (Django default: {app}_{model})
                'transport_vehicle': 'Transport Vehicles',
                'transport_route': 'Transport Routes',
                'transport_stop': 'Transport Stops',
                'transport_transportallocation': 'Transport Allocations',
                # Library (Django default: {app}_{model})
                'library_book': 'Library Books',
                'library_bookissue': 'Library Book Issues',
                # Communication (Django default: {app}_{model})
                'communication_notice': 'Notices',
                'communication_event': 'Events',
                # Examinations (explicit db_table)
                'examinations_examinations': 'Examinations',
                'examinations_exam_schedule': 'Exam Schedules',
                'examinations_student_marks': 'Student Marks',
            }

            self.stdout.write("Data Summary:")
            self.stdout.write("-" * 50)

            total = 0
            for table, label in tables.items():
                try:
                    cursor.execute(f'SELECT COUNT(*) FROM {table}')
                    count = cursor.fetchone()[0]
                    total += count
                    icon = "OK" if count > 0 else "--"
                    self.stdout.write(f"[{icon}] {label:.<30} {count:>6}")
                except Exception:
                    self.stdout.write(f"[ER] {label:.<30}  N/A")

            self.stdout.write("-" * 50)
            self.stdout.write(f"     Total Records: {total:,}\n")

            # Expected totals
            self.stdout.write("Expected Totals (from Excel):")
            expected = {
                'Academic Years': 2, 'Classes': 14, 'Sections': 35, 'Subjects': 18,
                'Students': 1080, 'Student Enrollments': 1080, 'Student Parents': 2160,
                'Staff Members': 66, 'Staff Attendance': 1980,
                'Transport Vehicles': 5, 'Transport Routes': 5,
                'Transport Stops': 35, 'Transport Allocations': 650,
                'Library Books': 500, 'Library Book Issues': 200,
                'Notices': 10, 'Events': 10,
                'Examinations': 4, 'Exam Schedules': 150, 'Student Marks': 150,
            }
            self.stdout.write(f"     Expected Total: {sum(expected.values()):,}\n")

            # Sample data
            if total > 0:
                self.stdout.write("Sample Data:")
                try:
                    cursor.execute(
                        'SELECT first_name, last_name, admission_number '
                        'FROM students LIMIT 3'
                    )
                    students = cursor.fetchall()
                    if students:
                        self.stdout.write("\n  Students:")
                        for s in students:
                            self.stdout.write(f"    - {s[0]} {s[1]} ({s[2]})")
                except Exception:
                    pass

                try:
                    cursor.execute(
                        'SELECT first_name, last_name, designation '
                        'FROM staff_members LIMIT 3'
                    )
                    staff = cursor.fetchall()
                    if staff:
                        self.stdout.write("\n  Staff:")
                        for s in staff:
                            self.stdout.write(f"    - {s[0]} {s[1]} - {s[2]}")
                except Exception:
                    pass

            self.stdout.write("\nVerification Complete!")
