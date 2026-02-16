import client from './client';

const BASE_URL = '/transport';

// Vehicles
export const getVehicles = () => client.get(`${BASE_URL}/vehicles/`);
export const createVehicle = (data) => client.post(`${BASE_URL}/vehicles/`, data);
export const updateVehicle = (id, data) => client.put(`${BASE_URL}/vehicles/${id}/`, data);
export const deleteVehicle = (id) => client.delete(`${BASE_URL}/vehicles/${id}/`);

// Drivers
export const getDrivers = () => client.get(`${BASE_URL}/drivers/`);
export const createDriver = (data) => client.post(`${BASE_URL}/drivers/`, data);
export const updateDriver = (id, data) => client.put(`${BASE_URL}/drivers/${id}/`, data);
export const deleteDriver = (id) => client.delete(`${BASE_URL}/drivers/${id}/`);

// Routes
export const getRoutes = () => client.get(`${BASE_URL}/routes/`);
export const createRoute = (data) => client.post(`${BASE_URL}/routes/`, data);
export const updateRoute = (id, data) => client.put(`${BASE_URL}/routes/${id}/`, data);
export const deleteRoute = (id) => client.delete(`${BASE_URL}/routes/${id}/`);

// Stops
export const addStop = (routeId, data) => client.post(`${BASE_URL}/routes/${routeId}/add_stop/`, data);
export const updateStop = (id, data) => client.put(`${BASE_URL}/stops/${id}/`, data);
export const deleteStop = (id) => client.delete(`${BASE_URL}/stops/${id}/`);

// Allocations
export const getAllocations = (params) => client.get(`${BASE_URL}/allocations/`, { params });
export const createAllocation = (data) => client.post(`${BASE_URL}/allocations/`, data);
export const deleteAllocation = (id) => client.delete(`${BASE_URL}/allocations/${id}/`);

export const getDashboardStats = () => client.get(`${BASE_URL}/allocations/dashboard_stats/`);
