import React, { useEffect } from 'react';
import { StatusBar, LogBox, View, Text, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notification.service';
import { COLORS } from './src/constants';
import Card from './src/components/common/Card';
import './src/i18n';
import './global.css';

import { ThemeManager } from './src/components/common/ThemeManager';

// Global NativeWind Interop for 3rd party components
cssInterop(Icon, { className: 'style' });
// Custom components using className internally don't need interop if they pass it down to a View/Text
// But if they are being styled from parent, they might.
// However, our new Card components handle className prop manually.

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Require cycle:',
]);

const App: React.FC = () => {
  useEffect(() => {
    // Request notification permissions
    // Temporarily disabled for debugging
    // const initializeNotifications = async () => {
    //   const enabled = await notificationService.requestPermission();
    //   if (enabled) {
    //     const token = await notificationService.getToken();
    //     console.log('FCM Token:', token);

    //     // Setup notification listeners
    //     notificationService.setupListeners(
    //       (notification) => {
    //         // Handle foreground notification
    //         console.log('Foreground notification:', notification);
    //       },
    //       (notification) => {
    //         // Handle notification opened app
    //         console.log('Notification opened:', notification);
    //       }
    //     );
    //   }
    // };

    // initializeNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={<Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>Loading Persist...</Text>} persistor={persistor}>
            <PaperProvider>
              <ThemeManager>
                <AppNavigator />
              </ThemeManager>
            </PaperProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
