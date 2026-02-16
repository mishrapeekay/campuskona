import React from 'react';
import { View, Text, ViewStyle, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { COLORS, FONTS, SPACING } from '@/constants';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import OfflineSyncBadge from '../common/OfflineSyncBadge';

cssInterop(Icon, { className: 'style' });

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  useSafeArea?: boolean;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  backgroundColor,
  useSafeArea = false, // Changed default to false as Header now handles insets
}) => {
  const Container = useSafeArea ? SafeAreaView : View;
  const { isOffline } = useOfflineMode();

  return (
    <Container
      className={`flex-1 ${backgroundColor ? '' : 'bg-white dark:bg-slate-950'}`}
      style={[backgroundColor ? { backgroundColor } : {}, style]}
    >
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <OfflineSyncBadge />
      {isOffline && (
        <View className="bg-slate-900 dark:bg-slate-800 flex-row items-center justify-center py-1.5 px-4 gap-2">
          <Icon name="cloud-off-outline" size={14} color="white" />
          <Text className="text-white font-medium text-[10px]">
            Limited Connectivity - Syncing in progress
          </Text>
        </View>
      )}
      {children}
    </Container>
  );
};

export default ScreenWrapper;
