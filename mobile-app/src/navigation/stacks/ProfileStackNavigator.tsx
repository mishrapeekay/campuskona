/**
 * ProfileStackNavigator - Profile, Settings, Help
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Types
import { ProfileStackParamList } from '@/types/navigation';

// Profile Screens
import ProfileScreen from '@/screens/Profile/ProfileScreen';
import EditProfileScreen from '@/screens/Profile/EditProfileScreen';
import ChangePasswordScreen from '@/screens/Profile/ChangePasswordScreen';
import NotificationCenterScreen from '@/screens/Profile/NotificationCenterScreen';
import SettingsScreen from '@/screens/Profile/SettingsScreen';
import HelpCenterScreen from '@/screens/Profile/HelpCenterScreen';
import FeedbackScreen from '@/screens/Profile/FeedbackScreen';
import AboutScreen from '@/screens/Profile/AboutScreen';
import TimetableScreen from '@/screens/Timetable/TimetableScreen';
import CreateNoticeScreen from '@/screens/Communication/CreateNoticeScreen';
import ThemeSettingsScreen from '@/screens/Settings/ThemeSettingsScreen';
import PrivacySettingsScreen from '@/screens/Settings/PrivacySettingsScreen';
import LanguageSettingsScreen from '@/screens/Settings/LanguageSettingsScreen';

// Constants
import { COLORS } from '@/constants';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      {/* Profile Overview */}
      <Stack.Screen name="ProfileOverview" component={ProfileScreen} />

      {/* Profile Management */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

      {/* Timetable & Schedule */}
      <Stack.Screen name="MyTimetable" component={TimetableScreen} />

      {/* Communications */}
      <Stack.Screen name="CreateNotice" component={CreateNoticeScreen} />

      {/* Settings */}
      <Stack.Screen name="SettingsHome" component={SettingsScreen} />
      <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
      <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />

      {/* Notifications */}
      <Stack.Screen name="NotificationHistory" component={NotificationCenterScreen} />

      {/* Help & Support */}
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />

      {/* About */}
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
