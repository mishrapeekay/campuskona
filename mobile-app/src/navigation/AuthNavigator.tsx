import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types/navigation';

import LoginScreen from '@/screens/Auth/LoginScreen';
import SuperAdminLoginScreen from '@/screens/Auth/SuperAdminLoginScreen';
import RegisterScreen from '@/screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/Auth/ResetPasswordScreen';
import EmailVerificationScreen from '@/screens/Auth/EmailVerificationScreen';
import BiometricSetupScreen from '@/screens/Auth/BiometricSetupScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface Props {
  initialRoute?: keyof AuthStackParamList;
}

const AuthNavigator: React.FC<Props> = ({ initialRoute = 'Login' }) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SuperAdminLogin" component={SuperAdminLoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
