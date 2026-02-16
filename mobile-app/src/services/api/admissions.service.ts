/**
 * Admissions API Service
 * Handles enquiries, applications, documents, and admission settings.
 */

import apiClient from './client';
import { PaginatedResponse, QueryParams } from '@/types/api';

// ──────────────────────── Types ────────────────────────

export interface AdmissionEnquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  class_applied: string | null;
  class_applied_name?: string;
  enquiry_date: string;
  source: 'WALK_IN' | 'PHONE' | 'ONLINE' | 'REFERRAL';
  source_display?: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';
  status_display?: string;
  notes: string;
  follow_up_date: string | null;
  assigned_to: string | null;
  assigned_to_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AdmissionDocument {
  id: string;
  application: string;
  document_type: string;
  document_type_display?: string;
  file: string;
  uploaded_at: string;
  verified: boolean;
  verified_by: string | null;
  verified_date: string | null;
}

export interface AdmissionApplication {
  id: string;
  application_number: string;
  enquiry: string | null;
  student_name: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
  gender_display?: string;
  class_applied: string;
  class_applied_name?: string;
  academic_year: string;
  academic_year_name?: string;
  father_name: string;
  mother_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  previous_school: string;
  previous_class: string;
  board: string;
  percentage: number | null;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'DOCUMENTS_PENDING' | 'APPROVED' | 'REJECTED' | 'ENROLLED' | 'WITHDRAWN';
  status_display?: string;
  submitted_date: string | null;
  reviewed_by: string | null;
  reviewed_date: string | null;
  remarks: string;
  documents: AdmissionDocument[];
  created_at: string;
  updated_at: string;
}

export interface AdmissionSetting {
  id: string;
  academic_year: string;
  academic_year_name?: string;
  class_applied: string;
  class_applied_name?: string;
  total_seats: number;
  filled_seats: number;
  available_seats: number;
  application_start_date: string;
  application_end_date: string;
  entrance_test_required: boolean;
  interview_required: boolean;
  application_fee: number;
  is_open: boolean;
}

export interface EnquiryQueryParams extends QueryParams {
  status?: string;
  source?: string;
  enquiry_date_from?: string;
  enquiry_date_to?: string;
}

export interface ApplicationQueryParams extends QueryParams {
  status?: string;
  class_applied?: string;
  academic_year?: string;
}

// ──────────────────────── Service ────────────────────────

class AdmissionsService {
  // ── Enquiries ──

  async getEnquiries(params?: EnquiryQueryParams): Promise<PaginatedResponse<AdmissionEnquiry>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<AdmissionEnquiry>>(`/admissions/enquiries/${queryString}`);
  }

  async getEnquiry(id: string): Promise<AdmissionEnquiry> {
    return apiClient.get<AdmissionEnquiry>(`/admissions/enquiries/${id}/`);
  }

  async createEnquiry(data: Partial<AdmissionEnquiry>): Promise<AdmissionEnquiry> {
    return apiClient.post<AdmissionEnquiry>('/admissions/enquiries/', data);
  }

  async updateEnquiry(id: string, data: Partial<AdmissionEnquiry>): Promise<AdmissionEnquiry> {
    return apiClient.patch<AdmissionEnquiry>(`/admissions/enquiries/${id}/`, data);
  }

  async convertEnquiryToApplication(id: string): Promise<AdmissionApplication> {
    return apiClient.post<AdmissionApplication>(`/admissions/enquiries/${id}/convert_to_application/`);
  }

  async getEnquiryStats(): Promise<Record<string, any>> {
    return apiClient.get<Record<string, any>>('/admissions/enquiries/stats/');
  }

  // ── Applications ──

  async getApplications(params?: ApplicationQueryParams): Promise<PaginatedResponse<AdmissionApplication>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<AdmissionApplication>>(`/admissions/applications/${queryString}`);
  }

  async getApplication(id: string): Promise<AdmissionApplication> {
    return apiClient.get<AdmissionApplication>(`/admissions/applications/${id}/`);
  }

  async createApplication(data: Partial<AdmissionApplication>): Promise<AdmissionApplication> {
    return apiClient.post<AdmissionApplication>('/admissions/applications/', data);
  }

  async updateApplication(id: string, data: Partial<AdmissionApplication>): Promise<AdmissionApplication> {
    return apiClient.patch<AdmissionApplication>(`/admissions/applications/${id}/`, data);
  }

  async submitApplication(id: string): Promise<AdmissionApplication> {
    return apiClient.post<AdmissionApplication>(`/admissions/applications/${id}/submit/`);
  }

  async approveApplication(id: string, remarks?: string): Promise<AdmissionApplication> {
    return apiClient.post<AdmissionApplication>(`/admissions/applications/${id}/approve/`, { remarks });
  }

  async rejectApplication(id: string, remarks?: string): Promise<AdmissionApplication> {
    return apiClient.post<AdmissionApplication>(`/admissions/applications/${id}/reject/`, { remarks });
  }

  async enrollApplication(id: string): Promise<AdmissionApplication> {
    return apiClient.post<AdmissionApplication>(`/admissions/applications/${id}/enroll/`);
  }

  async getApplicationStats(): Promise<Record<string, any>> {
    return apiClient.get<Record<string, any>>('/admissions/applications/stats/');
  }

  // ── Documents ──

  async getDocuments(applicationId: string): Promise<PaginatedResponse<AdmissionDocument>> {
    return apiClient.get<PaginatedResponse<AdmissionDocument>>(
      `/admissions/documents/?application=${applicationId}`
    );
  }

  async uploadDocument(applicationId: string, file: any, documentType: string): Promise<AdmissionDocument> {
    return apiClient.uploadFile<AdmissionDocument>('/admissions/documents/', file, {
      application: applicationId,
      document_type: documentType,
    });
  }

  async verifyDocument(id: string): Promise<AdmissionDocument> {
    return apiClient.post<AdmissionDocument>(`/admissions/documents/${id}/verify/`);
  }

  async rejectDocument(id: string): Promise<AdmissionDocument> {
    return apiClient.post<AdmissionDocument>(`/admissions/documents/${id}/reject/`);
  }

  // ── Settings ──

  async getSettings(params?: QueryParams): Promise<PaginatedResponse<AdmissionSetting>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<AdmissionSetting>>(`/admissions/settings/${queryString}`);
  }

  async getSetting(id: string): Promise<AdmissionSetting> {
    return apiClient.get<AdmissionSetting>(`/admissions/settings/${id}/`);
  }

  async createSetting(data: Partial<AdmissionSetting>): Promise<AdmissionSetting> {
    return apiClient.post<AdmissionSetting>('/admissions/settings/', data);
  }

  async updateSetting(id: string, data: Partial<AdmissionSetting>): Promise<AdmissionSetting> {
    return apiClient.patch<AdmissionSetting>(`/admissions/settings/${id}/`, data);
  }
}

export const admissionsService = new AdmissionsService();
export default admissionsService;
