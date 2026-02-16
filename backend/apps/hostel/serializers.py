"""
Serializers for the Hostel module.
"""

from rest_framework import serializers
from django.db.models import Sum
from .models import (
    Hostel, Room, RoomAllocation, HostelAttendance,
    MessMenu, HostelComplaint, HostelVisitor,
)


class HostelSerializer(serializers.ModelSerializer):
    hostel_type_display = serializers.CharField(source='get_hostel_type_display', read_only=True)
    warden_name = serializers.CharField(source='warden.user.get_full_name', read_only=True)
    total_rooms = serializers.SerializerMethodField()
    total_capacity = serializers.SerializerMethodField()
    total_occupied = serializers.SerializerMethodField()

    class Meta:
        model = Hostel
        fields = [
            'id', 'name', 'hostel_type', 'hostel_type_display',
            'address', 'total_floors', 'warden', 'warden_name',
            'contact_number', 'is_active',
            'total_rooms', 'total_capacity', 'total_occupied',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_rooms(self, obj):
        return obj.rooms.filter(is_deleted=False).count()

    def get_total_capacity(self, obj):
        return obj.rooms.filter(is_deleted=False).aggregate(
            total=Sum('capacity')
        )['total'] or 0

    def get_total_occupied(self, obj):
        return obj.rooms.filter(is_deleted=False).aggregate(
            total=Sum('occupied_beds')
        )['total'] or 0


class RoomSerializer(serializers.ModelSerializer):
    hostel_name = serializers.CharField(source='hostel.name', read_only=True)
    room_type_display = serializers.CharField(source='get_room_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    available_beds = serializers.IntegerField(read_only=True)
    current_students = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id', 'hostel', 'hostel_name', 'room_number', 'floor',
            'room_type', 'room_type_display', 'capacity', 'occupied_beds',
            'available_beds', 'status', 'status_display',
            'amenities', 'monthly_fee', 'current_students',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_current_students(self, obj):
        allocations = obj.allocations.filter(is_active=True, is_deleted=False)
        return [{
            'id': str(a.student.id),
            'name': f"{a.student.first_name} {a.student.last_name}",
            'bed_number': a.bed_number,
        } for a in allocations]


class RoomAllocationSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    hostel_name = serializers.CharField(source='room.hostel.name', read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = RoomAllocation
        fields = [
            'id', 'room', 'room_number', 'hostel_name',
            'student', 'student_name', 'allocated_date', 'vacated_date',
            'bed_number', 'is_active', 'remarks',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class HostelAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = HostelAttendance
        fields = [
            'id', 'student', 'student_name', 'hostel', 'date',
            'status', 'status_display', 'marked_by', 'remarks',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class BulkHostelAttendanceSerializer(serializers.Serializer):
    """For bulk attendance marking."""
    hostel = serializers.UUIDField()
    date = serializers.DateField()
    records = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )


class MessMenuSerializer(serializers.ModelSerializer):
    day_display = serializers.CharField(source='get_day_display', read_only=True)
    meal_display = serializers.CharField(source='get_meal_display', read_only=True)

    class Meta:
        model = MessMenu
        fields = [
            'id', 'hostel', 'day', 'day_display', 'meal', 'meal_display',
            'items', 'start_time', 'end_time',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class HostelComplaintSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)

    class Meta:
        model = HostelComplaint
        fields = [
            'id', 'student', 'student_name', 'hostel', 'room', 'room_number',
            'category', 'category_display', 'subject', 'description',
            'status', 'status_display',
            'resolved_by', 'resolved_date', 'resolution_notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class HostelVisitorSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = HostelVisitor
        fields = [
            'id', 'student', 'student_name', 'hostel',
            'visitor_name', 'relation', 'phone', 'purpose',
            'check_in', 'check_out',
            'id_proof_type', 'id_proof_number',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"
