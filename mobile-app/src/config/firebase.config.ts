/**
 * Firebase Configuration
 *
 * ⚠️  OPTIONAL FOR LOCAL TESTING
 * The app will work without Firebase - push notifications just won't be available.
 *
 * To enable Firebase (optional):
 * 1. Create Firebase project at https://console.firebase.google.com
 * 2. Add Android app and download google-services.json to android/app/
 * 3. Add iOS app and download GoogleService-Info.plist to ios/
 * 4. Create .env file with your credentials:
 *    FIREBASE_API_KEY=your_key
 *    FIREBASE_PROJECT_ID=your_project
 *    FIREBASE_APP_ID=your_app_id
 */

import { Platform } from 'react-native';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

/**
 * Check if Firebase credentials are properly configured
 */
export const isFirebaseConfigured = () => {
  return !!(
    process.env.FIREBASE_API_KEY &&
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_APP_ID
  );
};

// Development Firebase Config (empty by default - Firebase is optional)
const firebaseConfigDev: FirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
};

// Production Firebase Config
const firebaseConfigProd: FirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
};

// Select config based on environment
const isDevelopment = __DEV__;
export const firebaseConfig = isDevelopment ? firebaseConfigDev : firebaseConfigProd;

// Log Firebase status on import (development only)
if (__DEV__) {
  if (isFirebaseConfigured()) {
    console.log('✅ Firebase is configured - push notifications enabled');
  } else {
    console.log('⚠️  Firebase not configured - push notifications disabled');
    console.log('   App will work normally without Firebase for local testing');
    console.log('   See src/config/firebase.config.ts for setup instructions');
  }
}

// FCM Configuration
export const FCM_CONFIG = {
  // Channel ID for Android notifications
  channelId: 'school_mgmt_notifications',
  channelName: 'School Notifications',
  channelDescription: 'Notifications from School Management System',

  // Notification categories
  categories: {
    ATTENDANCE: 'attendance',
    FEES: 'fees',
    EXAMS: 'exams',
    NOTICES: 'notices',
    TRANSPORT: 'transport',
    LIBRARY: 'library',
    GENERAL: 'general',
  },

  // Notification importance levels (Android)
  importance: {
    HIGH: 4, // Shows everywhere, makes noise and peeks
    DEFAULT: 3, // Shows everywhere, makes noise, but does not visually intrude
    LOW: 2, // Shows everywhere, but is not intrusive
    MIN: 1, // Shows in the shade, but not on the status bar
  },
};

// Deep linking configuration
export const DEEP_LINK_CONFIG = {
  scheme: 'schoolmgmt',
  prefixes: [
    'schoolmgmt://',
    'https://app.schoolmgmt.com',
    'https://*.schoolmgmt.com', // Multi-tenant subdomains
  ],
};

export default firebaseConfig;
