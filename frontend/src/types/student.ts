/**
 * Student Type Definitions
 * Includes Samagra ID fields for DPDP Act 2023 compliance
 */

export interface Student {
  id: number;
  user: number;
  admission_number: string;
  admission_date: string;
  admission_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'PASSED_OUT';

  // Personal Details
  first_name: string;
  middle_name?: string;
  last_name?: string;
  full_name?: string; // Computed field
  date_of_birth: string;
  age?: number; // Computed field
  gender: 'M' | 'F' | 'O';
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  photo?: string;

  // Contact Information
  phone_number?: string;
  emergency_contact_number: string;
  email?: string;

  // Address
  current_address_line1: string;
  current_address_line2?: string;
  current_city: string;
  current_state: string;
  current_pincode: string;

  permanent_address_line1: string;
  permanent_address_line2?: string;
  permanent_city: string;
  permanent_state: string;
  permanent_pincode: string;

  // Family Background
  father_name: string;
  father_occupation?: string;
  father_phone: string;
  father_email?: string;
  father_annual_income?: number; // Encrypted in backend

  mother_name: string;
  mother_occupation?: string;
  mother_phone?: string;
  mother_email?: string;
  mother_annual_income?: number; // Encrypted in backend

  guardian_name?: string;
  guardian_relation?: string;
  guardian_phone?: string;
  guardian_email?: string;

  // Government IDs (Encrypted in backend)
  aadhar_number?: string; // NOTE: Backend returns encrypted, use masked version
  aadhar_number_masked?: string; // For display (XXXXXXXX9012)

  // Samagra ID (Madhya Pradesh only) - Encrypted in backend
  samagra_family_id?: string; // 8 digits, encrypted
  samagra_family_id_masked?: string; // For display (XXXX5678)

  samagra_member_id?: string; // 9 digits, encrypted
  samagra_member_id_masked?: string; // For display (XXXXX6789)

  samagra_id_verified?: boolean;
  samagra_id_verification_date?: string;

  // Academic Information
  previous_school_name?: string;
  previous_school_board?: string;
  previous_class?: string;
  transfer_certificate_number?: string;

  // Category & Religion
  category: 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS';
  religion: 'HINDU' | 'MUSLIM' | 'CHRISTIAN' | 'SIKH' | 'BUDDHIST' | 'JAIN' | 'OTHER';

  // Special Needs
  is_differently_abled?: boolean;
  disability_details?: string;

  // Medical Information
  medical_conditions?: string;

  // Remarks
  remarks?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: number;

  // Current Enrollment (computed)
  current_class?: {
    id: string;
    class_name: string;
    academic_year: string;
  };
}

export interface StudentFormData extends Omit<Student, 'id' | 'admission_number' | 'created_at' | 'updated_at' | 'full_name' | 'age' | 'current_class' | 'aadhar_number_masked' | 'samagra_family_id_masked' | 'samagra_member_id_masked'> {
  email: string; // Required for creating user account
  password?: string;
}

export interface StudentListItem {
  id: number;
  admission_number: string;
  full_name: string;
  first_name: string;
  last_name?: string;
  date_of_birth: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  photo?: string;
  admission_status: string;
  current_class?: string;
  section_name?: string;
  roll_number?: string;
  phone_number?: string;
  email?: string;

  // Masked sensitive fields for list view
  aadhar_number_masked?: string;
  samagra_member_id_masked?: string;
}

export interface StudentDocument {
  id: number;
  student: number;
  document_type: string;
  file: string;
  file_name: string;
  file_size: number;
  uploaded_by: number;
  uploaded_at: string;
  description?: string;
}

export interface StudentParent {
  id: number;
  student: number;
  parent_user: number;
  parent_name: string;
  relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN';
  is_primary: boolean;
  phone: string;
  email?: string;
  occupation?: string;
  annual_income?: number;
  created_at: string;
}

export interface StudentHealthRecord {
  id: number;
  student: number;
  checkup_date: string;
  height?: number; // in cm
  weight?: number; // in kg
  blood_pressure?: string;
  temperature?: number;
  notes?: string;
  doctor_name?: string;
  next_checkup_date?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface StudentNote {
  id: number;
  student: number;
  note_type: 'ACADEMIC' | 'BEHAVIORAL' | 'HEALTH' | 'GENERAL';
  title: string;
  content: string;
  created_by: number;
  created_by_name?: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentStatistics {
  total_students: number;
  active_students: number;
  inactive_students: number;
  pending_admissions: number;
  by_gender: {
    male: number;
    female: number;
    other: number;
  };
  by_category: {
    general: number;
    obc: number;
    sc: number;
    st: number;
    ews: number;
  };
  by_class: Array<{
    class_name: string;
    student_count: number;
  }>;
}

export interface SamagraIDFormData {
  samagra_family_id?: string; // 8 digits
  samagra_member_id?: string; // 9 digits
}

export interface SamagraIDVerificationData {
  samagra_id_verified: boolean;
  samagra_id_verification_date?: string;
  verification_notes?: string;
}
