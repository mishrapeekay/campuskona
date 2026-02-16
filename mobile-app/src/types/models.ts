// User Types
export enum UserType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  PRINCIPAL = 'PRINCIPAL',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  ACCOUNTANT = 'ACCOUNTANT',
  LIBRARIAN = 'LIBRARIAN',
  TRANSPORT_MANAGER = 'TRANSPORT_MANAGER',
  PARTNER = 'PARTNER',
  INVESTOR = 'INVESTOR',
}

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
}

export interface User {
  id: string;
  email: string;
  phone: string;
  alternate_phone?: string;
  user_type: UserType;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: Gender;
  avatar?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  student_id?: string;
  staff_id?: string;
  permissions?: string[];
  roles?: Role[];
}

export interface Role {
  id: string;
  name: string;
  code: string;
  permissions: Permission[];
  is_active: boolean;
}

export interface Permission {
  id: string;
  module: string;
  action: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
}

// Authentication Types
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User & {
    permissions: string[];
    roles: Role[];
  };
}

// Tenant Types
export interface School {
  id: string;
  school_name: string;
  school_code: string;
  subdomain: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  logo?: string;
  website?: string;
  is_active: boolean;
  created_at: string;
}

export interface TenantConfig {
  id: string;
  school: string;
  enable_online_payments: boolean;
  enable_sms_notifications: boolean;
  enable_email_notifications: boolean;
  enable_biometric_attendance: boolean;
  enable_mobile_app: boolean;
  enable_parent_portal: boolean;
  enable_library: boolean;
  enable_transport: boolean;
  academic_year_start_month: number;
  working_days: string[];
  attendance_marking_time?: string;
  late_arrival_time?: string;
  custom_settings: Record<string, any>;
}

// Student Types
export enum AdmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TRANSFERRED = 'TRANSFERRED',
  PASSED_OUT = 'PASSED_OUT',
}

export enum StudentCategory {
  GENERAL = 'GENERAL',
  OBC = 'OBC',
  SC = 'SC',
  ST = 'ST',
  EWS = 'EWS',
}

