/**
 * HR & Payroll API Service
 * Handles departments, designations, salary components/structures, payroll runs, and payslips.
 */

import apiClient from './client';
import { PaginatedResponse, QueryParams } from '@/types/api';

// ──────────────────────── Types ────────────────────────

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string | null;
  head_name?: string;
  description: string;
  is_active: boolean;
  designations_count?: number;
  staff_count?: number;
  created_at: string;
}

export interface Designation {
  id: string;
  name: string;
  department: string;
  department_name?: string;
  grade_level: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface SalaryComponent {
  id: string;
  name: string;
  component_type: 'EARNING' | 'DEDUCTION';
  component_type_display?: string;
  calculation_type: 'FIXED' | 'PERCENTAGE';
  calculation_type_display?: string;
  is_taxable: boolean;
  is_mandatory: boolean;
  description: string;
}

export interface SalaryStructureComponent {
  id: string;
  salary_structure: string;
  component: string;
  component_name?: string;
  component_type?: string;
  amount: number;
  percentage: number | null;
  formula: string;
}

export interface SalaryStructure {
  id: string;
  staff: string;
  staff_name?: string;
  employee_id?: string;
  effective_from: string;
  is_active: boolean;
  total_earnings: number;
  total_deductions: number;
  net_salary?: number;
  structure_components: SalaryStructureComponent[];
  created_at: string;
}

export interface PayrollRun {
  id: string;
  month: number;
  year: number;
  run_date: string;
  status: 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  status_display?: string;
  processed_by: string | null;
  processed_by_name?: string;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  payslips_count?: number;
  remarks: string;
  created_at: string;
}

export interface PayslipComponent {
  id: string;
  component: string;
  component_name?: string;
  amount: number;
  component_type: 'EARNING' | 'DEDUCTION';
}

export interface Payslip {
  id: string;
  payroll_run: string;
  staff: string;
  staff_name?: string;
  employee_id?: string;
  department_name?: string;
  designation_name?: string;
  month: number;
  year: number;
  working_days: number;
  present_days: number;
  leave_days: number;
  gross_salary: number;
  total_deductions: number;
  net_salary: number;
  status: 'DRAFT' | 'GENERATED' | 'APPROVED' | 'PAID';
  status_display?: string;
  payment_date: string | null;
  payment_mode: 'BANK_TRANSFER' | 'CHEQUE' | 'CASH';
  payment_mode_display?: string;
  transaction_reference: string;
  components: PayslipComponent[];
  created_at: string;
}

export interface HRDashboardStats {
  total_departments: number;
  total_designations: number;
  total_staff_with_structures: number;
  active_payroll_runs: number;
  latest_payroll_month: string;
  total_salary_expense: number;
}

// ──────────────────────── Service ────────────────────────

class HRPayrollService {
  // ── Departments ──

  async getDepartments(params?: QueryParams & { is_active?: boolean }): Promise<PaginatedResponse<Department>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<Department>>(`/hr/departments/${queryString}`);
  }

  async getDepartment(id: string): Promise<Department> {
    return apiClient.get<Department>(`/hr/departments/${id}/`);
  }

