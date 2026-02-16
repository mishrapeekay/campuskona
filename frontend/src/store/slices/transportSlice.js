import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as transportAPI from '../../api/transport';

export const fetchVehicles = createAsyncThunk('transport/fetchVehicles', async (_, { rejectWithValue }) => {
    try {
        const response = await transportAPI.getVehicles();
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const fetchRoutes = createAsyncThunk('transport/fetchRoutes', async (_, { rejectWithValue }) => {
    try {
        const response = await transportAPI.getRoutes();
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const fetchDrivers = createAsyncThunk('transport/fetchDrivers', async (_, { rejectWithValue }) => {
    try {
        const response = await transportAPI.getDrivers();
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const createRoute = createAsyncThunk('transport/createRoute', async (data, { rejectWithValue }) => {
    try {
        const response = await transportAPI.createRoute(data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const deleteRoute = createAsyncThunk('transport/deleteRoute', async (id, { rejectWithValue }) => {
    try {
        await transportAPI.deleteRoute(id);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const addStop = createAsyncThunk('transport/addStop', async ({ routeId, data }, { rejectWithValue }) => {
    try {
        const response = await transportAPI.addStop(routeId, data);
        return { routeId, stop: response.data };
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const fetchAllocations = createAsyncThunk('transport/fetchAllocations', async (params, { rejectWithValue }) => {
    try {
        const response = await transportAPI.getAllocations(params);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const createAllocation = createAsyncThunk('transport/createAllocation', async (data, { rejectWithValue }) => {
    try {
        const response = await transportAPI.createAllocation(data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const deleteAllocation = createAsyncThunk('transport/deleteAllocation', async (id, { rejectWithValue }) => {
    try {
        await transportAPI.deleteAllocation(id);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

const initialState = {
    vehicles: [],
    routes: [],
    drivers: [],
    allocations: [],
    loading: false,
    error: null,
};

const transportSlice = createSlice({
    name: 'transport',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchVehicles.fulfilled, (state, action) => {
                state.vehicles = action.payload.results || action.payload;
            })
            .addCase(fetchRoutes.fulfilled, (state, action) => {
                state.routes = action.payload.results || action.payload;
            })
            .addCase(fetchDrivers.fulfilled, (state, action) => {
                state.drivers = action.payload.results || action.payload;
            })
            .addCase(createRoute.fulfilled, (state, action) => {
                state.routes.push(action.payload);
            })
            .addCase(deleteRoute.fulfilled, (state, action) => {
                state.routes = state.routes.filter(r => r.id !== action.payload);
            })
            .addCase(addStop.fulfilled, (state, action) => {
                const route = state.routes.find(r => r.id === action.payload.routeId);
                if (route) {
                    if (!route.stops) route.stops = [];
                    route.stops.push(action.payload.stop);
                }
            })
            .addCase(fetchAllocations.fulfilled, (state, action) => {
                state.allocations = action.payload.results || action.payload;
            })
            .addCase(createAllocation.fulfilled, (state, action) => {
                state.allocations.push(action.payload);
            })
            .addCase(deleteAllocation.fulfilled, (state, action) => {
                state.allocations = state.allocations.filter(a => a.id !== action.payload);
            });
    },
});

export default transportSlice.reducer;
