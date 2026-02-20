/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register background message handler for FCM
import messaging from '@react-native-firebase/messaging';
import * as Sentry from '@sentry/react-native';
import { API_CONFIG } from './src/constants';

if (!__DEV__) {
    Sentry.init({
        dsn: API_CONFIG.SENTRY_DSN || 'https://examplePublicKey@o0.ingest.sentry.io/0', // Replace with actual DSN
        debug: false,
        tracesSampleRate: 0.2,
    });
}

messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
