/**
 * DrawerNavigator - Side Menu Navigation
 *
 * Contains:
 * - Custom drawer content with user profile
 * - Quick links to common screens
 * - Bottom tabs as main content
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { clearTenant } from '@/store/slices/tenantSlice';

// Types
import { DrawerParamList } from '@/types/navigation';

// Navigators
import MainTabNavigator from './MainTabNavigator';
import ProfileStackNavigator from './stacks/ProfileStackNavigator';

// Screens (for drawer items)
import HelpCenterScreen from '@/screens/Profile/HelpCenterScreen';
import FeedbackScreen from '@/screens/Profile/FeedbackScreen';
import AboutScreen from '@/screens/Profile/AboutScreen';
import NotificationCenterScreen from '@/screens/Profile/NotificationCenterScreen';

// Constants
import { COLORS, SPACING, FONTS, RADIUS } from '@/constants';

const Drawer = createDrawerNavigator<DrawerParamList>();

// Custom Drawer Content
const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { navigation } = props;
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedTenant } = useAppSelector((state) => state.tenant);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearTenant());
  };

  const menuItems = [
    {
      id: 'home',
      icon: 'home-outline',
      label: 'Home',
      onPress: () => navigation.navigate('MainTabs'),
    },
    {
      id: 'profile',
      icon: 'account-outline',
      label: 'My Profile',
      onPress: () => navigation.navigate('DrawerProfile'),
    },
    {
      id: 'notifications',
      icon: 'bell-outline',
      label: 'Notifications',
      badge: 3,
      onPress: () => navigation.navigate('MainTabs', { screen: 'ProfileTab', params: { screen: 'NotificationHistory' } }),
    },
    {
      id: 'settings',
      icon: 'cog-outline',
      label: 'Settings',
      onPress: () => navigation.navigate('DrawerSettings'),
    },
    { id: 'divider1', type: 'divider' },
    {
      id: 'help',
      icon: 'help-circle-outline',
      label: 'Help Center',
      onPress: () => navigation.navigate('DrawerHelp'),
    },
    {
      id: 'feedback',
      icon: 'message-text-outline',
      label: 'Send Feedback',
      onPress: () => navigation.navigate('DrawerFeedback'),
    },
    {
      id: 'about',
      icon: 'information-outline',
      label: 'About',
      onPress: () => navigation.navigate('DrawerAbout'),
    },
    { id: 'divider2', type: 'divider' },
    {
      id: 'logout',
      icon: 'logout',
      label: 'Logout',
      color: COLORS.error,
      onPress: handleLogout,
    },
  ];

  const getUserTypeLabel = (userType: string) => {
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrator',
      SCHOOL_ADMIN: 'School Administrator',
      PRINCIPAL: 'Principal',
      TEACHER: 'Teacher',
      STUDENT: 'Student',
      PARENT: 'Parent',
      ACCOUNTANT: 'Accountant',
      LIBRARIAN: 'Librarian',
      TRANSPORT_MANAGER: 'Transport Manager',
    };
    return labels[userType] || userType;
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Header with User Profile */}
      <View style={styles.drawerHeader}>
        <View style={styles.headerGradient}>
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.first_name?.[0] || 'U'}
                    {user?.last_name?.[0] || ''}
                  </Text>
                </View>
              )}
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email}
              </Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {getUserTypeLabel(user?.user_type || '')}
                </Text>
              </View>
            </View>
          </View>
          {selectedTenant && (
            <View style={styles.tenantInfo}>
              <Icon name="school" size={14} color={COLORS.white} />
              <Text style={styles.tenantName} numberOfLines={1}>
                {selectedTenant.school_name}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item: any) => {
          if (item.type === 'divider') {
            return <View key={item.id} style={styles.divider} />;
          }

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Icon
                  name={item.icon || 'circle'}
                  size={22}
                  color={item.color || COLORS.gray700}
                />
                <Text
                  style={[
                    styles.menuItemLabel,
                    item.color && { color: item.color },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.drawerFooter}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          width: '80%',
          maxWidth: 320,
          backgroundColor: COLORS.white,
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        swipeEnabled: true,
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabNavigator} />
      <Drawer.Screen
        name="DrawerProfile"
        component={ProfileStackNavigator}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="DrawerSettings"
        component={ProfileStackNavigator}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="DrawerHelp"
        component={HelpCenterScreen}
        options={{ headerShown: true, headerTitle: 'Help Center' }}
      />
      <Drawer.Screen
        name="DrawerFeedback"
        component={FeedbackScreen}
        options={{ headerShown: true, headerTitle: 'Send Feedback' }}
      />
      <Drawer.Screen
        name="DrawerAbout"
        component={AboutScreen}
        options={{ headerShown: true, headerTitle: 'About' }}
      />
      <Drawer.Screen
        name="DrawerNotifications"
        component={NotificationCenterScreen}
        options={{ headerShown: true, headerTitle: 'Notifications' }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  drawerHeader: {
    backgroundColor: COLORS.primary,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: FONTS.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: FONTS.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.xs,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: FONTS.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  tenantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  tenantName: {
    fontSize: FONTS.sm,
    color: COLORS.white,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemLabel: {
    fontSize: FONTS.md,
    color: COLORS.gray800,
    marginLeft: SPACING.md,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: COLORS.error,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: FONTS.xs,
    color: COLORS.white,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.lg,
  },
  drawerFooter: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  versionText: {
    fontSize: FONTS.xs,
    color: COLORS.gray400,
    textAlign: 'center',
  },
});

export default DrawerNavigator;
