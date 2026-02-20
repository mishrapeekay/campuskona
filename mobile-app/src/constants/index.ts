import { Dimensions, Platform } from 'react-native';

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://10.0.2.2:8000/api/v1' : 'https://www.campuskona.com/api/v1',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
  RAZORPAY_KEY_ID: 'rzp_test_change_this', // TODO: Update with production key from backend or env
};


// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@access_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_DATA: '@user_data',
  SELECTED_TENANT: '@selected_tenant',
  TENANT_CONFIG: '@tenant_config',
  THEME: '@theme',
  LANGUAGE: '@language',
  REMEMBER_ME: '@remember_me',
  CACHED_DATA: '@cached_data_',
  TENANT_FEATURES: '@tenant_features',
  SUBSCRIPTION_TIER: '@subscription_tier',
  SUPER_ADMIN_MODE: '@super_admin_mode',
};

// App Dimensions
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;
export const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';

// Theme Colors
export const COLORS = {
  // Primary Colors
  primary: '#4F46E5', // Indigo 600 (Web Match)
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',

  // Secondary Colors
  secondary: '#7C3AED',
  secondaryLight: '#A78BFA',
  secondaryDark: '#5B21B6',

  // Accent Colors
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  accentDark: '#D97706',

  // Status Colors
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',

  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningDark: '#D97706',

  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',

  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoDark: '#2563EB',

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',

  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Background Colors
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Text Colors
  text: '#111827',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textMuted: '#9CA3AF',
  textDisabled: '#D1D5DB',
  textOnPrimary: '#FFFFFF',
  textInverse: '#FFFFFF',

  // Muted Colors (for backgrounds)
  primaryMuted: '#DBEAFE',
  secondaryMuted: '#EDE9FE',
  successMuted: '#D1FAE5',
  warningMuted: '#FEF3C7',
  errorMuted: '#FEE2E2',
  infoMuted: '#DBEAFE',
  accentMuted: '#FEF3C7',

  // Additional Colors
  purple: '#7C3AED',
  divider: '#F3F4F6',

  // Border Colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
  borderFocused: '#2563EB',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// Typography
export const FONTS = {
  // Font Families
  regular: IS_IOS ? 'System' : 'Roboto',
  medium: IS_IOS ? 'System' : 'Roboto-Medium',
  semibold: IS_IOS ? 'System' : 'Roboto-Medium',
  bold: IS_IOS ? 'System' : 'Roboto-Bold',

  // Font Sizes
  xs: 10,
  sm: 12,
  md: 14,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 36,

  // Line Heights
  lineHeight: {
    xs: 14,
    sm: 16,
    base: 20,
    lg: 24,
    xl: 28,
    '2xl': 32,
  },
};

// Spacing
export const SPACING = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

// Border Radius
export const RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Shadows
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
export const MODERN_SHADOWS = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  xl: {
    shadowColor: '#6366F1', // Indigo tint for premium feel
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
};

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMM yyyy, hh:mm a',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
  TIME_ONLY: 'hh:mm a',
  DAY_MONTH: 'dd MMM',
  MONTH_YEAR: 'MMM yyyy',
};

// User Type Icons
export const USER_TYPE_ICONS = {
  SUPER_ADMIN: 'shield-account',
  SCHOOL_ADMIN: 'account-tie',
  PRINCIPAL: 'account-star',
  TEACHER: 'human-male-board',
  STUDENT: 'school',
  PARENT: 'account-group',
  ACCOUNTANT: 'calculator',
  LIBRARIAN: 'book-open-page-variant',
  TRANSPORT_MANAGER: 'bus-school',
};

// Status Colors
export const STATUS_COLORS = {
  // Attendance
  PRESENT: COLORS.success,
  ABSENT: COLORS.error,
  LATE: COLORS.warning,
  HALF_DAY: COLORS.info,
  LEAVE: COLORS.gray500,
  HOLIDAY: COLORS.gray400,

  // Payment
  PENDING: COLORS.warning,
  PARTIAL: COLORS.info,
  PAID: COLORS.success,
  OVERDUE: COLORS.error,

  // Leave Status
  APPROVED: COLORS.success,
  REJECTED: COLORS.error,

  // Admission Status
  ACTIVE: COLORS.success,
  INACTIVE: COLORS.gray500,
  PENDING_APPROVAL: COLORS.warning,
  TRANSFERRED: COLORS.info,
  PASSED_OUT: COLORS.gray400,

  // Priority
  LOW: COLORS.gray500,
  MEDIUM: COLORS.info,
  HIGH: COLORS.warning,
  URGENT: COLORS.error,
};

// Icons
export const ICONS = {
  // Navigation
  home: 'home',
  dashboard: 'view-dashboard',
  students: 'account-group',
  staff: 'account-tie',
  attendance: 'calendar-check',
  exams: 'clipboard-text',
  fees: 'currency-inr',
  library: 'book-open-page-variant',
  transport: 'bus-school',
  communication: 'bell',
  profile: 'account-circle',
  settings: 'cog',

  // Actions
  add: 'plus',
  edit: 'pencil',
  delete: 'delete',
  save: 'content-save',
  cancel: 'close',
  search: 'magnify',
  filter: 'filter',
  sort: 'sort',
  refresh: 'refresh',
  download: 'download',
  upload: 'upload',
  share: 'share',
  print: 'printer',

  // Status
  check: 'check',
  close: 'close',
  info: 'information',
  warning: 'alert',
  error: 'alert-circle',
  success: 'check-circle',

  // Others
  calendar: 'calendar',
  clock: 'clock',
  phone: 'phone',
  email: 'email',
  location: 'map-marker',
  attachment: 'attachment',
  camera: 'camera',
  gallery: 'image',
  document: 'file-document',
  menu: 'menu',
  back: 'arrow-left',
  forward: 'arrow-right',
  up: 'arrow-up',
  down: 'arrow-down',
  logout: 'logout',
  notification: 'bell',
  notificationBadge: 'bell-badge',
  eye: 'eye',
  eyeOff: 'eye-off',
  lock: 'lock',
  unlock: 'lock-open',
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE_REGEX: /^[6-9]\d{9}$/,
  AADHAR_REGEX: /^\d{12}$/,
  PAN_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  PINCODE_REGEX: /^\d{6}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

// Cache Durations (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
};

// Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD: 5 * 60 * 1000, // 5 minutes
  NOTIFICATIONS: 2 * 60 * 1000, // 2 minutes
  ATTENDANCE: 10 * 60 * 1000, // 10 minutes
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check the form for errors.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logged out successfully.',
  SAVE: 'Saved successfully!',
  UPDATE: 'Updated successfully!',
  DELETE: 'Deleted successfully!',
  UPLOAD: 'Uploaded successfully!',
  SEND: 'Sent successfully!',
};

export default {
  API_CONFIG,
  STORAGE_KEYS,
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
  ANIMATION_DURATION,
  PAGINATION,
  DATE_FORMATS,
  USER_TYPE_ICONS,
  STATUS_COLORS,
  ICONS,
  VALIDATION,
  FILE_UPLOAD,
  CACHE_DURATION,
  REFRESH_INTERVALS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
