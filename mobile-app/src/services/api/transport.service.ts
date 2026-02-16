import apiClient from './client';
import offlineManager from '@/utils/offlineManager';
import { Vehicle, Driver, Route, Stop, TransportAllocation } from '@/types/models';
import { PaginatedResponse, QueryParams } from '@/types/api';

export interface BusTrackingInfo {
  route_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
  next_stop?: {
    id: string;
    name: string;
    distance: number;
    eta: string;
  };
  status: 'on_time' | 'delayed' | 'early';
  delay_minutes: number;
}

class TransportService {
  /**
   * Get vehicles
   */
  async getVehicles(params?: QueryParams): Promise<PaginatedResponse<Vehicle>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<Vehicle>>(`/transport/vehicles/${queryString}`);
  }

  /**
   * Get vehicle by ID
   */
  async getVehicle(id: string): Promise<Vehicle> {
    return apiClient.get<Vehicle>(`/transport/vehicles/${id}/`);
  }

  /**
   * Add vehicle
   */
  async addVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/transport/vehicles/',
        method: 'POST',
        data,
      });
      return data as Vehicle;
    }
    return apiClient.post<Vehicle>('/transport/vehicles/', data);
  }

  /**
   * Update vehicle
   */
  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: `/transport/vehicles/${id}/`,
        method: 'PATCH',
        data,
      });
      return { ...data, id } as Vehicle;
    }
    return apiClient.patch<Vehicle>(`/transport/vehicles/${id}/`, data);
  }

  /**
   * Delete vehicle
   */
  async deleteVehicle(id: string): Promise<void> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: `/transport/vehicles/${id}/`,
        method: 'DELETE',
      });
      return;
    }
    return apiClient.delete(`/transport/vehicles/${id}/`);
  }

  /**
   * Get drivers
   */
  async getDrivers(): Promise<Driver[]> {
    const response = await apiClient.get<PaginatedResponse<Driver>>('/transport/drivers/');
    return response.results;
  }

  /**
   * Get driver by ID
   */
  async getDriver(id: string): Promise<Driver> {
    return apiClient.get<Driver>(`/transport/drivers/${id}/`);
  }

  /**
   * Add driver
   */
  async addDriver(data: Partial<Driver>): Promise<Driver> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/transport/drivers/',
        method: 'POST',
        data,
      });
      return data as Driver;
    }
    return apiClient.post<Driver>('/transport/drivers/', data);
  }

  /**
   * Update driver
   */
  async updateDriver(id: string, data: Partial<Driver>): Promise<Driver> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: `/transport/drivers/${id}/`,
        method: 'PATCH',
        data,
      });
      return { ...data, id } as Driver;
    }
    return apiClient.patch<Driver>(`/transport/drivers/${id}/`, data);
  }

  /**
   * Get routes
   */
  async getRoutes(params?: QueryParams): Promise<PaginatedResponse<Route>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<Route>>(`/transport/routes/${queryString}`);
  }

  /**
   * Get route by ID
   */
  async getRoute(id: string): Promise<Route> {
    return apiClient.get<Route>(`/transport/routes/${id}/`);
  }

  /**
   * Create route
   */
  async createRoute(data: Partial<Route>): Promise<Route> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/transport/routes/',
        method: 'POST',
        data,
      });
      return data as Route;
    }
    return apiClient.post<Route>('/transport/routes/', data);
  }

  /**
   * Update route
   */
  async updateRoute(id: string, data: Partial<Route>): Promise<Route> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: `/transport/routes/${id}/`,
        method: 'PATCH',
        data,
      });
      return { ...data, id } as Route;
    }
    return apiClient.patch<Route>(`/transport/routes/${id}/`, data);
  }

  /**
   * Delete route
   */
  async deleteRoute(id: string): Promise<void> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: `/transport/routes/${id}/`,
        method: 'DELETE',
      });
      return;
    }
    return apiClient.delete(`/transport/routes/${id}/`);
  }

  /**
   * Get stops for a route
   */
  async getRouteStops(routeId: string): Promise<Stop[]> {
    const response = await apiClient.get<PaginatedResponse<Stop>>(`/transport/stops/?route=${routeId}`);
    return response.results.sort((a, b) => a.sequence_order - b.sequence_order);
  }

  /**
   * Add stop to route
   */
  async addStop(data: Partial<Stop>): Promise<Stop> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/transport/stops/',
        method: 'POST',
        data,
      });
      return data as Stop;
    }
    return apiClient.post<Stop>('/transport/stops/', data);
  }

  /**
   * Update stop
   */
  async updateStop(id: string, data: Partial<Stop>): Promise<Stop> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: `/transport/stops/${id}/`,
        method: 'PATCH',
        data,
      });
      return { ...data, id } as Stop;
    }
    return apiClient.patch<Stop>(`/transport/stops/${id}/`, data);
  }

  /**
   * Delete stop
   */
  async deleteStop(id: string): Promise<void> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: `/transport/stops/${id}/`,
        method: 'DELETE',
      });
      return;
    }
    return apiClient.delete(`/transport/stops/${id}/`);
  }

  /**
   * Get transport allocations
   */
  async getAllocations(params?: QueryParams): Promise<PaginatedResponse<TransportAllocation>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<TransportAllocation>>(`/transport/allocations/${queryString}`);
  }

  /**
   * Get student transport allocation
   */
  async getStudentAllocation(studentId: string): Promise<TransportAllocation | null> {
    const response = await apiClient.get<PaginatedResponse<TransportAllocation>>(
      `/transport/allocations/?student=${studentId}&is_active=true`
    );
    return response.results.length > 0 ? response.results[0] : null;
  }

  /**
   * Allocate transport to student
   */
  async allocateTransport(data: Partial<TransportAllocation>): Promise<TransportAllocation> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/transport/allocations/',
        method: 'POST',
        data,
      });
      return data as TransportAllocation;
    }
    return apiClient.post<TransportAllocation>('/transport/allocations/', data);
  }

  /**
   * Update allocation
   */
  async updateAllocation(id: string, data: Partial<TransportAllocation>): Promise<TransportAllocation> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: `/transport/allocations/${id}/`,
        method: 'PATCH',
        data,
      });
      return { ...data, id } as TransportAllocation;
    }
    return apiClient.patch<TransportAllocation>(`/transport/allocations/${id}/`, data);
  }

  /**
   * Cancel allocation
   */
  async cancelAllocation(id: string): Promise<void> {
    const data = {
      is_active: false,
      end_date: new Date().toISOString().split('T')[0],
    };
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: `/transport/allocations/${id}/`,
        method: 'PATCH',
        data,
      });
      return;
    }
    return apiClient.patch(`/transport/allocations/${id}/`, data);
  }

  /**
   * Get route details with stops and students
   */
  async getRouteDetails(routeId: string): Promise<{
    route: Route;
    stops: Stop[];
    students: number;
    vehicle?: Vehicle;
    driver?: Driver;
  }> {
    const route = await this.getRoute(routeId);
    const stops = await this.getRouteStops(routeId);
    const allocations = await apiClient.get<PaginatedResponse<TransportAllocation>>(
      `/transport/allocations/?route=${routeId}&is_active=true`
    );

    let vehicle, driver;
    if (route.vehicle) {
      vehicle = await this.getVehicle(route.vehicle);
    }
    if (route.driver) {
      driver = await this.getDriver(route.driver);
    }

    return {
      route,
      stops,
      students: allocations.count,
      vehicle,
      driver,
    };
  }

  /**
   * Get transport statistics
   */
  async getTransportStats(): Promise<{
    total_vehicles: number;
    active_vehicles: number;
    total_routes: number;
    active_routes: number;
    total_students: number;
  }> {
    const vehiclesResponse = await apiClient.get<PaginatedResponse<Vehicle>>('/transport/vehicles/');
    const activeVehicles = vehiclesResponse.results.filter(v => v.status === 'ACTIVE');
    const routesResponse = await apiClient.get<PaginatedResponse<Route>>('/transport/routes/');
    const activeRoutes = routesResponse.results.filter(r => r.is_active);
    const allocationsResponse = await apiClient.get<PaginatedResponse<TransportAllocation>>(
      '/transport/allocations/?is_active=true'
    );

    return {
      total_vehicles: vehiclesResponse.count,
      active_vehicles: activeVehicles.length,
      total_routes: routesResponse.count,
      active_routes: activeRoutes.length,
      total_students: allocationsResponse.count,
    };
  }

  /**
   * Get bus tracking information
   */
  async getBusTracking(routeId: string): Promise<BusTrackingInfo> {
    return apiClient.get<BusTrackingInfo>(`/transport/routes/${routeId}/tracking/`);
  }

  /**
   * Mark transport attendance
   */
  async markTransportAttendance(data: any): Promise<any> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/transport/attendance/',
        method: 'POST',
        data,
      });
      return data;
    }
    return apiClient.post('/transport/attendance/', data);
  }
}

export const transportService = new TransportService();
export default transportService;
