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
import admissionsReducer from './slices/admissionsSlice';
import hostelReducer from './slices/hostelSlice';
import hrPayrollReducer from './slices/hrPayrollSlice';
import reportsReducer from './slices/reportsSlice';
import brandingReducer from './slices/brandingSlice';
import themeReducer from './slices/themeSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'theme', 'tenant', 'branding'], // Only persist these reducers
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  theme: themeReducer,
  tenant: tenantReducer,
  student: studentReducer,
  attendance: attendanceReducer,
  exam: examReducer,
  fee: feeReducer,
  library: libraryReducer,
  transport: transportReducer,
  notification: notificationReducer,
  admissions: admissionsReducer,
  hostel: hostelReducer,
  hrPayroll: hrPayrollReducer,
  reports: reportsReducer,
  branding: brandingReducer,
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

// Connect API client to store for automatic logout on 401
import { apiClient } from '@/services/api/client';
import { logout } from './slices/authSlice';

apiClient.setLogoutCallback(() => {
  store.dispatch(logout());
});

