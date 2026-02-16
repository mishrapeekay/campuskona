/**
 * API Module Exports
 *
 * Centralized export of all API modules
 */

export { default as apiClient, uploadFile, downloadFile, buildQueryString } from './client';
export { authAPI } from './auth';

// Core modules
export * as studentsAPI from './students';
export * as staffAPI from './staff';
export * as academicsAPI from './academics';
export * as attendanceAPI from './attendance';
export * as examinationsAPI from './examinations';
export * as financeAPI from './finance';
export * as timetableAPI from './timetable';
export * as communicationAPI from './communication';
export * as libraryAPI from './library';
export * as transportAPI from './transport';

// New modules
export * as admissionsAPI from './admissions';
export * as hostelAPI from './hostel';
export * as hrPayrollAPI from './hrPayroll';
export * as reportsAPI from './reports';

// AI Timetable Generator
export * as timetableGeneratorAPI from './timetableGenerator';

// Feature Flags
export * as featuresAPI from './features';

// Parent Portal
export * as parentPortalAPI from './parentPortal';

// Analytics
export * as analyticsAPI from './analytics';
