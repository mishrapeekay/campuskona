# School Management System - Mobile App Implementation Guide

## Project Overview

This document provides a comprehensive guide for implementing the School Management System mobile application using React Native and TypeScript.

## Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Redux Store Configuration](#redux-store-configuration)
3. [Navigation Structure](#navigation-structure)
4. [UI Components Library](#ui-components-library)
5. [Dashboard Implementations](#dashboard-implementations)
6. [Offline Support](#offline-support)
7. [Push Notifications](#push-notifications)
8. [Deployment Guide](#deployment-guide)

---

## 1. Setup Instructions

### Prerequisites

- Node.js >= 18.x
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- CocoaPods (for iOS dependencies)

### Initial Setup

```bash
# Navigate to mobile-app directory
cd "G:\School Mgmt System\mobile-app"

# Install dependencies
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
API_BASE_URL=http://10.0.2.2:8000/api/v1  # For Android Emulator
# API_BASE_URL=http://localhost:8000/api/v1  # For iOS Simulator
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_APP_ID=your_firebase_app_id
```

---

## 2. Redux Store Configuration

### Directory Structure

```
src/store/
├── index.ts                 # Store configuration
├── slices/
│   ├── authSlice.ts        # Authentication state
│   ├── userSlice.ts        # User data
│   ├── tenantSlice.ts      # Tenant selection
│   ├── studentSlice.ts     # Student data
│   ├── attendanceSlice.ts  # Attendance data
│   ├── examSlice.ts        # Exam data
│   ├── feeSlice.ts         # Fee data
│   ├── librarySlice.ts     # Library data
│   ├── transportSlice.ts   # Transport data
│   └── notificationSlice.ts # Notifications
└── hooks.ts                 # Typed hooks
```

### Store Configuration (src/store/index.ts)

```typescript
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import tenantReducer from './slices/tenantSlice';
import studentReducer from './slices/studentSlice';
import attendanceReducer from './slices/attendanceSlice';
import examReducer from './slices/examSlice';
import feeReducer from './slices/feeSlice';
import libraryReducer from './slices/librarySlice';
import transportReducer from './slices/transportSlice';
import notificationReducer from './slices/notificationSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'tenant'], // Only persist these reducers
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  tenant: tenantReducer,
  student: studentReducer,
  attendance: attendanceReducer,
  exam: examReducer,
  fee: feeReducer,
  library: libraryReducer,
  transport: transportReducer,
  notification: notificationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Auth Slice (src/store/slices/authSlice.ts)

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/api';
import { LoginRequest, LoginResponse, User } from '@/types/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async () => {
  return await authService.getCurrentUser();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTokens: (state, action: PayloadAction<{ access: string; refresh: string }>) => {
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        return initialState;
      })
      // Get Current User
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, setTokens } = authSlice.actions;
export default authSlice.reducer;
```

### Typed Hooks (src/store/hooks.ts)

```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## 3. Navigation Structure

### App Navigator (src/navigation/AppNavigator.tsx)

```typescript
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '@/store/hooks';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import TenantSelectionScreen from '@/screens/Auth/TenantSelectionScreen';

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { selectedTenant } = useAppSelector((state) => state.tenant);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : !selectedTenant ? (
          <Stack.Screen name="TenantSelection" component={TenantSelectionScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

### Main Navigator (src/navigation/MainNavigator.tsx)

```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '@/store/hooks';
import { UserType } from '@/types/models';
import { COLORS, ICONS } from '@/constants';

// Import Dashboard Screens
import AdminDashboard from '@/screens/Dashboard/AdminDashboard';
import TeacherDashboard from '@/screens/Dashboard/TeacherDashboard';
import StudentDashboard from '@/screens/Dashboard/StudentDashboard';
import ParentDashboard from '@/screens/Dashboard/ParentDashboard';

// Import other screens
import AttendanceScreen from '@/screens/Attendance/AttendanceScreen';
import ExamScreen from '@/screens/Exam/ExamScreen';
import FeeScreen from '@/screens/Fee/FeeScreen';
import LibraryScreen from '@/screens/Library/LibraryScreen';
import TransportScreen from '@/screens/Transport/TransportScreen';
import ProfileScreen from '@/screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const MainNavigator: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const getDashboardComponent = () => {
    switch (user?.user_type) {
      case UserType.SCHOOL_ADMIN:
      case UserType.PRINCIPAL:
        return AdminDashboard;
      case UserType.TEACHER:
        return TeacherDashboard;
      case UserType.STUDENT:
        return StudentDashboard;
      case UserType.PARENT:
        return ParentDashboard;
      default:
        return AdminDashboard;
    }
  };

  const getTabsForUserType = () => {
    const commonTabs = [
      {
        name: 'Dashboard',
        component: getDashboardComponent(),
        icon: ICONS.dashboard,
        label: 'Dashboard',
      },
    ];

    switch (user?.user_type) {
      case UserType.SCHOOL_ADMIN:
      case UserType.PRINCIPAL:
        return [
          ...commonTabs,
          { name: 'Attendance', component: AttendanceScreen, icon: ICONS.attendance, label: 'Attendance' },
          { name: 'Exams', component: ExamScreen, icon: ICONS.exams, label: 'Exams' },
          { name: 'Fees', component: FeeScreen, icon: ICONS.fees, label: 'Fees' },
          { name: 'Profile', component: ProfileScreen, icon: ICONS.profile, label: 'Profile' },
        ];

      case UserType.TEACHER:
        return [
          ...commonTabs,
          { name: 'Attendance', component: AttendanceScreen, icon: ICONS.attendance, label: 'Attendance' },
          { name: 'Exams', component: ExamScreen, icon: ICONS.exams, label: 'Exams' },
          { name: 'Profile', component: ProfileScreen, icon: ICONS.profile, label: 'Profile' },
        ];

      case UserType.STUDENT:
        return [
          ...commonTabs,
          { name: 'Exams', component: ExamScreen, icon: ICONS.exams, label: 'My Exams' },
          { name: 'Fees', component: FeeScreen, icon: ICONS.fees, label: 'My Fees' },
          { name: 'Library', component: LibraryScreen, icon: ICONS.library, label: 'Library' },
          { name: 'Profile', component: ProfileScreen, icon: ICONS.profile, label: 'Profile' },
        ];

      case UserType.PARENT:
        return [
          ...commonTabs,
          { name: 'Fees', component: FeeScreen, icon: ICONS.fees, label: 'Fees' },
          { name: 'Profile', component: ProfileScreen, icon: ICONS.profile, label: 'Profile' },
        ];

      case UserType.LIBRARIAN:
        return [
          ...commonTabs,
          { name: 'Library', component: LibraryScreen, icon: ICONS.library, label: 'Library' },
          { name: 'Profile', component: ProfileScreen, icon: ICONS.profile, label: 'Profile' },
        ];

      case UserType.TRANSPORT_MANAGER:
        return [
          ...commonTabs,
          { name: 'Transport', component: TransportScreen, icon: ICONS.transport, label: 'Transport' },
          { name: 'Profile', component: ProfileScreen, icon: ICONS.profile, label: 'Profile' },
        ];

      default:
        return [...commonTabs, { name: 'Profile', component: ProfileScreen, icon: ICONS.profile, label: 'Profile' }];
    }
  };

  const tabs = getTabsForUserType();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        headerShown: false,
      }}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ color, size }) => <Icon name={tab.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default MainNavigator;
```

---

## 4. UI Components Library

### Common Components Structure

```
src/components/
├── common/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── DatePicker.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Chip.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   └── ErrorBoundary.tsx
├── layout/
│   ├── Container.tsx
│   ├── Header.tsx
│   ├── ScreenWrapper.tsx
│   └── KeyboardAvoidingView.tsx
├── charts/
│   ├── BarChart.tsx
│   ├── LineChart.tsx
│   ├── PieChart.tsx
│   └── AttendanceChart.tsx
└── features/
    ├── AttendanceMarker.tsx
    ├── FeePaymentCard.tsx
    ├── ExamCard.tsx
    ├── NoticeCard.tsx
    ├── StudentCard.tsx
    └── TransportCard.tsx
```

### Button Component (src/components/common/Button.tsx)

```typescript
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
      opacity: disabled ? 0.5 : 1,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
      medium: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
      large: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: { backgroundColor: COLORS.primary },
      secondary: { backgroundColor: COLORS.secondary },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
      },
      text: { backgroundColor: 'transparent' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontFamily: FONTS.medium,
      fontSize: size === 'small' ? FONTS.sm : size === 'large' ? FONTS.lg : FONTS.base,
    };

    const variantTextStyles: Record<string, TextStyle> = {
      primary: { color: COLORS.white },
      secondary: { color: COLORS.white },
      outline: { color: COLORS.primary },
      text: { color: COLORS.primary },
    };

    return {
      ...baseStyle,
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' ? COLORS.white : COLORS.primary}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={20}
              color={variant === 'outline' || variant === 'text' ? COLORS.primary : COLORS.white}
              style={{ marginRight: SPACING.sm }}
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={20}
              color={variant === 'outline' || variant === 'text' ? COLORS.primary : COLORS.white}
              style={{ marginLeft: SPACING.sm }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
```

### Card Component (src/components/common/Card.tsx)

```typescript
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = SPACING.lg,
  elevation = 'md',
}) => {
  return (
    <View
      style={[
        styles.card,
        { padding },
        SHADOWS[elevation],
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
  },
});

export default Card;
```

---

## 5. Dashboard Implementations

### Admin Dashboard (src/screens/Dashboard/AdminDashboard.tsx)

```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, FONTS } from '@/constants';
import Card from '@/components/common/Card';
import { studentService, attendanceService, feeService, examService } from '@/services/api';

interface DashboardStats {
  total_students: number;
  total_teachers: number;
  attendance_today: number;
  pending_fees: number;
  upcoming_exams: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_students: 0,
    total_teachers: 0,
    attendance_today: 0,
    pending_fees: 0,
    upcoming_exams: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      // Fetch dashboard statistics
      const [students, attendance, fees, exams] = await Promise.all([
        studentService.getStudents({ page_size: 1 }),
        attendanceService.getStudentAttendance({
          date: new Date().toISOString().split('T')[0],
          status: 'PRESENT'
        }),
        feeService.getStudentFees({ status: 'PENDING' }),
        examService.getExams({
          date_from: new Date().toISOString().split('T')[0]
        }),
      ]);

      setStats({
        total_students: students.count,
        total_teachers: 0, // Fetch from staff service
        attendance_today: attendance.count,
        pending_fees: fees.count,
        upcoming_exams: exams.count,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard: React.FC<{
    icon: string;
    title: string;
    value: number;
    color: string;
    onPress?: () => void;
  }> = ({ icon, title, value, color, onPress }) => (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Card elevation="sm" padding={SPACING.lg}>
        <View style={styles.statContent}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Icon name={icon} size={32} color={color} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>School Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome back!</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="account-group"
          title="Total Students"
          value={stats.total_students}
          color={COLORS.primary}
        />
        <StatCard
          icon="account-tie"
          title="Total Teachers"
          value={stats.total_teachers}
          color={COLORS.secondary}
        />
        <StatCard
          icon="calendar-check"
          title="Attendance Today"
          value={stats.attendance_today}
          color={COLORS.success}
        />
        <StatCard
          icon="currency-inr"
          title="Pending Fees"
          value={stats.pending_fees}
          color={COLORS.warning}
        />
        <StatCard
          icon="clipboard-text"
          title="Upcoming Exams"
          value={stats.upcoming_exams}
          color={COLORS.info}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            icon="account-plus"
            title="Add Student"
            color={COLORS.primary}
          />
          <QuickActionButton
            icon="calendar-check"
            title="Mark Attendance"
            color={COLORS.success}
          />
          <QuickActionButton
            icon="clipboard-plus"
            title="Create Exam"
            color={COLORS.info}
          />
          <QuickActionButton
            icon="bell-plus"
            title="Send Notice"
            color={COLORS.warning}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const QuickActionButton: React.FC<{
  icon: string;
  title: string;
  color: string;
}> = ({ icon, title, color }) => (
  <TouchableOpacity style={styles.quickAction}>
    <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
      <Icon name={icon} size={24} color={COLORS.white} />
    </View>
    <Text style={styles.quickActionText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONTS['3xl'],
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONTS.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    width: '48%',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: FONTS['2xl'],
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  statTitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickAction: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});

export default AdminDashboard;
```

---

## 6. Offline Support

### Storage Service (src/services/storage.service.ts)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';
import { STORAGE_KEYS, CACHE_DURATION } from '@/constants';

// Initialize MMKV for high-performance storage
const storage = new MMKV();

class StorageService {
  /**
   * Store data with expiration
   */
  async setWithExpiry(key: string, value: any, ttl: number = CACHE_DURATION.MEDIUM): Promise<void> {
    const item = {
      value,
      expiry: Date.now() + ttl,
    };
    storage.set(key, JSON.stringify(item));
  }

  /**
   * Get data with expiration check
   */
  async getWithExpiry<T = any>(key: string): Promise<T | null> {
    const itemStr = storage.getString(key);
    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      storage.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Cache API response
   */
  async cacheResponse(endpoint: string, data: any, ttl?: number): Promise<void> {
    const key = `${STORAGE_KEYS.CACHED_DATA}${endpoint}`;
    await this.setWithExpiry(key, data, ttl);
  }

  /**
   * Get cached response
   */
  async getCachedResponse<T = any>(endpoint: string): Promise<T | null> {
    const key = `${STORAGE_KEYS.CACHED_DATA}${endpoint}`;
    return await this.getWithExpiry<T>(key);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    const keys = storage.getAllKeys();
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.CACHED_DATA)) {
        storage.delete(key);
      }
    });
  }

  /**
   * Store sync queue for offline operations
   */
  async addToSyncQueue(operation: {
    endpoint: string;
    method: string;
    data: any;
    timestamp: number;
  }): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push(operation);
    storage.set('sync_queue', JSON.stringify(queue));
  }

  /**
   * Get sync queue
   */
  async getSyncQueue(): Promise<any[]> {
    const queueStr = storage.getString('sync_queue');
    return queueStr ? JSON.parse(queueStr) : [];
  }

  /**
   * Clear sync queue
   */
  clearSyncQueue(): void {
    storage.delete('sync_queue');
  }
}

export const storageService = new StorageService();
export default storageService;
```

---

## 7. Push Notifications

### Firebase Cloud Messaging Setup (src/services/notification.service.ts)

```typescript
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class NotificationService {
  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return enabled;
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      await AsyncStorage.setItem('fcm_token', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
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
      onNotificationReceived(remoteMessage);
    });

    // Background/Quit state message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message:', remoteMessage);
    });

    // Notification opened app from background/quit state
    messaging().onNotificationOpenedApp((remoteMessage) => {
      onNotificationOpened(remoteMessage);
    });

    // Check if app was opened from a notification (quit state)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          onNotificationOpened(remoteMessage);
        }
      });
  }

  /**
   * Subscribe to topic
   */
  async subscribeToTopic(topic: string): Promise<void> {
    await messaging().subscribeToTopic(topic);
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    await messaging().unsubscribeFromTopic(topic);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
```

---

## 8. Deployment Guide

### Android Deployment

1. **Generate Signing Key**

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure Gradle** (android/app/build.gradle)

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'your-password'
            keyAlias 'my-key-alias'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

3. **Build Release APK**

```bash
cd android
./gradlew assembleRelease
```

4. **Build App Bundle for Play Store**

```bash
./gradlew bundleRelease
```

### iOS Deployment

1. **Update Bundle Identifier and Version**

2. **Configure Signing & Capabilities in Xcode**

3. **Archive and Upload to App Store**

```bash
cd ios
xcodebuild -workspace SchoolManagementApp.xcworkspace -scheme SchoolManagementApp -configuration Release archive -archivePath build/SchoolManagementApp.xcarchive
```

---

## Additional Implementation Files

Due to the extensive nature of this project, the following files should be created using similar patterns:

### Dashboards
- TeacherDashboard.tsx - Similar to AdminDashboard with teacher-specific features
- StudentDashboard.tsx - Student attendance, exams, fees overview
- ParentDashboard.tsx - Children's data, fee payment, communication

### Feature Screens
- AttendanceScreen.tsx - Mark and view attendance
- ExamScreen.tsx - View and manage exams
- FeeScreen.tsx - Fee payment and history
- LibraryScreen.tsx - Book catalog and issue/return
- TransportScreen.tsx - Route and vehicle information

### Forms
- LoginForm.tsx
- StudentForm.tsx
- AttendanceForm.tsx
- FeePaymentForm.tsx

All components should follow the established patterns in this guide using TypeScript, React Native Paper components, and the defined constants for styling.

---

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## Continuous Integration

Set up GitHub Actions for automated testing and building.

---

This implementation guide provides the foundation for building a complete School Management System mobile application. Follow the patterns and extend as needed for your specific requirements.
