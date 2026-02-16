"""
Hostel Management models - rooms, allocations, attendance, mess, complaints.
"""

from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import SoftDeleteModel, TenantManager


class Hostel(SoftDeleteModel):
    """
    Represents a hostel building/block.
    """
    HOSTEL_TYPE_CHOICES = [
        ('BOYS', 'Boys Hostel'),
        ('GIRLS', 'Girls Hostel'),
        ('CO_ED', 'Co-Education'),
    ]

    objects = TenantManager()

    name = models.CharField(max_length=200)
    hostel_type = models.CharField(max_length=10, choices=HOSTEL_TYPE_CHOICES)
    address = models.TextField(blank=True)
    total_floors = models.PositiveIntegerField(default=1)
    warden = models.ForeignKey(
        'staff.StaffMember',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='wardened_hostels',
        help_text='Warden in charge of this hostel'
    )
    contact_number = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'hostel_hostels'
        ordering = ['name']
        verbose_name = 'Hostel'
        verbose_name_plural = 'Hostels'

    def __str__(self):
        return f"{self.name} ({self.get_hostel_type_display()})"


class Room(SoftDeleteModel):
    """
    Individual room within a hostel.
    """
    ROOM_TYPE_CHOICES = [
        ('SINGLE', 'Single'),
        ('DOUBLE', 'Double'),
        ('TRIPLE', 'Triple'),
        ('DORMITORY', 'Dormitory'),
    ]

    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('OCCUPIED', 'Occupied'),
        ('PARTIALLY_OCCUPIED', 'Partially Occupied'),
        ('MAINTENANCE', 'Under Maintenance'),
    ]

    objects = TenantManager()

    hostel = models.ForeignKey(
        Hostel, on_delete=models.CASCADE, related_name='rooms'
    )
    room_number = models.CharField(max_length=20)
    floor = models.PositiveIntegerField(default=0)
    room_type = models.CharField(max_length=15, choices=ROOM_TYPE_CHOICES, default='DOUBLE')
    capacity = models.PositiveIntegerField(default=2, validators=[MinValueValidator(1)])
    occupied_beds = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    amenities = models.TextField(blank=True, help_text='Comma-separated list of amenities')
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = 'hostel_rooms'
        ordering = ['hostel', 'room_number']
        verbose_name = 'Room'
        verbose_name_plural = 'Rooms'
        unique_together = ['hostel', 'room_number']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['hostel', 'floor']),
        ]

    def __str__(self):
        return f"{self.hostel.name} - {self.room_number}"

    @property
    def available_beds(self):
        return max(0, self.capacity - self.occupied_beds)

    def update_status(self):
        """Update room status based on occupancy."""
        if self.occupied_beds == 0:
            self.status = 'AVAILABLE'
        elif self.occupied_beds >= self.capacity:
            self.status = 'OCCUPIED'
        else:
            self.status = 'PARTIALLY_OCCUPIED'
        self.save()


class RoomAllocation(SoftDeleteModel):
    """
    Allocation of a student to a hostel room.
    """
    objects = TenantManager()

    room = models.ForeignKey(
        Room, on_delete=models.CASCADE, related_name='allocations'
    )
    student = models.ForeignKey(
        'students.Student', on_delete=models.CASCADE, related_name='hostel_allocations'
    )
    allocated_date = models.DateField()
    vacated_date = models.DateField(null=True, blank=True)
    bed_number = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'hostel_room_allocations'
        ordering = ['-allocated_date']
        verbose_name = 'Room Allocation'
        verbose_name_plural = 'Room Allocations'
        indexes = [
            models.Index(fields=['student', 'is_active']),
            models.Index(fields=['room', 'is_active']),
        ]

    def __str__(self):
        return f"{self.student} - {self.room}"


