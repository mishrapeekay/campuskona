import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { brandingService, BrandingConfig } from '@/services/branding.service';
import { RootState } from '@/store';
import { COLORS } from '@/constants/theme';

interface BrandingState {
    config: BrandingConfig | null;
    isLoading: boolean;
    error: string | null;
    // Computed theme colors
    themeColors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
    };
}

const initialState: BrandingState = {
    config: null,
    isLoading: false,
    error: null,
    themeColors: {
        primary: COLORS.primary,
        secondary: COLORS.secondary,
        accent: COLORS.accent,
        background: COLORS.background,
        surface: COLORS.surface,
        text: COLORS.text,
    },
};

export const fetchBranding = createAsyncThunk(
    'branding/fetchBranding',
    async (subdomain: string, { rejectWithValue }) => {
        try {
            const data = await brandingService.getBranding(subdomain);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch branding');
        }
    }
);

const brandingSlice = createSlice({
    name: 'branding',
    initialState,
    reducers: {
        resetBranding: (state) => {
            state.config = null;
            state.themeColors = initialState.themeColors;
        },
        setBranding: (state, action: PayloadAction<BrandingConfig>) => {
            state.config = action.payload;
            state.themeColors = {
                primary: action.payload.primary_color || COLORS.primary,
                secondary: action.payload.secondary_color || COLORS.secondary,
                accent: action.payload.accent_color || COLORS.accent,
                background: COLORS.background, // Can be extended
                surface: COLORS.surface,
                text: COLORS.text,
            };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBranding.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchBranding.fulfilled, (state, action) => {
                state.isLoading = false;
                state.config = action.payload;
                // Update theme colors
                state.themeColors = {
                    primary: action.payload.primary_color || COLORS.primary,
                    secondary: action.payload.secondary_color || COLORS.secondary,
                    accent: action.payload.accent_color || COLORS.accent,
                    background: COLORS.background,
                    surface: COLORS.surface,
                    text: COLORS.text,
                };
            })
            .addCase(fetchBranding.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetBranding, setBranding } = brandingSlice.actions;

export const selectBranding = (state: RootState) => state.branding;
export const selectThemeColors = (state: RootState) => state.branding.themeColors;

export default brandingSlice.reducer;
