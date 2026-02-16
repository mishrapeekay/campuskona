from django.db import models
from django.db.models import Sum
from apps.core.models import BaseModel
from apps.students.models import Student
from django.conf import settings

class House(BaseModel):
    """
    School House model (e.g., Red, Blue, Green, Yellow)
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    color_code = models.CharField(max_length=7, help_text="Hex color code (e.g., #FF0000)")
    motto = models.CharField(max_length=255, blank=True)
    logo = models.ImageField(upload_to='houses/logos/', null=True, blank=True)
    
    @property
    def total_points(self):
        return self.points_log.aggregate(total=Sum('points'))['total'] or 0

    class Meta:
        db_table = 'houses'
        verbose_name = 'House'
        verbose_name_plural = 'Houses'

    def __str__(self):
        return self.name

class HouseMembership(BaseModel):
    """
    Maps students to houses with leadership roles
    """
    ROLE_CHOICES = [
        ('MEMBER', 'Member'),
        ('HOUSE_CAPTAIN', 'House Captain'),
        ('VICE_CAPTAIN', 'Vice Captain'),
        ('PREFECT', 'Prefect'),
        ('SPORTS_CAPTAIN', 'Sports Captain'),
    ]
    
    student = models.OneToOneField(
        Student, 
        on_delete=models.CASCADE, 
        related_name='house_membership'
    )
    house = models.ForeignKey(
        House, 
        on_delete=models.CASCADE, 
        related_name='members'
    )
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='MEMBER'
    )
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='house_memberships'
    )
    points_contributed = models.IntegerField(default=0)

    class Meta:
        db_table = 'house_memberships'
        unique_together = ['student', 'academic_year']

    def __str__(self):
        return f"{self.student.full_name} - {self.house.name} ({self.role})"

class HousePointLog(BaseModel):
    """
    Audit trail for point additions/subtractions
    """
    house = models.ForeignKey(
        House, 
        on_delete=models.CASCADE, 
        related_name='points_log'
    )
    student = models.ForeignKey(
        Student, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='house_points'
    )
    points = models.IntegerField(help_text="Points awarded (can be negative for penalties)")
    reason = models.CharField(max_length=255)
    category = models.CharField(
        max_length=50,
        choices=[
            ('ACADEMIC', 'Academic Excellence'),
            ('SPORTS', 'Sports/Athletics'),
            ('CULTURAL', 'Cultural/Arts'),
            ('DISCIPLINE', 'Discipline/Conduct'),
            ('LEADERSHIP', 'Leadership'),
            ('OTHER', 'Other'),
        ],
        default='OTHER'
    )
    awarded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='awarded_house_points'
    )
    awarded_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'house_points_log'
        ordering = ['-awarded_date']

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        
        # Update student's contributed points if linked
        if is_new and self.student:
            membership = HouseMembership.objects.filter(
                student=self.student,
                house=self.house
            ).first()
            if membership:
                membership.points_contributed += self.points
                membership.save()

    def __str__(self):
        return f"{self.points} to {self.house.name} for {self.reason}"
