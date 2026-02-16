from django.contrib import admin
from .models import (
    Hostel, Room, RoomAllocation, HostelAttendance,
    MessMenu, HostelComplaint, HostelVisitor,
)


@admin.register(Hostel)
class HostelAdmin(admin.ModelAdmin):
    list_display = ['name', 'hostel_type', 'total_floors', 'warden', 'is_active']
    list_filter = ['hostel_type', 'is_active']
    search_fields = ['name']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['room_number', 'hostel', 'floor', 'room_type', 'capacity', 'occupied_beds', 'status']
    list_filter = ['hostel', 'room_type', 'status', 'floor']
    search_fields = ['room_number']


@admin.register(RoomAllocation)
class RoomAllocationAdmin(admin.ModelAdmin):
    list_display = ['student', 'room', 'allocated_date', 'vacated_date', 'is_active']
    list_filter = ['is_active', 'allocated_date']
    search_fields = ['student__first_name', 'student__last_name', 'room__room_number']


@admin.register(HostelAttendance)
class HostelAttendanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'hostel', 'date', 'status']
    list_filter = ['hostel', 'status', 'date']
    date_hierarchy = 'date'


@admin.register(MessMenu)
class MessMenuAdmin(admin.ModelAdmin):
    list_display = ['hostel', 'day', 'meal', 'start_time', 'end_time']
    list_filter = ['hostel', 'day', 'meal']


@admin.register(HostelComplaint)
class HostelComplaintAdmin(admin.ModelAdmin):
    list_display = ['subject', 'student', 'hostel', 'category', 'status', 'created_at']
    list_filter = ['status', 'category', 'hostel']
    search_fields = ['subject', 'description']
    date_hierarchy = 'created_at'


@admin.register(HostelVisitor)
class HostelVisitorAdmin(admin.ModelAdmin):
    list_display = ['visitor_name', 'student', 'hostel', 'relation', 'check_in', 'check_out']
    list_filter = ['hostel']
    search_fields = ['visitor_name', 'phone']
