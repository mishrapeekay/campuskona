/**
 * Modern Design System Theme
 *
 * Comprehensive theme configuration for the School Management System mobile app.
 * Includes colors, typography, spacing, shadows, and component styles.
 */

// ===== COLOR PALETTE =====
export const COLORS = {
  // Primary Colors
  primary: '#2563EB', // Modern blue
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryMuted: '#DBEAFE',

  // Secondary Colors
  secondary: '#7C3AED', // Vibrant purple
  secondaryLight: '#8B5CF6',
  secondaryDark: '#6D28D9',
  secondaryMuted: '#EDE9FE',

  // Accent Colors
  accent: '#F59E0B', // Warm amber
  accentLight: '#FBBF24',
  accentDark: '#D97706',
  accentMuted: '#FEF3C7',

  // Semantic Colors
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',
  successMuted: '#D1FAE5',

  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',
  errorMuted: '#FEE2E2',

  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  warningMuted: '#FEF3C7',

  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoDark: '#2563EB',
  infoMuted: '#DBEAFE',

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
  background: '#F9FAFB',
  backgroundDark: '#020617', // Near black deep navy
  surface: '#FFFFFF',
  surfaceDark: '#0F172A', // Slate-900 for surfaces
  card: '#FFFFFF',
  cardDark: '#0F172A', // Slate-900 for cards

  // Text Colors
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Border Colors
  border: '#E5E7EB',
  borderFocused: '#2563EB',
  divider: '#F3F4F6',

  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Status Colors (for badges, indicators)
  online: '#10B981',
  offline: '#6B7280',
  busy: '#EF4444',
  away: '#F59E0B',

  // Role-specific Colors
  admin: '#7C3AED',
  teacher: '#2563EB',
  student: '#10B981',
  parent: '#F59E0B',
  accountant: '#6366F1',
  librarian: '#EC4899',
  transport: '#14B8A6',
} as const;

// ===== TYPOGRAPHY =====
export const FONTS = {
  // Font Families
  family: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    light: 'Inter-Light',
  },

  // Font Sizes
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

// ===== SPACING =====
export const SPACING = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

// ===== BORDER RADIUS =====
export const RADIUS = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ===== SHADOWS =====
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

// ===== Z-INDEX =====
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
} as const;

// ===== ANIMATION =====
export const ANIMATION = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// ===== BREAKPOINTS =====
export const BREAKPOINTS = {
  sm: 320,
  md: 375,
  lg: 414,
  xl: 480,
  tablet: 768,
} as const;

// ===== COMPONENT STYLES =====
export const COMPONENT_STYLES = {
  // Button Variants
  button: {
    primary: {
      backgroundColor: COLORS.primary,
      color: COLORS.white,
    },
    secondary: {
      backgroundColor: COLORS.secondary,
      color: COLORS.white,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.primary,
      color: COLORS.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: COLORS.primary,
    },
    danger: {
      backgroundColor: COLORS.error,
      color: COLORS.white,
    },
  },

  // Button Sizes
  buttonSize: {
    sm: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      fontSize: FONTS.size.sm,
    },
    md: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      fontSize: FONTS.size.base,
    },
    lg: {
      paddingVertical: SPACING.base,
      paddingHorizontal: SPACING.xl,
      fontSize: FONTS.size.md,
    },
  },

  // Input Styles
  input: {
    base: {
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: RADIUS.md,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.base,
      fontSize: FONTS.size.base,
      color: COLORS.text,
    },
    focused: {
      borderColor: COLORS.primary,
      borderWidth: 2,
    },
    error: {
      borderColor: COLORS.error,
    },
    disabled: {
      backgroundColor: COLORS.gray100,
      color: COLORS.textMuted,
    },
  },

  // Card Styles
  card: {
    base: {
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.lg,
      padding: SPACING.base,
      ...SHADOWS.base,
    },
    elevated: {
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.lg,
      padding: SPACING.base,
      ...SHADOWS.md,
    },
    outlined: {
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.lg,
      padding: SPACING.base,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
  },

  // Badge Styles
  badge: {
    primary: {
      backgroundColor: COLORS.primaryMuted,
      color: COLORS.primary,
    },
    success: {
      backgroundColor: COLORS.successMuted,
      color: COLORS.successDark,
    },
    warning: {
      backgroundColor: COLORS.warningMuted,
      color: COLORS.warningDark,
    },
    error: {
      backgroundColor: COLORS.errorMuted,
      color: COLORS.errorDark,
    },
    info: {
      backgroundColor: COLORS.infoMuted,
      color: COLORS.infoDark,
    },
  },
} as const;

