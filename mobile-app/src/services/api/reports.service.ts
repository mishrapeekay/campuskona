/**
 * Reports & Analytics API Service
 * Handles report templates, generated reports, schedules, and saved reports.
 */

import apiClient from './client';
import { PaginatedResponse, QueryParams } from '@/types/api';

// ──────────────────────── Types ────────────────────────

export type ReportModule =
  | 'STUDENTS' | 'ACADEMICS' | 'ATTENDANCE' | 'FEE' | 'EXAM'
  | 'LIBRARY' | 'TRANSPORT' | 'HOSTEL' | 'HR_PAYROLL'
  | 'ADMISSIONS' | 'CUSTOM';

export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV';
export type ReportStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
export type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  module: ReportModule;
  module_display?: string;
  query_config: Record<string, any>;
  layout_config: Record<string, any>;
  default_format: ReportFormat;
  is_system: boolean;
  is_active: boolean;
  created_by: string | null;
  created_by_name?: string;
  schedules_count?: number;
  created_at: string;
  updated_at: string;
}

export interface GeneratedReport {
  id: string;
  template: string | null;
  template_name?: string;
  name: string;
  description: string;
  module: ReportModule;
  module_display?: string;
  parameters: Record<string, any>;
  output_format: ReportFormat;
  format_display?: string;
  file: string | null;
  file_size: number;
  row_count: number;
  status: ReportStatus;
  status_display?: string;
  error_message: string;
  generated_by: string | null;
  generated_by_name?: string;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportSchedule {
  id: string;
  template: string;
  template_name?: string;
  name: string;
  frequency: ScheduleFrequency;
  frequency_display?: string;
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string;
  output_format: ReportFormat;
  parameters: Record<string, any>;
  email_recipients: string[];
  is_active: boolean;
  last_run: string | null;
  next_run: string | null;
  created_by: string | null;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedReport {
  id: string;
  user: string;
  name: string;
  template: string | null;
  template_name?: string;
  parameters: Record<string, any>;
  output_format: ReportFormat;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportGenerateRequest {
  template_id?: string;
  name: string;
  module: ReportModule;
  parameters?: Record<string, any>;
  output_format?: ReportFormat;
}

export interface ReportStats {
  total: number;
  by_status: Record<string, number>;
  by_module: Record<string, number>;
  by_format: Record<string, number>;
}

export interface ModuleTemplateGroup {
  label: string;
  count: number;
  templates: ReportTemplate[];
}

// ──────────────────────── Service ────────────────────────

class ReportsService {
  // ── Templates ──

  async getTemplates(params?: QueryParams & { module?: string; is_system?: boolean; is_active?: boolean }): Promise<PaginatedResponse<ReportTemplate>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<ReportTemplate>>(`/reports/templates/${queryString}`);
  }

  async getTemplate(id: string): Promise<ReportTemplate> {
    return apiClient.get<ReportTemplate>(`/reports/templates/${id}/`);
  }

  async createTemplate(data: Partial<ReportTemplate>): Promise<ReportTemplate> {
    return apiClient.post<ReportTemplate>('/reports/templates/', data);
  }

  async updateTemplate(id: string, data: Partial<ReportTemplate>): Promise<ReportTemplate> {
    return apiClient.patch<ReportTemplate>(`/reports/templates/${id}/`, data);
  }

  async deleteTemplate(id: string): Promise<void> {
    return apiClient.delete(`/reports/templates/${id}/`);
  }

  async getTemplatesByModule(): Promise<Record<string, ModuleTemplateGroup>> {
    return apiClient.get<Record<string, ModuleTemplateGroup>>('/reports/templates/by_module/');
  }

  async duplicateTemplate(id: string): Promise<ReportTemplate> {
    return apiClient.post<ReportTemplate>(`/reports/templates/${id}/duplicate/`);
  }

  // ── Generated Reports ──

  async getGeneratedReports(params?: QueryParams & { module?: string; status?: string; output_format?: string }): Promise<PaginatedResponse<GeneratedReport>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<GeneratedReport>>(`/reports/generated/${queryString}`);
  }

  async getGeneratedReport(id: string): Promise<GeneratedReport> {
    return apiClient.get<GeneratedReport>(`/reports/generated/${id}/`);
  }

  async generateReport(data: ReportGenerateRequest): Promise<GeneratedReport> {
    return apiClient.post<GeneratedReport>('/reports/generated/generate/', data);
  }

  async regenerateReport(id: string): Promise<GeneratedReport> {
    return apiClient.post<GeneratedReport>(`/reports/generated/${id}/regenerate/`);
  }

  async getReportStats(): Promise<ReportStats> {
    return apiClient.get<ReportStats>('/reports/generated/stats/');
  }

  async downloadReport(id: string, filename: string): Promise<void> {
    return apiClient.downloadFile(`/reports/generated/${id}/`, filename);
  }

  // ── Schedules ──

  async getSchedules(params?: QueryParams & { frequency?: string; is_active?: boolean }): Promise<PaginatedResponse<ReportSchedule>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<ReportSchedule>>(`/reports/schedules/${queryString}`);
  }

  async getSchedule(id: string): Promise<ReportSchedule> {
    return apiClient.get<ReportSchedule>(`/reports/schedules/${id}/`);
  }

  async createSchedule(data: Partial<ReportSchedule>): Promise<ReportSchedule> {
    return apiClient.post<ReportSchedule>('/reports/schedules/', data);
  }

  async updateSchedule(id: string, data: Partial<ReportSchedule>): Promise<ReportSchedule> {
    return apiClient.patch<ReportSchedule>(`/reports/schedules/${id}/`, data);
  }

  async deleteSchedule(id: string): Promise<void> {
    return apiClient.delete(`/reports/schedules/${id}/`);
  }

  async toggleScheduleActive(id: string): Promise<ReportSchedule> {
    return apiClient.post<ReportSchedule>(`/reports/schedules/${id}/toggle_active/`);
  }

  async runScheduleNow(id: string): Promise<{ message: string; report: GeneratedReport }> {
    return apiClient.post(`/reports/schedules/${id}/run_now/`);
  }

  // ── Saved Reports ──

  async getSavedReports(params?: QueryParams & { is_pinned?: boolean }): Promise<PaginatedResponse<SavedReport>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<SavedReport>>(`/reports/saved/${queryString}`);
  }

  async getSavedReport(id: string): Promise<SavedReport> {
    return apiClient.get<SavedReport>(`/reports/saved/${id}/`);
  }

  async saveReport(data: Partial<SavedReport>): Promise<SavedReport> {
    return apiClient.post<SavedReport>('/reports/saved/', data);
  }

  async updateSavedReport(id: string, data: Partial<SavedReport>): Promise<SavedReport> {
    return apiClient.patch<SavedReport>(`/reports/saved/${id}/`, data);
  }

  async deleteSavedReport(id: string): Promise<void> {
    return apiClient.delete(`/reports/saved/${id}/`);
  }

  async togglePin(id: string): Promise<SavedReport> {
    return apiClient.post<SavedReport>(`/reports/saved/${id}/toggle_pin/`);
  }

  async getPinnedReports(): Promise<SavedReport[]> {
    return apiClient.get<SavedReport[]>('/reports/saved/pinned/');
  }
}

export const reportsService = new ReportsService();
export default reportsService;
