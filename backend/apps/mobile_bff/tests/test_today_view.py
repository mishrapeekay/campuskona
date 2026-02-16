"""
Unit Tests for Today View Service
"""

import asyncio
from datetime import datetime, timedelta
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.mobile_bff.services.today_view import TodayViewService, ParentTodayViewService
from apps.mobile_bff.caching.today_view_cache import TodayViewCache
from apps.students.models import Student, StudentParent, StudentNote
from apps.academics.models import AcademicYear, Class, Section, Subject, StudentEnrollment, Board
from apps.timetable.models import TimeSlot, ClassTimetable
from apps.assignments.models import Assignment, AssignmentSubmission
from apps.finance.models import FeeCategory, FeeStructure, StudentFee
from apps.attendance.models import Attendance
from apps.staff.models import StaffMember

User = get_user_model()


class TodayViewServiceTest(TestCase):
    """Test cases for TodayViewService"""
    
    def setUp(self):
        """Set up test data"""
        # Create academic year
        self.academic_year = AcademicYear.objects.create(
            name='2025-2026',
            start_date='2025-04-01',
            end_date='2026-03-31',
            is_current=True
        )
        
        # Create board
        self.board = Board.objects.create(
            board_name='CBSE',
            board_type='CBSE'
        )
        
        # Create class
        self.class_obj = Class.objects.create(
            name='10',
            display_name='Class 10',
            board=self.board,
            class_order=10
        )
        
        # Create section
        self.section = Section.objects.create(
            class_instance=self.class_obj,
            name='A',
            academic_year=self.academic_year,
            capacity=40
        )
        
        # Create student user
        self.student_user = User.objects.create_user(
            username='student001',
            email='student@test.com',
            password='testpass123',
            role='STUDENT'
        )
        
        # Create student
        self.student = Student.objects.create(
            user=self.student_user,
            first_name='John',
            last_name='Doe',
            date_of_birth='2010-01-01',
            gender='M',
            admission_number='2025001',
            admission_date=timezone.now().date(),
            admission_status='ACTIVE'
        )
        
        # Create enrollment
        self.enrollment = StudentEnrollment.objects.create(
            student=self.student,
            section=self.section,
            academic_year=self.academic_year,
            roll_number=15,
            is_active=True
        )
        
        # Create subject
        self.subject = Subject.objects.create(
            name='Mathematics',
            code='MATH10',
            subject_type='CORE',
            class_group='SECONDARY'
        )
        
        # Create teacher
        self.teacher_user = User.objects.create_user(
            username='teacher001',
            email='teacher@test.com',
            password='testpass123',
            role='TEACHER'
        )
        
        self.teacher = StaffMember.objects.create(
            user=self.teacher_user,
            first_name='Jane',
            last_name='Smith',
            employee_id='EMP001',
            designation='TEACHER',
            department='ACADEMICS'
        )
    
    def test_get_student_info(self):
        """Test student info retrieval"""
        service = TodayViewService(str(self.student.id))
        student_info = asyncio.run(service._get_student_info())
        
        self.assertEqual(student_info['name'], 'John Doe')
        self.assertEqual(student_info['admission_number'], '2025001')
        self.assertEqual(student_info['class'], 'Class 10')
        self.assertEqual(student_info['section'], 'A')
        self.assertEqual(student_info['roll_number'], 15)
    
    def test_get_timetable_weekend(self):
        """Test timetable returns holiday for weekend"""
        # Set today to a Saturday
        service = TodayViewService(str(self.student.id))
        service.today = timezone.now().date()
        
        # If today is a weekend
        if service.today.weekday() in [5, 6]:
            timetable = asyncio.run(service._get_timetable_data())
            self.assertTrue(timetable['is_holiday'])
    
    def test_get_homework_data(self):
        """Test homework retrieval"""
        # Create assignment
        assignment = Assignment.objects.create(
            title='Quadratic Equations',
            description='Solve problems from Chapter 4',
            subject=self.subject,
            section=self.section,
            teacher=self.teacher,
            academic_year=self.academic_year,
            due_date=timezone.now() + timedelta(days=2),
            max_marks=20,
            status='PUBLISHED'
        )
        
        service = TodayViewService(str(self.student.id))
        homework = asyncio.run(service._get_homework_data())
        
        self.assertEqual(len(homework), 1)
        self.assertEqual(homework[0]['title'], 'Quadratic Equations')
        self.assertEqual(homework[0]['submission_status'], 'PENDING')
    
    def test_get_homework_with_submission(self):
        """Test homework shows submitted status"""
        # Create assignment
        assignment = Assignment.objects.create(
            title='Test Assignment',
            description='Test',
            subject=self.subject,
            section=self.section,
            teacher=self.teacher,
            academic_year=self.academic_year,
            due_date=timezone.now() + timedelta(days=2),
            max_marks=20,
            status='PUBLISHED'
        )
        
        # Create submission
        submission = AssignmentSubmission.objects.create(
            assignment=assignment,
            student=self.student,
            status='SUBMITTED'
        )
        
        service = TodayViewService(str(self.student.id))
        homework = asyncio.run(service._get_homework_data())
        
        self.assertEqual(homework[0]['submission_status'], 'SUBMITTED')
    
    def test_get_fees_due(self):
        """Test fees due retrieval"""
        # Create fee category
        fee_category = FeeCategory.objects.create(
            name='Tuition Fee',
            code='TUITION',
            is_mandatory=True
        )
        
        # Create fee structure
        fee_structure = FeeStructure.objects.create(
            academic_year=self.academic_year,
            class_obj=self.class_obj,
            fee_category=fee_category,
            amount=10000,
            frequency='ANNUAL'
        )
        
        # Create student fee
        student_fee = StudentFee.objects.create(
            student=self.student,
            fee_structure=fee_structure,
            academic_year=self.academic_year,
            amount=10000,
            paid_amount=0,
            due_date=timezone.now().date() + timedelta(days=7),
            status='PENDING'
        )
        
        service = TodayViewService(str(self.student.id))
        fees = asyncio.run(service._get_fees_due())
        
        self.assertEqual(fees['total_due'], 10000.0)
        self.assertEqual(len(fees['upcoming_fees']), 1)
        self.assertEqual(fees['upcoming_fees'][0]['category'], 'Tuition Fee')
    
    def test_get_teacher_remarks(self):
        """Test teacher remarks retrieval"""
        # Create note
        note = StudentNote.objects.create(
            student=self.student,
            note_type='ACADEMIC',
            title='Good Progress',
            content='Showing improvement',
            created_by=self.teacher_user,
            is_confidential=False
        )
        
        service = TodayViewService(str(self.student.id))
        remarks = asyncio.run(service._get_teacher_remarks())
        
        self.assertEqual(len(remarks), 1)
        self.assertEqual(remarks[0]['title'], 'Good Progress')
        self.assertEqual(remarks[0]['type'], 'ACADEMIC')
    
    def test_get_attendance_status(self):
        """Test attendance status retrieval"""
        # Create attendance
        attendance = Attendance.objects.create(
            student=self.student,
            date=timezone.now().date(),
            status='PRESENT',
            marked_by=self.teacher_user
        )
        
        service = TodayViewService(str(self.student.id))
        attendance_data = asyncio.run(service._get_attendance_status())
        
        self.assertTrue(attendance_data['marked'])
        self.assertEqual(attendance_data['status'], 'PRESENT')
    
    def test_get_today_data_complete(self):
        """Test complete today data aggregation"""
        service = TodayViewService(str(self.student.id))
        data = asyncio.run(service.get_today_data())
        
        # Verify all sections are present
        self.assertIn('student', data)
        self.assertIn('timetable', data)
        self.assertIn('homework', data)
        self.assertIn('fees_due', data)
        self.assertIn('teacher_remarks', data)
        self.assertIn('attendance', data)
        self.assertIn('date', data)
        self.assertIn('day_of_week', data)
        self.assertIn('generated_at', data)


