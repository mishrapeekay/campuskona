import apiClient from './client';
import { Notice, Event, Notification } from '@/types/models';
import { PaginatedResponse, NoticeQueryParams } from '@/types/api';

class CommunicationService {
  /**
   * Get notices
   */
  async getNotices(params?: NoticeQueryParams): Promise<PaginatedResponse<Notice>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<Notice>>(`/communication/notices/${queryString}`);
  }

  /**
   * Get notice by ID
   */
  async getNotice(id: string): Promise<Notice> {
    return apiClient.get<Notice>(`/communication/notices/${id}/`);
  }

  /**
   * Create notice
   */
  async createNotice(data: Partial<Notice>): Promise<Notice> {
    return apiClient.post<Notice>('/communication/notices/', data);
  }

  /**
   * Update notice
   */
  async updateNotice(id: string, data: Partial<Notice>): Promise<Notice> {
    return apiClient.patch<Notice>(`/communication/notices/${id}/`, data);
  }

  /**
   * Delete notice
   */
  async deleteNotice(id: string): Promise<void> {
    return apiClient.delete(`/communication/notices/${id}/`);
  }

  /**
   * Get events
   */
  async getEvents(params?: NoticeQueryParams): Promise<PaginatedResponse<Event>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<Event>>(`/communication/events/${queryString}`);
  }

  /**
   * Get event by ID
   */
  async getEvent(id: string): Promise<Event> {
    return apiClient.get<Event>(`/communication/events/${id}/`);
  }

  /**
   * Create event
   */
  async createEvent(data: Partial<Event>): Promise<Event> {
    return apiClient.post<Event>('/communication/events/', data);
  }

  /**
   * Update event
   */
  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    return apiClient.patch<Event>(`/communication/events/${id}/`, data);
  }

  /**
   * Delete event
   */
  async deleteEvent(id: string): Promise<void> {
    return apiClient.delete(`/communication/events/${id}/`);
  }

  /**
   * Get notifications for current user
   */
  async getNotifications(isRead?: boolean): Promise<PaginatedResponse<Notification>> {
    const queryString = isRead !== undefined ? `?is_read=${isRead}` : '';
    return apiClient.get<PaginatedResponse<Notification>>(`/communication/notifications/${queryString}`);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    return apiClient.patch<Notification>(`/communication/notifications/${notificationId}/`, {
      is_read: true,
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    return apiClient.post('/communication/notifications/mark-all-read/');
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<PaginatedResponse<Notification>>(
      '/communication/notifications/?is_read=false'
    );
    return response.count;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    return apiClient.delete(`/communication/notifications/${notificationId}/`);
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(days: number = 7): Promise<Event[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const response = await apiClient.get<PaginatedResponse<Event>>(
      `/communication/events/?start_date__gte=${today.toISOString().split('T')[0]}&start_date__lte=${futureDate.toISOString().split('T')[0]}`
    );

    return response.results;
  }

  /**
   * Get recent notices
   */
  async getRecentNotices(limit: number = 5): Promise<Notice[]> {
    const response = await apiClient.get<PaginatedResponse<Notice>>(
      `/communication/notices/?is_published=true&ordering=-created_at&page_size=${limit}`
    );
    return response.results;
  }
}

export const communicationService = new CommunicationService();
export default communicationService;
