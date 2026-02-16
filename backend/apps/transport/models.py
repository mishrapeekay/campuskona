from django.db import models
from apps.staff.models import StaffMember
from apps.students.models import Student
from apps.core.models import BaseModel

class Vehicle(BaseModel):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('MAINTENANCE', 'Maintenance'),
        ('INACTIVE', 'Inactive'),
    ]
    
    registration_number = models.CharField(max_length=20, unique=True)
    model = models.CharField(max_length=100)
    capacity = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    insurance_expiry = models.DateField(null=True, blank=True)
    last_service_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.registration_number} ({self.model})"

class Driver(BaseModel):
    staff = models.OneToOneField(StaffMember, on_delete=models.CASCADE, related_name='driver_profile')
    license_number = models.CharField(max_length=50, unique=True)
    license_expiry = models.DateField()
    phone_number = models.CharField(max_length=20)
    
    def __str__(self):
        return self.staff.get_full_name()

class Route(BaseModel):
    name = models.CharField(max_length=100)
    start_point = models.CharField(max_length=100)
    end_point = models.CharField(max_length=100)
    fare = models.DecimalField(max_digits=10, decimal_places=2, help_text="Monthly Fare")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='routes')
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='routes')
    
    def __str__(self):
        return self.name

class Stop(BaseModel):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='stops')
    name = models.CharField(max_length=100)
    sequence_order = models.PositiveIntegerField()
    arrival_time = models.TimeField()
    pickup_fare = models.DecimalField(max_digits=10, decimal_places=2, help_text="Specific fare from this stop, overrides route fare if set", null=True, blank=True)
    
    class Meta:
        ordering = ['sequence_order']
        unique_together = ['route', 'sequence_order']

    def __str__(self):
        return f"{self.name} ({self.route.name})"

class TransportAllocation(BaseModel):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='transport_allocation')
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    stop = models.ForeignKey(Stop, on_delete=models.SET_NULL, null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.student} - {self.route.name}"
