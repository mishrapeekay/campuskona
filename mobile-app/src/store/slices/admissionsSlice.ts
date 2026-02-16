/**
 * Admissions Redux Slice
 * Manages state for enquiries, applications, and admission settings.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { admissionsService } from '@/services/api';
import {
  AdmissionEnquiry,
  AdmissionApplication,
  AdmissionSetting,
  EnquiryQueryParams,
  ApplicationQueryParams,
} from '@/services/api/admissions.service';
import { PaginatedResponse, QueryParams } from '@/types/api';

// ──────────────────────── State Interface ────────────────────────

interface AdmissionsState {
  // Enquiries
  enquiries: AdmissionEnquiry[];
  enquiriesTotalCount: number;
  selectedEnquiry: AdmissionEnquiry | null;
  enquiryStats: Record<string, any> | null;

  // Applications
  applications: AdmissionApplication[];
  applicationsTotalCount: number;
  selectedApplication: AdmissionApplication | null;
  applicationStats: Record<string, any> | null;

  // Settings
  settings: AdmissionSetting[];

  // UI
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: AdmissionsState = {
  enquiries: [],
  enquiriesTotalCount: 0,
  selectedEnquiry: null,
  enquiryStats: null,

  applications: [],
  applicationsTotalCount: 0,
  selectedApplication: null,
  applicationStats: null,

  settings: [],

  isLoading: false,
  isSubmitting: false,
  error: null,
};

// ──────────────────────── Async Thunks ────────────────────────

export const fetchEnquiries = createAsyncThunk(
  'admissions/fetchEnquiries',
  async (params: EnquiryQueryParams = {}, { rejectWithValue }) => {
    try {
      return await admissionsService.getEnquiries(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch enquiries');
    }
  }
);

export const fetchEnquiryStats = createAsyncThunk(
  'admissions/fetchEnquiryStats',
  async (_, { rejectWithValue }) => {
    try {
      return await admissionsService.getEnquiryStats();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch enquiry stats');
    }
  }
);

export const createEnquiry = createAsyncThunk(
  'admissions/createEnquiry',
  async (data: Partial<AdmissionEnquiry>, { rejectWithValue }) => {
    try {
      return await admissionsService.createEnquiry(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create enquiry');
    }
  }
);

export const fetchApplications = createAsyncThunk(
  'admissions/fetchApplications',
  async (params: ApplicationQueryParams = {}, { rejectWithValue }) => {
    try {
      return await admissionsService.getApplications(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch applications');
    }
  }
);

export const fetchApplication = createAsyncThunk(
  'admissions/fetchApplication',
  async (id: string, { rejectWithValue }) => {
    try {
      return await admissionsService.getApplication(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch application');
    }
  }
);

export const createApplication = createAsyncThunk(
  'admissions/createApplication',
  async (data: Partial<AdmissionApplication>, { rejectWithValue }) => {
    try {
      return await admissionsService.createApplication(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create application');
    }
  }
);

export const submitApplication = createAsyncThunk(
  'admissions/submitApplication',
  async (id: string, { rejectWithValue }) => {
    try {
      return await admissionsService.submitApplication(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit application');
    }
  }
);

export const fetchApplicationStats = createAsyncThunk(
  'admissions/fetchApplicationStats',
  async (_, { rejectWithValue }) => {
    try {
      return await admissionsService.getApplicationStats();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch application stats');
    }
  }
);

export const fetchAdmissionSettings = createAsyncThunk(
  'admissions/fetchSettings',
  async (params: QueryParams = {}, { rejectWithValue }) => {
    try {
      return await admissionsService.getSettings(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch admission settings');
    }
  }
);

// ──────────────────────── Slice ────────────────────────

const admissionsSlice = createSlice({
  name: 'admissions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedEnquiry: (state) => {
      state.selectedEnquiry = null;
    },
    clearSelectedApplication: (state) => {
      state.selectedApplication = null;
    },
    setSelectedEnquiry: (state, action: PayloadAction<AdmissionEnquiry>) => {
      state.selectedEnquiry = action.payload;
    },
    setSelectedApplication: (state, action: PayloadAction<AdmissionApplication>) => {
      state.selectedApplication = action.payload;
    },
    clearAdmissions: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Enquiries
      .addCase(fetchEnquiries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enquiries = action.payload.results;
        state.enquiriesTotalCount = action.payload.count;
      })
      .addCase(fetchEnquiries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Enquiry Stats
      .addCase(fetchEnquiryStats.fulfilled, (state, action) => {
        state.enquiryStats = action.payload;
      })
      // Create Enquiry
      .addCase(createEnquiry.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createEnquiry.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.enquiries = [action.payload, ...state.enquiries];
        state.enquiriesTotalCount += 1;
      })
      .addCase(createEnquiry.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Applications
      .addCase(fetchApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload.results;
        state.applicationsTotalCount = action.payload.count;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Single Application
      .addCase(fetchApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedApplication = action.payload;
      })
      .addCase(fetchApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Application
      .addCase(createApplication.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.applications = [action.payload, ...state.applications];
        state.applicationsTotalCount += 1;
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Submit Application
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.selectedApplication = action.payload;
        const idx = state.applications.findIndex(a => a.id === action.payload.id);
        if (idx !== -1) state.applications[idx] = action.payload;
      })
      // Application Stats
      .addCase(fetchApplicationStats.fulfilled, (state, action) => {
        state.applicationStats = action.payload;
      })
      // Settings
      .addCase(fetchAdmissionSettings.fulfilled, (state, action) => {
        state.settings = action.payload.results;
      });
  },
});

export const {
  clearError,
  clearSelectedEnquiry,
  clearSelectedApplication,
  setSelectedEnquiry,
  setSelectedApplication,
  clearAdmissions,
} = admissionsSlice.actions;

export default admissionsSlice.reducer;
