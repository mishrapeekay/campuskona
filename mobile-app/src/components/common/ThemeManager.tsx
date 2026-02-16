import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useAppSelector } from '@/store/hooks';
import { COLORS } from '@/constants';

export const ThemeManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { mode } = useAppSelector((state) => state.theme);
    const { setColorScheme, colorScheme } = useColorScheme();

    // Sync Redux state with NativeWind
    useEffect(() => {
        // NativeWind's setColorScheme accepts 'light', 'dark', 'system'.
        // We cast to any because the type definition might differ slightly in strict mode
        setColorScheme(mode as any);
    }, [mode, setColorScheme]);

    const isDark = colorScheme === 'dark';

    return (
        <>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={isDark ? '#020617' : COLORS.white}
                translucent={false}
            />
            {children}
        </>
    );
};