// ===== TYPOGRAPHY STYLES =====
export const TYPOGRAPHY = {
  // Display
  displayLarge: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size['5xl'],
    lineHeight: FONTS.size['5xl'] * FONTS.lineHeight.tight,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  displayMedium: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size['4xl'],
    lineHeight: FONTS.size['4xl'] * FONTS.lineHeight.tight,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  displaySmall: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size['3xl'],
    lineHeight: FONTS.size['3xl'] * FONTS.lineHeight.tight,
    letterSpacing: FONTS.letterSpacing.tight,
  },

  // Headings
  h1: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size['2xl'],
    lineHeight: FONTS.size['2xl'] * FONTS.lineHeight.tight,
    color: COLORS.text,
  },
  h2: {
    fontFamily: FONTS.family.semiBold,
    fontSize: FONTS.size.xl,
    lineHeight: FONTS.size.xl * FONTS.lineHeight.tight,
    color: COLORS.text,
  },
  h3: {
    fontFamily: FONTS.family.semiBold,
    fontSize: FONTS.size.lg,
    lineHeight: FONTS.size.lg * FONTS.lineHeight.normal,
    color: COLORS.text,
  },
  h4: {
    fontFamily: FONTS.family.medium,
    fontSize: FONTS.size.md,
    lineHeight: FONTS.size.md * FONTS.lineHeight.normal,
    color: COLORS.text,
  },

  // Body
  bodyLarge: {
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.md,
    lineHeight: FONTS.size.md * FONTS.lineHeight.relaxed,
    color: COLORS.text,
  },
  bodyMedium: {
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.base,
    lineHeight: FONTS.size.base * FONTS.lineHeight.relaxed,
    color: COLORS.text,
  },
  bodySmall: {
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.sm,
    lineHeight: FONTS.size.sm * FONTS.lineHeight.relaxed,
    color: COLORS.textSecondary,
  },

  // Labels
  labelLarge: {
    fontFamily: FONTS.family.medium,
    fontSize: FONTS.size.base,
    lineHeight: FONTS.size.base * FONTS.lineHeight.normal,
    letterSpacing: FONTS.letterSpacing.wide,
    color: COLORS.text,
  },
  labelMedium: {
    fontFamily: FONTS.family.medium,
    fontSize: FONTS.size.sm,
    lineHeight: FONTS.size.sm * FONTS.lineHeight.normal,
    letterSpacing: FONTS.letterSpacing.wide,
    color: COLORS.textSecondary,
  },
  labelSmall: {
    fontFamily: FONTS.family.medium,
    fontSize: FONTS.size.xs,
    lineHeight: FONTS.size.xs * FONTS.lineHeight.normal,
    letterSpacing: FONTS.letterSpacing.wide,
    color: COLORS.textMuted,
  },

  // Caption
  caption: {
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.xs,
    lineHeight: FONTS.size.xs * FONTS.lineHeight.normal,
    color: COLORS.textMuted,
  },
} as const;

// ===== DARK THEME OVERRIDES =====
export const DARK_COLORS = {
  ...COLORS,
  background: COLORS.backgroundDark,
  surface: COLORS.surfaceDark,
  card: COLORS.cardDark,
  text: COLORS.white,
  textSecondary: COLORS.gray400,
  textMuted: COLORS.gray500,
  border: COLORS.gray700,
  divider: COLORS.gray800,
} as const;

// Default export for convenience
export default {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
  Z_INDEX,
  ANIMATION,
  BREAKPOINTS,
  COMPONENT_STYLES,
  TYPOGRAPHY,
  DARK_COLORS,
};
