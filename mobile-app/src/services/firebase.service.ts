/**
 * Firebase Cloud Messaging Service
 *
 * Handles push notifications, FCM token management, and notification handlers.
 * Integrates with Redux for state management and deep linking for navigation.
 */

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform, PermissionsAndroid } from 'react-native';
import { firebaseConfig, FCM_CONFIG } from '@/config/firebase.config';
import { store } from '@/store';
import { setFCMToken, addNotification } from '@/store/slices/notificationSlice';

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  category?: string;
  imageUrl?: string;
  actionButtons?: Array<{
    id: string;
    title: string;
    action: string;
  }>;
}

class FirebaseService {
  private initialized = false;

  /**
   * Initialize Firebase Cloud Messaging
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('Firebase already initialized');
      return;
    }

    try {
      // Request notification permissions
      await this.requestPermission();

      // Create notification channel (Android only)
      if (Platform.OS === 'android') {
        await this.createNotificationChannel();
      }

      // Get FCM token
      await this.getFCMToken();

      // Set up notification handlers
      this.setupNotificationHandlers();

      // Set up foreground notification handler
      this.setupForegroundHandler();

      // Set up background notification handler
      this.setupBackgroundHandler();

      this.initialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw error;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          // Android 13+ requires runtime permission
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true; // Android < 13 doesn't need runtime permission
      } else {
        // iOS
        const authStatus = await messaging().requestPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  /**
   * Create Android notification channel
   */
  async createNotificationChannel(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      await notifee.createChannel({
        id: FCM_CONFIG.channelId,
        name: FCM_CONFIG.channelName,
        description: FCM_CONFIG.channelDescription,
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        vibrationPattern: [300, 500],
      });

      console.log('Notification channel created');
    } catch (error) {
      console.error('Failed to create notification channel:', error);
    }
  }

  /**
   * Get FCM token and save to Redux
   */
  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      if (token) {
        console.log('FCM Token:', token);
        store.dispatch(setFCMToken(token));

        // Workstream K: Register FCM token with backend
        try {
          const { Platform } = require('react-native');
          const DeviceInfo = require('react-native-device-info');
          const deviceId = await DeviceInfo.getUniqueId();
          const { apiClient } = require('./api/client');
          await apiClient.post('/communication/fcm-token/', {
            token,
            device_type: Platform.OS,
            device_id: deviceId,
          });
          console.log('[FCM] Token registered with backend');
        } catch (regError) {
          console.warn('[FCM] Could not register token with backend:', regError);
        }

        return token;
      }
      return null;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Refresh FCM token (called when token changes)
   */
  async refreshToken(): Promise<void> {
    messaging().onTokenRefresh(async (token) => {
      console.log('FCM Token refreshed:', token);
      store.dispatch(setFCMToken(token));

      // Workstream K: Update token on backend when refreshed
      try {
        const { Platform } = require('react-native');
        const DeviceInfo = require('react-native-device-info');
        const deviceId = await DeviceInfo.getUniqueId();
        const { apiClient } = require('./api/client');
        await apiClient.post('/communication/fcm-token/', {
          token,
          device_type: Platform.OS,
          device_id: deviceId,
        });
      } catch (regError) {
        console.warn('[FCM] Could not update token on backend:', regError);
      }
    });
  }

  /**
   * Setup notification handlers (tap, dismiss, action buttons)
   */
  setupNotificationHandlers(): void {
    // Handle notification opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification opened app from quit state:', remoteMessage);
          this.handleNotificationOpen(remoteMessage);
        }
      });

    // Handle notification opened from background state
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app from background state:', remoteMessage);
      this.handleNotificationOpen(remoteMessage);
    });

    // Handle notifee events (action buttons, dismiss)
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('Notification pressed:', detail.notification);
        if (detail.notification?.data) {
          this.handleDeepLink(detail.notification.data);
        }
      }

      if (type === EventType.ACTION_PRESS) {
        console.log('Action pressed:', detail.pressAction);
        if (detail.notification?.data) {
          this.handleActionPress(detail.pressAction?.id || '', detail.notification.data);
        }
      }
    });

    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification?.data) {
        this.handleDeepLink(detail.notification.data);
      }

      if (type === EventType.ACTION_PRESS && detail.notification?.data) {
        this.handleActionPress(detail.pressAction?.id || '', detail.notification.data);
      }
    });
  }

  /**
   * Setup foreground notification handler
   */
  setupForegroundHandler(): void {
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground notification received:', remoteMessage);

      // Workstream M: Handle attendance_absent with high-priority channel
      if (remoteMessage.data?.type === 'attendance_absent') {
        await this.displayAbsenceAlert(remoteMessage);
      } else {
        await this.displayNotification(remoteMessage);
      }

      // Add to notification center in Redux
      this.addToNotificationCenter(remoteMessage);
    });
  }

  /**
   * Setup background notification handler
   */
  setupBackgroundHandler(): void {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background notification received:', remoteMessage);

      // Workstream M: Background absence alert still needs local display
      if (remoteMessage.data?.type === 'attendance_absent') {
        await this.displayAbsenceAlert(remoteMessage);
      }

      // Add to notification center in Redux
      this.addToNotificationCenter(remoteMessage);
    });
  }

  /**
   * Workstream M: Display high-priority absence alert notification
   * Called when FCM data contains type === 'attendance_absent'
   */
  async displayAbsenceAlert(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    try {
      const { data } = remoteMessage;
      const studentName = (data?.student_name as string) || 'Your child';
      const date = (data?.date as string) || new Date().toLocaleDateString();
      const schoolName = (data?.school_name as string) || 'School';

      // Ensure the absence channel exists (higher importance for urgent alerts)
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'attendance_alerts',
          name: 'Attendance Alerts',
          description: 'Urgent alerts when a student is marked absent',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          vibrationPattern: [0, 500, 250, 500],
          lights: true,
          lightColor: '#ef4444',
        });
      }

      await notifee.displayNotification({
        id: `absence_${data?.student_id || Date.now()}`,
        title: `\u26A0\uFE0F Absence Alert — ${studentName}`,
        body: `${studentName} was marked ABSENT on ${date} at ${schoolName}. Please contact the school if this is incorrect.`,
        data: {
          type: 'attendance_absent',
          screen: 'AttendanceDetail',
          student_id: data?.student_id || '',
          date: date,
        },
        android: {
          channelId: 'attendance_alerts',
          importance: AndroidImportance.HIGH,
          color: '#ef4444',
          pressAction: { id: 'default', launchActivity: 'default' },
          sound: 'default',
          vibrationPattern: [0, 500, 250, 500],
          actions: [
            {
              title: 'View Details',
              pressAction: { id: 'view', launchActivity: 'default' },
            },
          ],
        },
        ios: {
          sound: 'default',
          critical: true,
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      });

      console.log('[FCM] Absence alert displayed for:', studentName);
    } catch (error) {
      console.error('[FCM] Failed to display absence alert:', error);
      // Fall back to generic display
      await this.displayNotification(remoteMessage);
    }
  }

  /**
   * Display notification using notifee
   */
  async displayNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    try {
      const { notification, data } = remoteMessage;

      if (!notification?.title || !notification?.body) {
        console.warn('Notification missing title or body');
        return;
      }

      const notificationConfig: any = {
        id: data?.id || Date.now().toString(),
        title: notification.title,
        body: notification.body,
        data: data || {},
        android: {
          channelId: FCM_CONFIG.channelId,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          sound: 'default',
          vibrationPattern: [300, 500],
        },
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      };

      // Add image if available
      if (notification.android?.imageUrl || notification.ios?.imageUrl) {
        notificationConfig.android.largeIcon = notification.android?.imageUrl;
        notificationConfig.ios.attachments = [
          {
            url: notification.ios?.imageUrl || '',
          },
        ];
      }

      // Add action buttons if available
      if (data?.actions) {
        try {
          const actions = JSON.parse(data.actions as string);
          notificationConfig.android.actions = actions.map((action: any) => ({
            title: action.title,
            pressAction: {
              id: action.id,
            },
          }));
        } catch (e) {
          console.warn('Failed to parse notification actions:', e);
        }
      }

      await notifee.displayNotification(notificationConfig);
    } catch (error) {
      console.error('Failed to display notification:', error);
    }
  }

  /**
   * Add notification to Redux notification center
   */
  addToNotificationCenter(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    const { notification, data } = remoteMessage;

    if (!notification?.title || !notification?.body) return;

    const notificationPayload = {
      id: data?.id || Date.now().toString(),
      title: notification.title,
      body: notification.body,
      category: (data?.category as string) || FCM_CONFIG.categories.GENERAL,
      timestamp: new Date().toISOString(),
      read: false,
      data: data || {},
      imageUrl: notification.android?.imageUrl || notification.ios?.imageUrl,
    };

    store.dispatch(addNotification(notificationPayload));
  }

  /**
   * Handle notification open (navigate to appropriate screen)
   */
  handleNotificationOpen(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    const { data } = remoteMessage;

    if (data) {
      this.handleDeepLink(data);
    }
  }

  /**
   * Handle deep link navigation from notification data
   */
  handleDeepLink(data: Record<string, any>): void {
    console.log('Deep link navigation:', data);

    // Workstream M: attendance_absent tap navigates to attendance screen
    if (data?.type === 'attendance_absent') {
      console.log('[FCM] Navigate to attendance for student:', data.student_id, 'date:', data.date);
      // Navigation service integration: store.dispatch(setDeepLink({screen: 'Attendance', params: data}))
      // App reads this on mount and navigates accordingly
      store.dispatch({
        type: 'navigation/setPendingDeepLink',
        payload: { screen: 'Attendance', params: { student_id: data.student_id, date: data.date } },
      });
      return;
    }

    const { screen, params } = data;
    if (screen) {
      console.log(`Navigate to: ${screen}`, params);
    }
  }

  /**
   * Handle action button press
   */
  handleActionPress(actionId: string, data: Record<string, any>): void {
    console.log('Action pressed:', actionId, data);

    // Handle specific actions
    switch (actionId) {
      case 'mark_read':
        // Mark notification as read
        break;
      case 'view':
        this.handleDeepLink(data);
        break;
      case 'dismiss':
        // Dismiss notification
        break;
      default:
        console.warn('Unknown action:', actionId);
    }
  }

  /**
   * Get notification badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      if (Platform.OS === 'ios') {
        return await notifee.getBadgeCount();
      }
      return 0; // Android doesn't use badge count
    } catch (error) {
      console.error('Failed to get badge count:', error);
      return 0;
    }
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await notifee.setBadgeCount(count);
      }
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      console.log('All notifications cleared');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  /**
   * Cancel specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
      console.log(`Notification ${notificationId} cancelled`);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();

export default firebaseService;
