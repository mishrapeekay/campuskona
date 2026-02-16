/**
 * Shared Design Tokens
 * 
 * Single source of truth for design tokens across the mobile app.
 * Aligned with the web platform's token system.
 */

export const COLORS = {
    // Brand Colors
    primary: {
        DEFAULT: '#4F46E5', // Indigo 600
        light: '#818CF8',   // Indigo 400
        dark: '#3730A3',    // Indigo 800
        foreground: '#FFFFFF',
    },
    secondary: {
        DEFAULT: '#F1F5F9', // Slate 100
        foreground: '#0F172A', // Slate 900
    },
    accent: {
        DEFAULT: '#F1F5F9', // Slate 100
        foreground: '#0F172A', // Slate 900
    },
    destructive: {
        DEFAULT: '#EF4444', // Red 500
        foreground: '#FFFFFF',
    },

    // Semantic Colors
    background: '#020617', // Slate 950
    foreground: '#F8FAFC', // Slate 50

    card: {
        DEFAULT: '#0F172A', // Slate 900
        foreground: '#F8FAFC', // Slate 50
    },

    popover: {
        DEFAULT: '#0F172A', // Slate 900
        foreground: '#F8FAFC', // Slate 50
    },

    muted: {
        DEFAULT: '#1E293B', // Slate 800
        foreground: '#94A3B8', // Slate 400
    },

    border: '#1E293B', // Slate 800
    input: '#1E293B', // Slate 800
    ring: '#4F46E5', // Indigo 600

    // Status Colors
    success: '#10B981', // Emerald 500
    warning: '#F59E0B', // Amber 500
    info: '#3B82F6',    // Blue 500

    // Legacy support (to be deprecated)
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
} as const;

export const SPACING = {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    28: 112,
    32: 128,
    36: 144,
    40: 160,
    44: 176,
    48: 192,
    52: 208,
    56: 224,
    60: 240,
    64: 256,
    72: 288,
    80: 320,
    96: 384,
} as const;

export const RADIUS = {
    none: 0,
    sm: 4,
    DEFAULT: 8,
    md: 10,
    lg: 12,
    xl: 16,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
} as const;

export const FONTS = {
    family: {
        sans: 'Inter-Regular',
        medium: 'Inter-Medium',
        bold: 'Inter-Bold',
        mono: 'SpaceMono-Regular',
    },
    size: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
    },
} as const;

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    DEFAULT: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
} as const;

export default {
    COLORS,
    SPACING,
    RADIUS,
    FONTS,
    SHADOWS,
};