class HostelAttendance(SoftDeleteModel):
    """
    Daily hostel attendance (roll call).
    """
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LEAVE', 'On Leave'),
    ]

    objects = TenantManager()

    student = models.ForeignKey(
        'students.Student', on_delete=models.CASCADE, related_name='hostel_attendance'
    )
    hostel = models.ForeignKey(
        Hostel, on_delete=models.CASCADE, related_name='attendance_records'
    )
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PRESENT')
    marked_by = models.ForeignKey(
        'authentication.User', on_delete=models.SET_NULL, null=True, blank=True
    )
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'hostel_attendance'
        ordering = ['-date']
        verbose_name = 'Hostel Attendance'
        verbose_name_plural = 'Hostel Attendance Records'
        unique_together = ['student', 'date']

    def __str__(self):
        return f"{self.student} - {self.date} - {self.status}"


class MessMenu(SoftDeleteModel):
    """
    Weekly mess/cafeteria menu.
    """
    DAY_CHOICES = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]

    MEAL_CHOICES = [
        ('BREAKFAST', 'Breakfast'),
        ('LUNCH', 'Lunch'),
        ('SNACKS', 'Snacks'),
        ('DINNER', 'Dinner'),
    ]

    objects = TenantManager()

    hostel = models.ForeignKey(
        Hostel, on_delete=models.CASCADE, related_name='mess_menus',
        null=True, blank=True, help_text='If null, applies to all hostels'
    )
    day = models.IntegerField(choices=DAY_CHOICES)
    meal = models.CharField(max_length=10, choices=MEAL_CHOICES)
    items = models.TextField(help_text='Comma-separated list of menu items')
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)

    class Meta:
        db_table = 'hostel_mess_menus'
        ordering = ['day', 'meal']
        verbose_name = 'Mess Menu'
        verbose_name_plural = 'Mess Menus'
        unique_together = ['hostel', 'day', 'meal']

    def __str__(self):
        return f"{self.get_day_display()} - {self.get_meal_display()}"


class HostelComplaint(SoftDeleteModel):
    """
    Complaints raised by hostel students.
    """
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]

    CATEGORY_CHOICES = [
        ('PLUMBING', 'Plumbing'),
        ('ELECTRICAL', 'Electrical'),
        ('FURNITURE', 'Furniture'),
        ('CLEANLINESS', 'Cleanliness'),
        ('FOOD', 'Food Quality'),
        ('SECURITY', 'Security'),
        ('OTHER', 'Other'),
    ]

    objects = TenantManager()

    student = models.ForeignKey(
        'students.Student', on_delete=models.CASCADE, related_name='hostel_complaints'
    )
    hostel = models.ForeignKey(
        Hostel, on_delete=models.CASCADE, related_name='complaints'
    )
    room = models.ForeignKey(
        Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints'
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    subject = models.CharField(max_length=300)
    description = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='OPEN')
    resolved_by = models.ForeignKey(
        'authentication.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='resolved_hostel_complaints'
    )
    resolved_date = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)

    class Meta:
        db_table = 'hostel_complaints'
        ordering = ['-created_at']
        verbose_name = 'Hostel Complaint'
        verbose_name_plural = 'Hostel Complaints'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f"{self.subject} - {self.get_status_display()}"


class HostelVisitor(SoftDeleteModel):
    """
    Visitor log for hostel students.
    """
    objects = TenantManager()

    student = models.ForeignKey(
        'students.Student', on_delete=models.CASCADE, related_name='hostel_visitors'
    )
    hostel = models.ForeignKey(
        Hostel, on_delete=models.CASCADE, related_name='visitors'
    )
    visitor_name = models.CharField(max_length=200)
    relation = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    purpose = models.CharField(max_length=300, blank=True)
    check_in = models.DateTimeField()
    check_out = models.DateTimeField(null=True, blank=True)
    id_proof_type = models.CharField(max_length=50, blank=True)
    id_proof_number = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'hostel_visitors'
        ordering = ['-check_in']
        verbose_name = 'Hostel Visitor'
        verbose_name_plural = 'Hostel Visitors'

    def __str__(self):
        return f"{self.visitor_name} visiting {self.student} on {self.check_in.date()}"
