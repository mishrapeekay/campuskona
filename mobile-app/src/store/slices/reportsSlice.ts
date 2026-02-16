/**
 * Reports & Analytics Redux Slice
 * Manages state for report templates, generated reports, schedules, and saved reports.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reportsService } from '@/services/api';
import {
  ReportTemplate,
  GeneratedReport,
  ReportSchedule,
  SavedReport,
  ReportGenerateRequest,
  ReportStats,
  ModuleTemplateGroup,
} from '@/services/api/reports.service';
import { PaginatedResponse, QueryParams } from '@/types/api';

// ──────────────────────── State Interface ────────────────────────

interface ReportsState {
  templates: ReportTemplate[];
  templatesTotalCount: number;
  templatesByModule: Record<string, ModuleTemplateGroup> | null;
  selectedTemplate: ReportTemplate | null;

  generatedReports: GeneratedReport[];
  generatedReportsTotalCount: number;
  selectedReport: GeneratedReport | null;
  reportStats: ReportStats | null;

  schedules: ReportSchedule[];
  schedulesTotalCount: number;

  savedReports: SavedReport[];
  pinnedReports: SavedReport[];

  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  templates: [],
  templatesTotalCount: 0,
  templatesByModule: null,
  selectedTemplate: null,

  generatedReports: [],
  generatedReportsTotalCount: 0,
  selectedReport: null,
  reportStats: null,

  schedules: [],
  schedulesTotalCount: 0,

  savedReports: [],
  pinnedReports: [],

  isLoading: false,
  isGenerating: false,
  error: null,
};

// ──────────────────────── Async Thunks ────────────────────────

// Templates
export const fetchTemplates = createAsyncThunk(
  'reports/fetchTemplates',
  async (params: QueryParams & { module?: string } = {}, { rejectWithValue }) => {
    try {
      return await reportsService.getTemplates(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch report templates');
    }
  }
);

export const fetchTemplatesByModule = createAsyncThunk(
  'reports/fetchTemplatesByModule',
  async (_, { rejectWithValue }) => {
    try {
      return await reportsService.getTemplatesByModule();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch templates by module');
    }
  }
);

export const fetchTemplate = createAsyncThunk(
  'reports/fetchTemplate',
  async (id: string, { rejectWithValue }) => {
    try {
      return await reportsService.getTemplate(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch template');
    }
  }
);

export const duplicateTemplate = createAsyncThunk(
  'reports/duplicateTemplate',
  async (id: string, { rejectWithValue }) => {
    try {
      return await reportsService.duplicateTemplate(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to duplicate template');
    }
  }
);

// Generated Reports
export const fetchGeneratedReports = createAsyncThunk(
  'reports/fetchGeneratedReports',
  async (params: QueryParams & { module?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      return await reportsService.getGeneratedReports(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch generated reports');
    }
  }
);

export const generateReport = createAsyncThunk(
  'reports/generateReport',
  async (data: ReportGenerateRequest, { rejectWithValue }) => {
    try {
      return await reportsService.generateReport(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate report');
    }
  }
);

export const regenerateReport = createAsyncThunk(
  'reports/regenerateReport',
  async (id: string, { rejectWithValue }) => {
    try {
      return await reportsService.regenerateReport(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to regenerate report');
    }
  }
);

export const fetchReportStats = createAsyncThunk(
  'reports/fetchReportStats',
  async (_, { rejectWithValue }) => {
    try {
      return await reportsService.getReportStats();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch report stats');
    }
  }
);

// Schedules
export const fetchSchedules = createAsyncThunk(
  'reports/fetchSchedules',
  async (params: QueryParams & { is_active?: boolean } = {}, { rejectWithValue }) => {
    try {
      return await reportsService.getSchedules(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch report schedules');
    }
  }
);

export const toggleScheduleActive = createAsyncThunk(
  'reports/toggleScheduleActive',
  async (id: string, { rejectWithValue }) => {
    try {
      return await reportsService.toggleScheduleActive(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle schedule');
    }
  }
);

// Saved Reports
export const fetchSavedReports = createAsyncThunk(
  'reports/fetchSavedReports',
  async (params: QueryParams = {}, { rejectWithValue }) => {
    try {
      return await reportsService.getSavedReports(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch saved reports');
    }
  }
);

export const fetchPinnedReports = createAsyncThunk(
  'reports/fetchPinnedReports',
  async (_, { rejectWithValue }) => {
    try {
      return await reportsService.getPinnedReports();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pinned reports');
    }
  }
);

export const saveReport = createAsyncThunk(
  'reports/saveReport',
  async (data: Partial<SavedReport>, { rejectWithValue }) => {
    try {
      return await reportsService.saveReport(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save report');
    }
  }
);

export const togglePin = createAsyncThunk(
  'reports/togglePin',
  async (id: string, { rejectWithValue }) => {
    try {
      return await reportsService.togglePin(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle pin');
    }
  }
);

// ──────────────────────── Slice ────────────────────────

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedTemplate: (state, action: PayloadAction<ReportTemplate>) => {
      state.selectedTemplate = action.payload;
    },
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
    },
    setSelectedReport: (state, action: PayloadAction<GeneratedReport>) => {
      state.selectedReport = action.payload;
    },
    clearSelectedReport: (state) => {
      state.selectedReport = null;
    },
    clearReports: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Templates
      .addCase(fetchTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = action.payload.results;
        state.templatesTotalCount = action.payload.count;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Templates by Module
      .addCase(fetchTemplatesByModule.fulfilled, (state, action) => {
        state.templatesByModule = action.payload;
      })
      // Single Template
      .addCase(fetchTemplate.fulfilled, (state, action) => {
        state.selectedTemplate = action.payload;
      })
      // Duplicate Template
      .addCase(duplicateTemplate.fulfilled, (state, action) => {
        state.templates = [action.payload, ...state.templates];
        state.templatesTotalCount += 1;
      })
      // Generated Reports
      .addCase(fetchGeneratedReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGeneratedReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.generatedReports = action.payload.results;
        state.generatedReportsTotalCount = action.payload.count;
      })
      .addCase(fetchGeneratedReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Generate Report
      .addCase(generateReport.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generatedReports = [action.payload, ...state.generatedReports];
        state.generatedReportsTotalCount += 1;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      })
      // Regenerate Report
      .addCase(regenerateReport.fulfilled, (state, action) => {
        state.generatedReports = [action.payload, ...state.generatedReports];
        state.generatedReportsTotalCount += 1;
      })
      // Report Stats
      .addCase(fetchReportStats.fulfilled, (state, action) => {
        state.reportStats = action.payload;
      })
      // Schedules
      .addCase(fetchSchedules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schedules = action.payload.results;
        state.schedulesTotalCount = action.payload.count;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Toggle Schedule
      .addCase(toggleScheduleActive.fulfilled, (state, action) => {
        const idx = state.schedules.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.schedules[idx] = action.payload;
      })
      // Saved Reports
      .addCase(fetchSavedReports.fulfilled, (state, action) => {
        state.savedReports = action.payload.results;
      })
      // Pinned Reports
      .addCase(fetchPinnedReports.fulfilled, (state, action) => {
        state.pinnedReports = action.payload;
      })
      // Save Report
      .addCase(saveReport.fulfilled, (state, action) => {
        state.savedReports = [action.payload, ...state.savedReports];
      })
      // Toggle Pin
      .addCase(togglePin.fulfilled, (state, action) => {
        const idx = state.savedReports.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.savedReports[idx] = action.payload;
        if (action.payload.is_pinned) {
          state.pinnedReports = [action.payload, ...state.pinnedReports.filter(p => p.id !== action.payload.id)];
        } else {
          state.pinnedReports = state.pinnedReports.filter(p => p.id !== action.payload.id);
        }
      });
  },
});

export const {
  clearError,
  setSelectedTemplate,
  clearSelectedTemplate,
  setSelectedReport,
  clearSelectedReport,
  clearReports,
} = reportsSlice.actions;

export default reportsSlice.reducer;
