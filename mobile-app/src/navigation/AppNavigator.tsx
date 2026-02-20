/**
 * AppNavigator - Root Navigation Container
 *
 * Modern navigation architecture:
 * - Root Stack (Onboarding, Auth, Main)
 * - Drawer Navigation (side menu)
 * - Bottom Tab Navigation (role-based)
 * - Stack Navigators for each tab
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '@/store/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Navigation Types
import { RootStackParamList } from '@/types/navigation';

// Navigators
import AuthNavigator from './AuthNavigator';
import DrawerNavigator from './DrawerNavigator';
import { linking } from './linkingConfig';

// Screens
import TenantSelectionScreen from '@/screens/Auth/TenantSelectionScreen';
import OnboardingScreen from '@/screens/Onboarding/OnboardingScreen';

// Global Modal Screens
import NotificationCenterScreen from '@/screens/Profile/NotificationCenterScreen';

// Theme & Constants
import { COLORS, STORAGE_KEYS } from '@/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Custom Navigation Theme
const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.white,
    text: COLORS.textPrimary,
    border: COLORS.border,
    notification: COLORS.error,
  },
};

const AppNavigator: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { selectedTenant, isSuperAdminMode } = useAppSelector((state) => state.tenant);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  // Sync selectedTenant to AsyncStorage for ApiClient (standalone service)
  useEffect(() => {
    const syncTenant = async () => {
      if (selectedTenant) {
        await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_TENANT, JSON.stringify(selectedTenant));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_TENANT);
      }

      if (isSuperAdminMode) {
        await AsyncStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_MODE, 'true');
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.SUPER_ADMIN_MODE);
      }
    };
    syncTenant();
  }, [selectedTenant, isSuperAdminMode]);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('@app_has_launched');
      if (hasLaunched === null) {
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.log('Error checking first launch:', error);
      setIsFirstLaunch(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('@app_has_launched', 'true');
      setIsFirstLaunch(false);
    } catch (error) {
      console.log('Error saving onboarding state:', error);
      setIsFirstLaunch(false);
    }
  };

  // Show loading screen while checking first launch
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={NavigationTheme} linking={linking}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
        translucent={Platform.OS === 'android'}
      />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 200,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        {/* Step 1: Onboarding (First Launch Only) */}
        {isFirstLaunch && (
          <Stack.Screen
            name="Onboarding"
            options={{ animation: 'fade' }}
          >
            {(props) => (
              <OnboardingScreen
                {...props}
                onComplete={handleOnboardingComplete}
              />
            )}
          </Stack.Screen>
        )}

        {/* Step 2: Tenant Selection (skipped for Super Admin platform mode) */}
        {!selectedTenant && !isSuperAdminMode ? (
          <Stack.Screen
            name="TenantSelection"
            component={TenantSelectionScreen}
            options={{ animation: 'fade' }}
          />
        ) : !isAuthenticated ? (
          /* Step 3: Authentication (SuperAdminLogin route when in platform mode) */
          <Stack.Screen
            name="Auth"
            options={{ animation: 'fade' }}
          >
            {(props) => (
              <AuthNavigator
                {...props}
                initialRoute={isSuperAdminMode ? 'SuperAdminLogin' : 'Login'}
              />
            )}
          </Stack.Screen>
        ) : (
          /* Step 4: Main App (Drawer + Tabs) */
          <>
            <Stack.Screen
              name="MainDrawer"
              component={DrawerNavigator}
              options={{ animation: 'fade' }}
            />

            {/* Global Modal Screens - Accessible from anywhere */}
            <Stack.Group
              screenOptions={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: true,
                headerStyle: {
                  backgroundColor: COLORS.white,
                },
                headerTitleStyle: {
                  color: COLORS.gray900,
                  fontWeight: '600',
                },
                headerShadowVisible: false,
              }}
            >
              <Stack.Screen
                name="NotificationCenter"
                component={NotificationCenterScreen}
                options={{
                  headerTitle: 'Notifications',
                }}
              />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});

export default AppNavigator;
