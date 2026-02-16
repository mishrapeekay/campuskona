import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { COLORS, FONTS, SPACING } from '@/constants';

cssInterop(Icon, { className: 'style' });

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightIcon?: string;
  onRightIconPress?: () => void;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  rightIcon,
  onRightIconPress,
  showBackButton = false,
  rightComponent,
  transparent = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`flex-row items-center justify-between px-6 pb-4 pt-2 ${transparent
          ? 'bg-transparent'
          : 'bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800'
        }`}
      style={{ paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 8 }}
    >
      <View className="flex-row items-center flex-1">
        {showBackButton && onBackPress && (
          <TouchableOpacity
            onPress={onBackPress}
            className="w-10 h-10 rounded-full items-center justify-center -ml-2 mr-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
          >
            <Icon name="arrow-left" size={24} className="text-slate-900 dark:text-slate-100" />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight" numberOfLines={1}>{title}</Text>
          {subtitle && (
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightComponent ? (
        rightComponent
      ) : (
        rightIcon &&
        onRightIconPress && (
          <TouchableOpacity
            onPress={onRightIconPress}
            className="w-10 h-10 rounded-xl items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
          >
            <Icon name={rightIcon} size={24} className="text-slate-900 dark:text-slate-100" />
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

export default Header;
