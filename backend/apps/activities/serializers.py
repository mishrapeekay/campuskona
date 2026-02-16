from rest_framework import serializers
from .models import Club, ClubMembership, ClubActivity, ActivityAttendance

class ClubSerializer(serializers.ModelSerializer):
    in_charge_name = serializers.CharField(source='in_charge.full_name', read_only=True)
    member_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Club
        fields = ['id', 'name', 'description', 'category', 'banner_image', 'in_charge', 'in_charge_name', 'member_count', 'is_active']

class ClubMembershipSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    club_name = serializers.CharField(source='club.name', read_only=True)

    class Meta:
        model = ClubMembership
        fields = ['id', 'student', 'student_name', 'club', 'club_name', 'role', 'joined_date', 'academic_year']

class ClubActivitySerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.name', read_only=True)
    attendee_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ClubActivity
        fields = ['id', 'club', 'club_name', 'title', 'description', 'date', 'start_time', 'end_time', 'venue', 'status', 'attendee_count']

class ActivityAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = ActivityAttendance
        fields = ['id', 'activity', 'student', 'student_name', 'is_present', 'remarks']
