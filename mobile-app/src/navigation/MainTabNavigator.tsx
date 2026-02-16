import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColorScheme } from 'nativewind';
import { useAppSelector } from '@/store/hooks';

// Types
import { MainTabParamList, ROLE_TAB_CONFIG, UserType } from '@/types/navigation';

// Stack Navigators
import HomeStackNavigator from './stacks/HomeStackNavigator';
import AcademicsStackNavigator from './stacks/AcademicsStackNavigator';
import FinanceStackNavigator from './stacks/FinanceStackNavigator';
import ServicesStackNavigator from './stacks/ServicesStackNavigator';
import TenantsStackNavigator from './stacks/TenantsStackNavigator';
import ProfileStackNavigator from './stacks/ProfileStackNavigator';
import PartnerStackNavigator from './stacks/PartnerStackNavigator';
import InvestorStackNavigator from './stacks/InvestorStackNavigator';

// Constants
import { COLORS, SPACING, SHADOWS } from '@/constants';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom Tab Bar Icon Component
interface TabIconProps {
  focused: boolean;
  icon: string;
  activeIcon?: string;
  label: string;
  badge?: number;
  isDark: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({
  focused,
  icon,
  activeIcon,
  label,
  badge,
  isDark,
}) => {
  const iconName = focused ? (activeIcon || icon) : icon;
  const activeColor = COLORS.primary;
  const inactiveColor = isDark ? '#64748b' : COLORS.gray400; // slate-500 for dark mode inactive
  const iconColor = focused ? activeColor : inactiveColor;

  return (
    <View style={styles.tabIconContainer}>
      <View
        style={[
          styles.iconWrapper,
          focused && {
            backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : COLORS.primary + '15'
          }
        ]}
      >
        <Icon name={iconName} size={24} color={iconColor} />
        {badge !== undefined && badge > 0 && (
          <View style={[styles.badgeContainer, isDark && { borderColor: '#020617' }]}>
            <Text style={styles.badgeText}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
      </View>
      <Text
        style={[
          styles.tabLabel,
          focused ? { color: activeColor, fontWeight: '700' } : { color: inactiveColor }
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const MainTabNavigator: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const userType = (user?.user_type || 'STUDENT') as UserType;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Get tabs based on user role
  const tabs = ROLE_TAB_CONFIG[userType] || ROLE_TAB_CONFIG.STUDENT;

  // Map tab names to stack navigators
  const getStackNavigator = (tabName: keyof MainTabParamList) => {
    switch (tabName) {
      case 'HomeTab':
        return HomeStackNavigator;
      case 'AcademicsTab':
        return AcademicsStackNavigator;
      case 'FinanceTab':
        return FinanceStackNavigator;
      case 'ServicesTab':
        return ServicesStackNavigator;
      case 'TenantsTab':
        return TenantsStackNavigator;
      case 'ProfileTab':
        return ProfileStackNavigator;
      case 'PartnerTab':
        return PartnerStackNavigator;
      case 'InvestorTab':
        return InvestorStackNavigator;
      default:
        return HomeStackNavigator;
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: isDark ? '#020617' : COLORS.white,
            borderTopColor: isDark ? '#1e293b' : 'transparent', // slate-800 border
          }
        ],
        tabBarHideOnKeyboard: true,
      }}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={getStackNavigator(tab.name)}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                icon={tab.icon}
                activeIcon={tab.activeIcon}
                label={tab.label}
                badge={tab.badge}
                isDark={isDark}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: SPACING.sm,
    ...(Platform.OS === 'ios' ? SHADOWS.lg : { elevation: 8, shadowColor: '#000' }),
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: Platform.OS === 'android' ? 0 : 1, // Add border for iOS for better separation
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default MainTabNavigator;
