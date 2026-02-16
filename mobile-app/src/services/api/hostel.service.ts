/**
 * Hostel Management API Service
 * Handles hostels, rooms, allocations, attendance, mess menus, complaints, and visitors.
 */

import apiClient from './client';
import { PaginatedResponse, QueryParams } from '@/types/api';

// ──────────────────────── Types ────────────────────────

export interface Hostel {
  id: string;
  name: string;
  hostel_type: 'BOYS' | 'GIRLS' | 'CO_ED';
  hostel_type_display?: string;
  total_floors: number;
  warden: string | null;
  warden_name?: string;
  address: string;
  contact_number: string;
  capacity: number;
  is_active: boolean;
  total_rooms?: number;
  occupied_rooms?: number;
  total_capacity?: number;
  total_occupied?: number;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  hostel: string;
  hostel_name?: string;
  room_number: string;
  floor: number;
  room_type: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'DORMITORY';
  room_type_display?: string;
  capacity: number;
  occupied_beds: number;
  available_beds?: number;
  status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE' | 'CLOSED';
  status_display?: string;
  monthly_fee: number;
  amenities: string;
  created_at: string;
}

export interface RoomAllocation {
  id: string;
  room: string;
  room_number?: string;
  student: string;
  student_name?: string;
  allocated_date: string;
  vacated_date: string | null;
  bed_number: string;
  is_active: boolean;
  created_at: string;
}

export interface HostelAttendance {
  id: string;
  student: string;
  student_name?: string;
  hostel: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE';
  status_display?: string;
  marked_by: string | null;
  remarks: string;
}

export interface MessMenu {
  id: string;
  hostel: string;
  day: number;
  day_display?: string;
  meal: 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER';
  meal_display?: string;
  items: string;
  start_time: string;
  end_time: string;
}

export interface HostelComplaint {
  id: string;
  student: string;
  student_name?: string;
  hostel: string;
  room: string | null;
  room_number?: string;
  category: string;
  category_display?: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  status_display?: string;
  resolution_notes: string;
  created_at: string;
}

export interface HostelVisitor {
  id: string;
  student: string;
  student_name?: string;
  hostel: string;
  visitor_name: string;
  relation: string;
  phone: string;
  check_in: string;
  check_out: string | null;
  purpose: string;
  id_proof_type: string;
  id_proof_number: string;
}

export interface HostelDashboardStats {
  total_hostels: number;
  total_rooms: number;
  total_capacity: number;
  total_occupied: number;
  occupancy_rate: number;
  open_complaints: number;
  todays_visitors: number;
}

export interface HostelAttendanceSummary {
  date: string;
  total_students: number;
  present: number;
  absent: number;
  on_leave: number;
}

export interface BulkAttendanceRecord {
  student: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE';
  remarks?: string;
}

// ──────────────────────── Service ────────────────────────

class HostelService {
  // ── Hostels ──

  async getHostels(params?: QueryParams): Promise<PaginatedResponse<Hostel>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<Hostel>>(`/hostel/hostels/${queryString}`);
  }

  async getHostel(id: string): Promise<Hostel> {
    return apiClient.get<Hostel>(`/hostel/hostels/${id}/`);
  }

  async createHostel(data: Partial<Hostel>): Promise<Hostel> {
    return apiClient.post<Hostel>('/hostel/hostels/', data);
  }

  async updateHostel(id: string, data: Partial<Hostel>): Promise<Hostel> {
    return apiClient.patch<Hostel>(`/hostel/hostels/${id}/`, data);
  }

  async getDashboardStats(): Promise<HostelDashboardStats> {
    return apiClient.get<HostelDashboardStats>('/hostel/hostels/dashboard_stats/');
  }

  // ── Rooms ──

  async getRooms(params?: QueryParams & { hostel?: string; status?: string; room_type?: string }): Promise<PaginatedResponse<Room>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<Room>>(`/hostel/rooms/${queryString}`);
  }

  async getRoom(id: string): Promise<Room> {
    return apiClient.get<Room>(`/hostel/rooms/${id}/`);
  }

  async createRoom(data: Partial<Room>): Promise<Room> {
    return apiClient.post<Room>('/hostel/rooms/', data);
  }

  async updateRoom(id: string, data: Partial<Room>): Promise<Room> {
    return apiClient.patch<Room>(`/hostel/rooms/${id}/`, data);
  }

  // ── Room Allocations ──

  async getAllocations(params?: QueryParams & { room?: string; student?: string; is_active?: boolean }): Promise<PaginatedResponse<RoomAllocation>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<RoomAllocation>>(`/hostel/allocations/${queryString}`);
  }

  async createAllocation(data: Partial<RoomAllocation>): Promise<RoomAllocation> {
    return apiClient.post<RoomAllocation>('/hostel/allocations/', data);
  }

  async vacateAllocation(id: string): Promise<RoomAllocation> {
    return apiClient.post<RoomAllocation>(`/hostel/allocations/${id}/vacate/`);
  }

  // ── Attendance ──

  async getAttendance(params?: QueryParams & { hostel?: string; date?: string; status?: string }): Promise<PaginatedResponse<HostelAttendance>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<HostelAttendance>>(`/hostel/attendance/${queryString}`);
  }

  async bulkMarkAttendance(hostelId: string, date: string, records: BulkAttendanceRecord[]): Promise<any> {
    return apiClient.post('/hostel/attendance/bulk_mark/', {
      hostel: hostelId,
      date,
      records,
    });
  }

  async getAttendanceSummary(hostelId: string, date: string): Promise<HostelAttendanceSummary> {
    return apiClient.get<HostelAttendanceSummary>(
      `/hostel/attendance/summary/?hostel=${hostelId}&date=${date}`
    );
  }

  // ── Mess Menu ──

  async getMessMenus(params?: QueryParams & { hostel?: string; day?: number; meal?: string }): Promise<PaginatedResponse<MessMenu>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<MessMenu>>(`/hostel/mess-menu/${queryString}`);
  }

  async createMessMenu(data: Partial<MessMenu>): Promise<MessMenu> {
    return apiClient.post<MessMenu>('/hostel/mess-menu/', data);
  }

  async updateMessMenu(id: string, data: Partial<MessMenu>): Promise<MessMenu> {
    return apiClient.patch<MessMenu>(`/hostel/mess-menu/${id}/`, data);
  }

  // ── Complaints ──

  async getComplaints(params?: QueryParams & { hostel?: string; status?: string; category?: string }): Promise<PaginatedResponse<HostelComplaint>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<HostelComplaint>>(`/hostel/complaints/${queryString}`);
  }

  async createComplaint(data: Partial<HostelComplaint>): Promise<HostelComplaint> {
    return apiClient.post<HostelComplaint>('/hostel/complaints/', data);
  }

  async resolveComplaint(id: string, resolutionNotes: string): Promise<HostelComplaint> {
    return apiClient.post<HostelComplaint>(`/hostel/complaints/${id}/resolve/`, {
      resolution_notes: resolutionNotes,
    });
  }

  // ── Visitors ──

  async getVisitors(params?: QueryParams & { hostel?: string; student?: string }): Promise<PaginatedResponse<HostelVisitor>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<HostelVisitor>>(`/hostel/visitors/${queryString}`);
  }

  async createVisitor(data: Partial<HostelVisitor>): Promise<HostelVisitor> {
    return apiClient.post<HostelVisitor>('/hostel/visitors/', data);
  }

  async checkoutVisitor(id: string): Promise<HostelVisitor> {
    return apiClient.post<HostelVisitor>(`/hostel/visitors/${id}/checkout/`);
  }
}

export const hostelService = new HostelService();
export default hostelService;
