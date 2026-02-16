from rest_framework import serializers
from .models import Vehicle, Driver, Route, Stop, TransportAllocation
from apps.staff.serializers import StaffMemberListSerializer
from apps.students.serializers import StudentListSerializer

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class DriverSerializer(serializers.ModelSerializer):
    staff_details = StaffMemberListSerializer(source='staff', read_only=True)
    
    class Meta:
        model = Driver
        fields = '__all__'

class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = ['id', 'name', 'sequence_order', 'arrival_time', 'pickup_fare', 'route']

class RouteSerializer(serializers.ModelSerializer):
    stops = StopSerializer(many=True, read_only=True)
    vehicle_details = VehicleSerializer(source='vehicle', read_only=True)
    driver_details = DriverSerializer(source='driver', read_only=True)
    
    class Meta:
        model = Route
        fields = '__all__'

class TransportAllocationSerializer(serializers.ModelSerializer):
    student_details = StudentListSerializer(source='student', read_only=True)
    route_details = RouteSerializer(source='route', read_only=True)
    stop_details = StopSerializer(source='stop', read_only=True)
    
    class Meta:
        model = TransportAllocation
        fields = '__all__'

    def validate(self, data):
        route = data.get('route')
        # Check if route has a vehicle assigned
        if route and route.vehicle:
            capacity = route.vehicle.capacity
            current_allocations = TransportAllocation.objects.filter(
                route=route, 
                is_active=True
            ).count()
            
            if current_allocations >= capacity:
                raise serializers.ValidationError(
                    f"Route capacity full. Vehicle capacity is {capacity}."
                )
        return data
