from django.db import models
from apps.core.models import BaseModel
from apps.students.models import Student
from apps.staff.models import StaffMember

class Club(BaseModel):
    """
    Co-curricular clubs (e.g., Coding Club, Debate Club).
    """
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=[
            ('ACADEMIC', 'Academic'),
            ('SPORTS', 'Sports'),
            ('ARTS', 'Arts & Culture'),
            ('STEM', 'STEM/Technology'),
            ('COMMUNITY', 'Community Service'),
        ],
        default='ACADEMIC'
    )
    banner_image = models.ImageField(upload_to='clubs/banners/', null=True, blank=True)
    in_charge = models.ForeignKey(
        StaffMember,
        on_delete=models.SET_NULL,
        null=True,
        related_name='managed_clubs',
        help_text="Teacher in-charge of the club"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'clubs'
        verbose_name = 'Club'
        verbose_name_plural = 'Clubs'

    def __str__(self):
        return self.name

class ClubMembership(BaseModel):
    """
    Student enrollments in clubs.
    """
    ROLE_CHOICES = [
        ('MEMBER', 'Member'),
        ('PRESIDENT', 'President'),
        ('VICE_PRESIDENT', 'Vice President'),
        ('SECRETARY', 'Secretary'),
        ('HEAD', 'Student Head'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='club_memberships')
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='members')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='MEMBER')
    joined_date = models.DateField(auto_now_add=True)
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='club_memberships'
    )

    class Meta:
        db_table = 'club_memberships'
        unique_together = ['student', 'club', 'academic_year']

    def __str__(self):
        return f"{self.student.full_name} in {self.club.name}"

class ClubActivity(BaseModel):
    """
    Specific events or sessions held by a club.
    """
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    venue = models.CharField(max_length=100)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('PLANNED', 'Planned'),
            ('IN_PROGRESS', 'In Progress'),
            ('COMPLETED', 'Completed'),
            ('CANCELLED', 'Cancelled'),
        ],
        default='PLANNED'
    )

    class Meta:
        db_table = 'club_activities'
        verbose_name = 'Club Activity'
        verbose_name_plural = 'Club Activities'
        ordering = ['-date', '-start_time']

    def __str__(self):
        return f"{self.title} ({self.date})"

class ActivityAttendance(BaseModel):
    """
    Attendance tracking for club activities.
    """
    activity = models.ForeignKey(ClubActivity, on_delete=models.CASCADE, related_name='attendance')
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    is_present = models.BooleanField(default=True)
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'club_activity_attendance'
        unique_together = ['activity', 'student']

    def __str__(self):
        return f"{self.student.full_name} - {self.activity.title}"
