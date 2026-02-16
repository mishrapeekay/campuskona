from rest_framework import serializers
from .models import House, HouseMembership, HousePointLog

class HouseSerializer(serializers.ModelSerializer):
    total_points = serializers.IntegerField(read_only=True)
    member_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = House
        fields = ['id', 'name', 'code', 'color_code', 'motto', 'logo', 'total_points', 'member_count']

class HouseMembershipSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    house_name = serializers.CharField(source='house.name', read_only=True)

    class Meta:
        model = HouseMembership
        fields = ['id', 'student', 'student_name', 'house', 'house_name', 'role', 'academic_year', 'points_contributed']

class HousePointLogSerializer(serializers.ModelSerializer):
    house_name = serializers.CharField(source='house.name', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True, allow_null=True)
    awarded_by_name = serializers.CharField(source='awarded_by.get_full_name', read_only=True)

    class Meta:
        model = HousePointLog
        fields = [
            'id', 'house', 'house_name', 'student', 'student_name', 
            'points', 'reason', 'category', 'awarded_by', 'awarded_by_name', 'awarded_date'
        ]
        read_only_fields = ['awarded_by', 'awarded_date']