  async createDepartment(data: Partial<Department>): Promise<Department> {
    return apiClient.post<Department>('/hr/departments/', data);
  }

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    return apiClient.patch<Department>(`/hr/departments/${id}/`, data);
  }

  // ── Designations ──

  async getDesignations(params?: QueryParams & { department?: string; is_active?: boolean }): Promise<PaginatedResponse<Designation>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<Designation>>(`/hr/designations/${queryString}`);
  }

  async getDesignation(id: string): Promise<Designation> {
    return apiClient.get<Designation>(`/hr/designations/${id}/`);
  }

  async createDesignation(data: Partial<Designation>): Promise<Designation> {
    return apiClient.post<Designation>('/hr/designations/', data);
  }

  async updateDesignation(id: string, data: Partial<Designation>): Promise<Designation> {
    return apiClient.patch<Designation>(`/hr/designations/${id}/`, data);
  }

  // ── Salary Components ──

  async getSalaryComponents(params?: QueryParams & { component_type?: string }): Promise<PaginatedResponse<SalaryComponent>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<SalaryComponent>>(`/hr/salary-components/${queryString}`);
  }

  async createSalaryComponent(data: Partial<SalaryComponent>): Promise<SalaryComponent> {
    return apiClient.post<SalaryComponent>('/hr/salary-components/', data);
  }

  async updateSalaryComponent(id: string, data: Partial<SalaryComponent>): Promise<SalaryComponent> {
    return apiClient.patch<SalaryComponent>(`/hr/salary-components/${id}/`, data);
  }

  // ── Salary Structures ──

  async getSalaryStructures(params?: QueryParams & { staff?: string; is_active?: boolean }): Promise<PaginatedResponse<SalaryStructure>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<SalaryStructure>>(`/hr/salary-structures/${queryString}`);
  }

  async getSalaryStructure(id: string): Promise<SalaryStructure> {
    return apiClient.get<SalaryStructure>(`/hr/salary-structures/${id}/`);
  }

  async createSalaryStructure(data: Partial<SalaryStructure>): Promise<SalaryStructure> {
    return apiClient.post<SalaryStructure>('/hr/salary-structures/', data);
  }

  async updateSalaryStructure(id: string, data: Partial<SalaryStructure>): Promise<SalaryStructure> {
    return apiClient.patch<SalaryStructure>(`/hr/salary-structures/${id}/`, data);
  }

  // ── Structure Components ──

  async addStructureComponent(data: Partial<SalaryStructureComponent>): Promise<SalaryStructureComponent> {
    return apiClient.post<SalaryStructureComponent>('/hr/structure-components/', data);
  }

  async updateStructureComponent(id: string, data: Partial<SalaryStructureComponent>): Promise<SalaryStructureComponent> {
    return apiClient.patch<SalaryStructureComponent>(`/hr/structure-components/${id}/`, data);
  }

  async deleteStructureComponent(id: string): Promise<void> {
    return apiClient.delete(`/hr/structure-components/${id}/`);
  }

  // ── Payroll Runs ──

  async getPayrollRuns(params?: QueryParams & { status?: string; year?: number; month?: number }): Promise<PaginatedResponse<PayrollRun>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<PayrollRun>>(`/hr/payroll-runs/${queryString}`);
  }

  async getPayrollRun(id: string): Promise<PayrollRun> {
    return apiClient.get<PayrollRun>(`/hr/payroll-runs/${id}/`);
  }

  async createPayrollRun(data: Partial<PayrollRun>): Promise<PayrollRun> {
    return apiClient.post<PayrollRun>('/hr/payroll-runs/', data);
  }

  async processPayrollRun(id: string): Promise<PayrollRun> {
    return apiClient.post<PayrollRun>(`/hr/payroll-runs/${id}/process/`);
  }

  async cancelPayrollRun(id: string): Promise<PayrollRun> {
    return apiClient.post<PayrollRun>(`/hr/payroll-runs/${id}/cancel/`);
  }

  async getDashboardStats(): Promise<HRDashboardStats> {
    return apiClient.get<HRDashboardStats>('/hr/payroll-runs/dashboard_stats/');
  }

  // ── Payslips ──

  async getPayslips(params?: QueryParams & { staff?: string; status?: string; year?: number; month?: number; payroll_run?: string }): Promise<PaginatedResponse<Payslip>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<Payslip>>(`/hr/payslips/${queryString}`);
  }

  async getPayslip(id: string): Promise<Payslip> {
    return apiClient.get<Payslip>(`/hr/payslips/${id}/`);
  }

  async approvePayslip(id: string): Promise<Payslip> {
    return apiClient.post<Payslip>(`/hr/payslips/${id}/approve/`);
  }

  async markPayslipPaid(id: string, paymentData: { payment_date: string; payment_mode: string; transaction_reference?: string }): Promise<Payslip> {
    return apiClient.post<Payslip>(`/hr/payslips/${id}/mark_paid/`, paymentData);
  }
}

export const hrPayrollService = new HRPayrollService();
export default hrPayrollService;