class TodayViewCacheTest(TestCase):
    """Test cases for TodayViewCache"""
    
    def setUp(self):
        """Set up test data"""
        self.student_id = 'test-student-123'
        self.test_data = {
            'date': '2026-02-08',
            'student': {'name': 'Test Student'},
            'timetable': {'periods': []},
            'homework': [],
            'fees_due': {'total_due': 0},
            'teacher_remarks': [],
            'attendance': {'marked': False}
        }
    
    def test_cache_set_and_get(self):
        """Test cache set and get operations"""
        # Set cache
        success = TodayViewCache.set(self.student_id, self.test_data)
        self.assertTrue(success)
        
        # Get cache
        cached_data = TodayViewCache.get(self.student_id)
        self.assertIsNotNone(cached_data)
        self.assertEqual(cached_data['date'], '2026-02-08')
        self.assertTrue(cached_data['_cache_hit'])
    
    def test_cache_invalidation(self):
        """Test cache invalidation"""
        # Set cache
        TodayViewCache.set(self.student_id, self.test_data)
        
        # Verify it exists
        self.assertIsNotNone(TodayViewCache.get(self.student_id))
        
        # Invalidate
        TodayViewCache.invalidate(self.student_id)
        
        # Verify it's gone
        self.assertIsNone(TodayViewCache.get(self.student_id))
    
    def test_dynamic_ttl(self):
        """Test dynamic TTL calculation"""
        ttl = TodayViewCache._get_dynamic_ttl()
        
        # TTL should be between 1800 and 7200 seconds
        self.assertGreaterEqual(ttl, 1800)
        self.assertLessEqual(ttl, 7200)


