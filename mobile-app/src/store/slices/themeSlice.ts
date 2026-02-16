import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
    mode: ThemeMode;
    isDark: boolean;
}

const initialState: ThemeState = {
    mode: 'system',
    isDark: Appearance.getColorScheme() === 'dark',
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setTheme(state, action: PayloadAction<ThemeMode>) {
            state.mode = action.payload;
            if (action.payload === 'system') {
                state.isDark = Appearance.getColorScheme() === 'dark';
            } else {
                state.isDark = action.payload === 'dark';
            }
        },
        updateSystemTheme(state, action: PayloadAction<boolean>) {
            if (state.mode === 'system') {
                state.isDark = action.payload;
            }
        },
    },
});

export const { setTheme, updateSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;
