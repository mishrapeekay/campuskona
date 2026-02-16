import apiClient, { buildQueryString } from './client';

const DEPT_ENDPOINT = '/hr/departments';
const DESIG_ENDPOINT = '/hr/designations';
const COMPONENT_ENDPOINT = '/hr/salary-components';
const STRUCTURE_ENDPOINT = '/hr/salary-structures';
const STRUCTURE_COMP_ENDPOINT = '/hr/structure-components';
const PAYROLL_ENDPOINT = '/hr/payroll-runs';
const PAYSLIP_ENDPOINT = '/hr/payslips';

// ── Departments ──

export const getDepartments = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${DEPT_ENDPOINT}/?${queryString}`);
};

export const getDepartmentById = (id) => apiClient.get(`${DEPT_ENDPOINT}/${id}/`);
export const createDepartment = (data) => apiClient.post(`${DEPT_ENDPOINT}/`, data);
export const updateDepartment = (id, data) => apiClient.patch(`${DEPT_ENDPOINT}/${id}/`, data);
export const deleteDepartment = (id) => apiClient.delete(`${DEPT_ENDPOINT}/${id}/`);

// ── Designations ──

export const getDesignations = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${DESIG_ENDPOINT}/?${queryString}`);
};

export const getDesignationById = (id) => apiClient.get(`${DESIG_ENDPOINT}/${id}/`);
export const createDesignation = (data) => apiClient.post(`${DESIG_ENDPOINT}/`, data);
export const updateDesignation = (id, data) => apiClient.patch(`${DESIG_ENDPOINT}/${id}/`, data);
export const deleteDesignation = (id) => apiClient.delete(`${DESIG_ENDPOINT}/${id}/`);

// ── Salary Components ──

export const getSalaryComponents = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${COMPONENT_ENDPOINT}/?${queryString}`);
};

export const createSalaryComponent = (data) => apiClient.post(`${COMPONENT_ENDPOINT}/`, data);
export const updateSalaryComponent = (id, data) => apiClient.patch(`${COMPONENT_ENDPOINT}/${id}/`, data);
export const deleteSalaryComponent = (id) => apiClient.delete(`${COMPONENT_ENDPOINT}/${id}/`);

// ── Salary Structures ──

export const getSalaryStructures = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${STRUCTURE_ENDPOINT}/?${queryString}`);
};

export const getSalaryStructureById = (id) => apiClient.get(`${STRUCTURE_ENDPOINT}/${id}/`);
export const createSalaryStructure = (data) => apiClient.post(`${STRUCTURE_ENDPOINT}/`, data);
export const updateSalaryStructure = (id, data) => apiClient.patch(`${STRUCTURE_ENDPOINT}/${id}/`, data);

// ── Structure Components ──

export const addStructureComponent = (data) => apiClient.post(`${STRUCTURE_COMP_ENDPOINT}/`, data);
export const updateStructureComponent = (id, data) => apiClient.patch(`${STRUCTURE_COMP_ENDPOINT}/${id}/`, data);
export const deleteStructureComponent = (id) => apiClient.delete(`${STRUCTURE_COMP_ENDPOINT}/${id}/`);

// ── Payroll Runs ──

export const getPayrollRuns = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${PAYROLL_ENDPOINT}/?${queryString}`);
};

export const getPayrollRunById = (id) => apiClient.get(`${PAYROLL_ENDPOINT}/${id}/`);
export const createPayrollRun = (data) => apiClient.post(`${PAYROLL_ENDPOINT}/`, data);
export const processPayrollRun = (id) => apiClient.post(`${PAYROLL_ENDPOINT}/${id}/process/`);
export const cancelPayrollRun = (id) => apiClient.post(`${PAYROLL_ENDPOINT}/${id}/cancel/`);
/** HR overview stats (departments, designations, staff with structures, salary expense) */
export const getHRDashboardStats = () => apiClient.get('/hr/dashboard_stats/');
/** Payroll runs summary stats (year, total_runs, completed, total_disbursed) */
export const getPayrollDashboardStats = () => apiClient.get(`${PAYROLL_ENDPOINT}/dashboard_stats/`);

// ── Payslips ──

export const getPayslips = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${PAYSLIP_ENDPOINT}/?${queryString}`);
};

export const getPayslipById = (id) => apiClient.get(`${PAYSLIP_ENDPOINT}/${id}/`);
export const approvePayslip = (id) => apiClient.post(`${PAYSLIP_ENDPOINT}/${id}/approve/`);
export const markPayslipPaid = (id, data) => apiClient.post(`${PAYSLIP_ENDPOINT}/${id}/mark_paid/`, data);