class ParentTodayViewServiceTest(TestCase):
    """Test cases for ParentTodayViewService"""
    
    def setUp(self):
        """Set up test data"""
        # Create parent user
        self.parent_user = User.objects.create_user(
            username='parent001',
            email='parent@test.com',
            password='testpass123',
            role='PARENT'
        )
        
        # Create academic year
        self.academic_year = AcademicYear.objects.create(
            name='2025-2026',
            start_date='2025-04-01',
            end_date='2026-03-31',
            is_current=True
        )
        
        # Create students (children)
        self.child1 = Student.objects.create(
            first_name='Child',
            last_name='One',
            date_of_birth='2010-01-01',
            gender='M',
            admission_number='2025001',
            admission_date=timezone.now().date(),
            admission_status='ACTIVE'
        )
        
        self.child2 = Student.objects.create(
            first_name='Child',
            last_name='Two',
            date_of_birth='2012-01-01',
            gender='F',
            admission_number='2025002',
            admission_date=timezone.now().date(),
            admission_status='ACTIVE'
        )
        
        # Link children to parent
        StudentParent.objects.create(
            student=self.child1,
            parent=self.parent_user,
            relation='FATHER',
            is_primary_contact=True
        )
        
        StudentParent.objects.create(
            student=self.child2,
            parent=self.parent_user,
            relation='FATHER',
            is_primary_contact=False
        )
    
    def test_get_children(self):
        """Test getting children list"""
        service = ParentTodayViewService(str(self.parent_user.id))
        children = asyncio.run(service._get_children())
        
        self.assertEqual(len(children), 2)
        self.assertEqual(children[0]['name'], 'Child One')
        self.assertEqual(children[1]['name'], 'Child Two')
    
    def test_get_today_data_multiple_children(self):
        """Test getting today data for multiple children"""
        service = ParentTodayViewService(str(self.parent_user.id))
        data = asyncio.run(service.get_today_data())
        
        self.assertEqual(data['children_count'], 2)
        self.assertEqual(len(data['children']), 2)
        self.assertIn('date', data)
        self.assertIn('generated_at', data)


# Run tests
if __name__ == '__main__':
    import django
    django.setup()
    from django.test.utils import get_runner
    from django.conf import settings
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(['apps.mobile_bff.tests.test_today_view'])
