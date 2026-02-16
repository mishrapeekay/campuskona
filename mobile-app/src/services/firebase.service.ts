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

        // TODO: Send token to backend for storage
        // await notificationService.registerFCMToken(token);

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

      // TODO: Update token on backend
      // await notificationService.updateFCMToken(token);
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

      // Display notification using notifee
      await this.displayNotification(remoteMessage);

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

      // Add to notification center in Redux
      this.addToNotificationCenter(remoteMessage);
    });
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
    // Deep link navigation will be handled by navigation service
    // This is a placeholder - actual implementation in Phase 2
    console.log('Deep link navigation:', data);

    const { screen, params } = data;

    if (screen) {
      // TODO: Integrate with navigation service
      // navigationService.navigate(screen, JSON.parse(params || '{}'));
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
