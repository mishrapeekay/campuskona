from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import BaseModel, SoftDeleteModel
from apps.students.models import Student
from apps.staff.models import StaffMember
from apps.academics.models import Section, Subject, AcademicYear

class Assignment(SoftDeleteModel):
    """
    Assignment/Homework model created by Teachers
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('ARCHIVED', 'Archived'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Links
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='assignments')
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='assignments')
    teacher = models.ForeignKey(StaffMember, on_delete=models.CASCADE, related_name='assignments_created')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='assignments')
    
    # Details
    due_date = models.DateTimeField()
    max_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PUBLISHED')
    
    # Attachment
    attachment = models.FileField(upload_to='assignments/attachments/', null=True, blank=True)
    
    class Meta:
        db_table = 'assignments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.section.display_name if hasattr(self.section, 'display_name') else self.section}"

class AssignmentSubmission(SoftDeleteModel):
    """
    Submission model for students
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUBMITTED', 'Submitted'),
        ('GRADED', 'Graded'),
        ('LATE', 'Submitted Late'),
        ('RETURNED', 'Returned/Resubmission Required'),
    ]

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='assignment_submissions')
    
    submission_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUBMITTED')
    
    # Content
    student_notes = models.TextField(blank=True, null=True)
    submission_file = models.FileField(upload_to='assignments/submissions/', null=True, blank=True)
    
    # Grading
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    teacher_feedback = models.TextField(blank=True, null=True)
    graded_by = models.ForeignKey(StaffMember, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_assignments')
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'assignment_submissions'
        unique_together = ['assignment', 'student']
        ordering = ['-submission_date']

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.assignment.title}"
