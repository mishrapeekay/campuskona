from django.contrib import admin
from .models import Vehicle, Driver, Route, Stop, TransportAllocation


class StopInline(admin.TabularInline):
    model = Stop
    extra = 1
    fields = ('name', 'sequence_order', 'arrival_time', 'pickup_fare')


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('registration_number', 'model', 'capacity', 'status', 'insurance_expiry', 'last_service_date')
    list_filter = ('status',)
    search_fields = ('registration_number', 'model')


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('staff', 'license_number', 'license_expiry', 'phone_number')
    search_fields = ('license_number', 'staff__first_name', 'staff__last_name')


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_point', 'end_point', 'vehicle', 'driver', 'fare', 'stop_count')
    search_fields = ('name', 'start_point', 'end_point')
    inlines = [StopInline]

    def stop_count(self, obj):
        return obj.stops.count()
    stop_count.short_description = 'Stops'


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('name', 'route', 'sequence_order', 'arrival_time', 'pickup_fare')
    list_filter = ('route',)
    search_fields = ('name', 'route__name')
    ordering = ('route', 'sequence_order')


@admin.register(TransportAllocation)
class TransportAllocationAdmin(admin.ModelAdmin):
    list_display = ('student', 'route', 'stop', 'start_date', 'end_date', 'is_active')
    list_filter = ('route', 'is_active')
    search_fields = ('student__first_name', 'student__last_name', 'route__name')
