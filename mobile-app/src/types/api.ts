// API Request/Response Types

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Auth API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_type: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
  new_password_confirm: string;
}

// Query Parameters
export interface QueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: any;
}

export interface AttendanceQueryParams extends QueryParams {
  student?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  academic_year?: string;
}

export interface ExamQueryParams extends QueryParams {
  academic_year?: string;
  exam_type?: string;
  status?: string;
  is_published?: boolean;
  student?: string;
}

export interface FeeQueryParams extends QueryParams {
  student?: string;
  academic_year?: string;
  status?: string;
  fee_category?: string;
}

export interface NoticeQueryParams extends QueryParams {
  target_audience?: string;
  priority?: string;
  is_published?: boolean;
}

export interface LibraryQueryParams extends QueryParams {
  category?: string;
  author?: string;
  status?: string;
}

// Dashboard Statistics Types
export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  attendance_today: number;
  pending_fees: number;
  upcoming_exams: number;
  recent_notices: number;
  active_routes: number;
}

export interface TeacherDashboardStats {
  my_classes: number;
  students_count: number;
  attendance_pending: number;
  upcoming_exams: number;
  leave_requests: number;
}

export interface StudentDashboardStats {
  attendance_percentage: number;
  pending_fees: number;
  upcoming_exams: number;
  issued_books: number;
  recent_marks?: {
    subject: string;
    marks: number;
    total: number;
    percentage: number;
  }[];
}

export interface ParentDashboardStats {
  children: {
    id: string;
    name: string;
    class: string;
    attendance_percentage: number;
    pending_fees: number;
  }[];
}

// Chart Data Types
export interface AttendanceChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

export interface FeeChartData {
  collected: number;
  pending: number;
  overdue: number;
}

export interface ExamPerformanceData {
  subject: string;
  marks: number;
  total: number;
  average: number;
}
