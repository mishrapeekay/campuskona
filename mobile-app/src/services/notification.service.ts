import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class NotificationService {
  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }

      return enabled;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      await AsyncStorage.setItem('fcm_token', token);
      console.log('FCM Token:', token);
      return token;
    } catch (error: any) {
      // Ignore specific error related to missing valid google-services.json
      if (error.message && error.message.includes('[messaging/unknown]')) {
        console.log('FCM Token generation failed (Expected in Mock Mode). Notifications will be disabled.');
      } else {
        console.error('Error getting FCM token:', error);
      }
      return null;
    }
  }

  /**
   * Setup notification listeners
   */
  setupListeners(
    onNotificationReceived: (notification: any) => void,
    onNotificationOpened: (notification: any) => void
  ): void {
    // Foreground message handler
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground notification received:', remoteMessage);
      onNotificationReceived(remoteMessage);
    });

    // Background/Quit state message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message received:', remoteMessage);
    });

    // Notification opened app from background/quit state
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app from background:', remoteMessage);
      onNotificationOpened(remoteMessage);
    });

    // Check if app was opened from a notification (quit state)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification opened app from quit state:', remoteMessage);
          onNotificationOpened(remoteMessage);
        }
      });

    // Token refresh listener
    messaging().onTokenRefresh(async (token) => {
      console.log('FCM Token refreshed:', token);
      await AsyncStorage.setItem('fcm_token', token);
    });
  }

  /**
   * Subscribe to topic
   */
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
    }
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
    }
  }

  /**
   * Get notification badge count
   */
  async getBadgeCount(): Promise<number> {
    if (Platform.OS === 'ios') {
      return messaging().getAPNSToken().then(() => 0);
    }
    return 0;
  }

  /**
   * Set notification badge count (iOS only)
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        messaging().setAPNSToken;
      } catch (error) {
        console.error('Error setting badge count:', error);
      }
    }
  }

  /**
   * Delete FCM token
   */
  async deleteToken(): Promise<void> {
    try {
      await messaging().deleteToken();
      await AsyncStorage.removeItem('fcm_token');
      console.log('FCM token deleted');
    } catch (error) {
      console.error('Error deleting FCM token:', error);
    }
  }

  /**
   * Get user notification preferences from storage
   */
  async getNotificationPreferences(): Promise<any> {
    try {
      const prefs = await AsyncStorage.getItem('notification_preferences');
      if (prefs) {
        return JSON.parse(prefs);
      }
      // Return default preferences
      return {
        attendance: true,
        fees: true,
        exams: true,
        notices: true,
        transport: true,
        library: true,
        general: true,
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        attendance: true,
        fees: true,
        exams: true,
        notices: true,
        transport: true,
        library: true,
        general: true,
      };
    }
  }

  /**
   * Update user notification preferences in storage
   */
  async updateNotificationPreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_preferences', JSON.stringify(preferences));
      console.log('Notification preferences updated successfully');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
