from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Vehicle, Driver, Route, Stop, TransportAllocation
from .serializers import (
    VehicleSerializer, DriverSerializer, RouteSerializer, 
    StopSerializer, TransportAllocationSerializer
)
from apps.core.permissions import IsAdminOrReadOnly

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAdminOrReadOnly]

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsAdminOrReadOnly]

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    @action(detail=True, methods=['post'])
    def add_stop(self, request, pk=None):
        route = self.get_object()
        serializer = StopSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(route=route)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StopViewSet(viewsets.ModelViewSet):
    queryset = Stop.objects.all()
    serializer_class = StopSerializer
    permission_classes = [IsAdminOrReadOnly]

class TransportAllocationViewSet(viewsets.ModelViewSet):
    queryset = TransportAllocation.objects.all()
    serializer_class = TransportAllocationSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        # Filter by student if logged in as student
        user = self.request.user
        if hasattr(user, 'student_profile'):
            return TransportAllocation.objects.filter(student=user.student_profile)
        elif user.user_type == 'STUDENT':
             # Fallback
             try:
                 from apps.students.models import Student
                 s = Student.objects.get(user_id=user.id)
                 return TransportAllocation.objects.filter(student=s)
             except (ImportError, Student.DoesNotExist):
                 pass
        
        return super().get_queryset()

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """
        Get dashboard statistics for Transport
        """
        total_vehicles = Vehicle.objects.count()
        # Route model does not have is_active field, assuming all are active or adding it later
        active_routes = Route.objects.count() 
        allocated_students = TransportAllocation.objects.filter(is_active=True).count()
        
        # Calculate vehicle capacity utilization (simple avg)
        # For advanced, we'd loop through active vehicles
        
        return Response({
            'total_vehicles': total_vehicles,
            'active_routes': active_routes,
            'allocated_students': allocated_students
        })