export interface Student {
  id: string;
  user: User;
  admission_number: string;
  admission_date: string;
  admission_status: AdmissionStatus;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: Gender;
  blood_group?: string;
  phone_number?: string;
  emergency_contact_number: string;
  email?: string;
  current_class?: string | any;
  current_section?: string | any;
  current_address: string;
  current_city: string;
  current_state: string;
  current_pincode: string;
  permanent_address?: string;
  permanent_city?: string;
  permanent_state?: string;
  permanent_pincode?: string;
  father_name?: string;
  father_occupation?: string;
  father_phone?: string;
  father_email?: string;
  father_annual_income?: number;
  mother_name?: string;
  mother_occupation?: string;
  mother_phone?: string;
  mother_email?: string;
  mother_annual_income?: number;
  guardian_name?: string;
  guardian_relation?: string;
  guardian_phone?: string;
  guardian_email?: string;
  aadhar_number?: string;
  category: StudentCategory;
  religion?: string;
  is_differently_abled: boolean;
  disability_details?: string;
  medical_conditions?: string;
  allergies?: string;
  photo?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export enum DocumentType {
  BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE',
  TRANSFER_CERTIFICATE = 'TRANSFER_CERTIFICATE',
  MARKSHEET = 'MARKSHEET',
  AADHAR_CARD = 'AADHAR_CARD',
  PASSPORT = 'PASSPORT',
  CASTE_CERTIFICATE = 'CASTE_CERTIFICATE',
  INCOME_CERTIFICATE = 'INCOME_CERTIFICATE',
  DISABILITY_CERTIFICATE = 'DISABILITY_CERTIFICATE',
  PHOTO = 'PHOTO',
  OTHER = 'OTHER',
}

export interface StudentDocument {
  id: string;
  student: string;
  document_type: DocumentType;
  document_file: string;
  issue_date?: string;
  expiry_date?: string;
  issued_by?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  remarks?: string;
  created_at: string;
}

export interface StudentParent {
  id: string;
  student: string;
  parent: User;
  relation: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
  is_primary_contact: boolean;
  is_emergency_contact: boolean;
  can_pickup: boolean;
  created_at: string;
}

export interface StudentHealthRecord {
  id: string;
  student: string;
  height?: number;
  weight?: number;
  vaccination_records?: Record<string, any>;
  allergies?: string;
  chronic_conditions?: string;
  medications?: string;
  family_doctor_name?: string;
  family_doctor_phone?: string;
  vision_status?: string;
  dental_status?: string;
  checkup_date?: string;
  next_checkup_date?: string;
  conducted_by?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

// Staff Types
export enum EmploymentType {
  PERMANENT = 'PERMANENT',
  CONTRACT = 'CONTRACT',
  TEMPORARY = 'TEMPORARY',
  VISITING = 'VISITING',
  PART_TIME = 'PART_TIME',
}

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  RESIGNED = 'RESIGNED',
  RETIRED = 'RETIRED',
}

export enum Designation {
  PRINCIPAL = 'PRINCIPAL',
  VICE_PRINCIPAL = 'VICE_PRINCIPAL',
  HEAD_TEACHER = 'HEAD_TEACHER',
  SENIOR_TEACHER = 'SENIOR_TEACHER',
  TEACHER = 'TEACHER',
  PRT = 'PRT',
  TGT = 'TGT',
  PGT = 'PGT',
  LIBRARIAN = 'LIBRARIAN',
  COUNSELOR = 'COUNSELOR',
  ACCOUNTANT = 'ACCOUNTANT',
  CLERK = 'CLERK',
  PEON = 'PEON',
  SECURITY = 'SECURITY',
  OTHER = 'OTHER',
}

export interface StaffMember {
  id: string;
  user: User;
  employee_id: string;
  employment_type: EmploymentType;
  employment_status: EmploymentStatus;
  designation: Designation;
  date_of_birth: string;
  gender: Gender;
  marital_status?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  blood_group?: string;
  phone: string;
  alternate_phone?: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  aadhar_number?: string;
  pan_number?: string;
  department?: string;
  date_of_joining: string;
  date_of_retirement?: string;
  qualification?: string;
  specialization?: string;
  salary_grade?: string;
  basic_salary?: number;
  bank_account?: string;
  ifsc_code?: string;
  is_active: boolean;
  join_date?: string;
  resignation_date?: string;
  created_at: string;
  updated_at: string;
}

// Academic Types
export enum BoardType {
  CBSE = 'CBSE',
  ICSE = 'ICSE',
  MPBSE = 'MPBSE',
  STATE = 'STATE',
  IB = 'IB',
  CAMBRIDGE = 'CAMBRIDGE',
}

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export interface Board {
  id: string;
  board_type: BoardType;
  board_name: string;
  board_code: string;
  grading_system?: Record<string, any>;
  minimum_passing_percentage: number;
  is_active: boolean;
  created_at: string;
}

export interface Class {
  id: string;
  name: string;
  class_level: number;
  academic_year: string;
  board: string;
  section: string;
  medium: 'ENGLISH' | 'HINDI' | 'BILINGUAL' | 'OTHER';
  capacity: number;
  class_teacher?: string;
  is_active: boolean;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  board: string;
  academic_year: string;
  theory_marks: number;
  practical_marks: number;
  total_marks: number;
  is_core: boolean;
  is_elective: boolean;
  is_active: boolean;
  created_at: string;
}

export interface StudentEnrollment {
  id: string;
  student: string;
  class_id: string;
  section: string;
  academic_year: string;
  enrollment_date: string;
  is_active: boolean;
  created_at: string;
}

// Attendance Types
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  LEAVE = 'LEAVE',
  HOLIDAY = 'HOLIDAY',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface StudentAttendance {
  id: string;
  student: string;
  academic_year: string;
  date: string;
  status: AttendanceStatus;
  period?: string;
  check_in_time?: string;
  check_out_time?: string;
  biometric_verified: boolean;
  remarks?: string;
  marked_by?: string;
  created_at: string;
}

export interface StudentLeave {
  id: string;
  student: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface AttendanceSummary {
  id: string;
  student: string;
  academic_year: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  half_days: number;
  leave_days: number;
  attendance_percentage: number;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  is_optional: boolean;
  created_at: string;
}

export interface StaffAttendance {
  id: string;
  staff: string;
  date: string;
  status: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  remarks?: string;
  created_at: string;
}

export interface StaffLeave {
  id: string;
  staff: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  rejection_reason?: string;
  created_at: string;
}

export interface AttendancePeriod {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

// Examination Types
export enum ExamType {
  FORMATIVE = 'FORMATIVE',
  SUMMATIVE = 'SUMMATIVE',
  DIAGNOSTIC = 'DIAGNOSTIC',
  BENCHMARK = 'BENCHMARK',
}

export interface Exam {
  id: string;
  name: string;
  exam_type: string;
  exam_type_name?: string;
  academic_year: string;
  academic_year_name?: string;
  grade_scale?: string;
  grade_scale_name?: string;
  start_date: string;
  end_date: string;
  result_date?: string;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  status_display?: string;
  description?: string;
  instructions?: string;
  is_published?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ExamSchedule {
  id: string;
  examination: string;
  examination_name?: string;
  class_obj: string;
  class_name?: string;
  section: string;
  section_name?: string;
  subject: string;
  subject_name?: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  max_marks: number;
  min_passing_marks: number;
  room_number?: string;
  instructions?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentMarks {
  id: string;
  student: string;
  exam: string;
  subject: string;
  obtained_marks: number;
  out_of_marks: number;
  is_absent: boolean;
  is_grace_marked: boolean;
  remarks?: string;
  created_at: string;
}

export interface Result {
  id: string;
  student: string;
  academic_year: string;
  total_obtained_marks: number;
  total_out_of_marks: number;
  percentage: number;
  grade: string;
  is_promoted: boolean;
  created_at: string;
}

export interface Grade {
  id: string;
  grade_scale: string;
  grade: string;
  min_percentage: number;
  max_percentage: number;
  grade_point: number;
  description?: string;
  order: number;
}

export interface GradeScale {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

// Finance Types
export enum FeeFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  ANNUAL = 'ANNUAL',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  ONLINE = 'ONLINE',
  UPI = 'UPI',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export interface FeeCategory {
  id: string;
  name: string;
  code: string;
  is_mandatory: boolean;
  is_active: boolean;
  created_at: string;
}

export interface FeeStructure {
  id: string;
  academic_year: string;
  class_id: string;
  fee_category: string;
  amount: number;
  frequency: FeeFrequency;
  due_day: number;
  is_active: boolean;
  created_at: string;
}

export interface StudentFee {
  id: string;
  student: string;
  academic_year: string;
  fee_category: string;
  amount: number;
  frequency: FeeFrequency;
  due_date: string;
  status: PaymentStatus;
  balance_amount: number;
  created_at: string;
}

export interface Payment {
  id: string;
  student: string;
  student_name?: string;
  receipt_number: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  payment_method_display?: string;
  transaction_id?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  status_display?: string;
  remarks?: string;
  received_by?: string;
  received_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  student: string;
  academic_year: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  due_date: string;
  issued_date: string;
  created_at: string;
}

// Communication Types
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TargetAudience {
  ALL = 'ALL',
  STUDENTS = 'STUDENTS',
  TEACHERS = 'TEACHERS',
  PARENTS = 'PARENTS',
  CLASS = 'CLASS',
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  attachment?: string;
  target_audience: TargetAudience;
  specific_classes?: string[];
  priority: Priority;
  posted_by: string;
  is_published: boolean;
  display_until?: string;
  created_at: string;
  updated_at: string;
}

export enum EventType {
  ACADEMIC = 'ACADEMIC',
  HOLIDAY = 'HOLIDAY',
  EXAM = 'EXAM',
  MEETING = 'MEETING',
  SPORTS = 'SPORTS',
  CULTURAL = 'CULTURAL',
  OTHER = 'OTHER',
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: EventType;
  start_date: string;
  end_date: string;
  organizer?: string;
  location?: string;
  participants?: string[];
  is_public: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  recipient: string;
  title: string;
  message: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

// Library Types
export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  ISSUED = 'ISSUED',
  RESERVED = 'RESERVED',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED',
}

export enum IssueStatus {
  ISSUED = 'ISSUED',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
  LOST = 'LOST',
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  isbn: string;
  author: string;
  category: string;
  publication_year?: number;
  publisher?: string;
  quantity: number;
  available_copies: number;
  location?: string;
  description?: string;
  cover_image?: string;
  created_at: string;
}

export interface BookIssue {
  id: string;
  book: string;
  student?: string;
  staff?: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: IssueStatus;
  fine_amount: number;
  remarks?: string;
  created_at: string;
}

// Transport Types
export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

export interface Vehicle {
  id: string;
  registration_number: string;
  model: string;
  capacity: number;
  status: VehicleStatus;
  insurance_expiry?: string;
  last_service_date?: string;
  next_service_date?: string;
  created_at: string;
}

export interface Driver {
  id: string;
  staff: string;
  license_number: string;
  license_expiry: string;
  phone_number: string;
  created_at: string;
}

export interface Route {
  id: string;
  name: string;
  start_point: string;
  end_point: string;
  fare: number;
  vehicle?: string;
  driver?: string;
  is_active: boolean;
  created_at: string;
}

export interface Stop {
  id: string;
  route: string;
  name: string;
  sequence_order: number;
  arrival_time?: string;
  pickup_fare?: number;
  created_at: string;
}

export interface TransportAllocation {
  id: string;
  student: string;
  route: string;
  stop: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

// Timetable Types
export enum SlotType {
  PERIOD = 'PERIOD',
  BREAK = 'BREAK',
  LUNCH = 'LUNCH',
  ASSEMBLY = 'ASSEMBLY',
}

export interface TimeSlot {
  id: string;
  name: string;
  slot_type: SlotType;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  order: number;
  is_active: boolean;
}

export interface TimetableSlot {
  id: string;
  class_id: string;
  day_of_week: number;
  time_slot: string;
  subject?: string;
  teacher?: string;
  room_number?: string;
}

