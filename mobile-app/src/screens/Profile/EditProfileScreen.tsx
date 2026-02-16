import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Animated, { FadeInUp, FadeInDown, FadeIn, Layout } from 'react-native-reanimated';

import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, Button } from '@/components/ui';
import Input from '@/components/common/Input';
import { authService } from '@/services/api';
import { User, Gender } from '@/types/models';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const currentUser = await authService.getStoredUser();
      if (!currentUser) throw new Error('User not found');
      setUser(currentUser);
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        pincode: currentUser.pincode || '',
      });
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const handleSelectImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
      });

      if (result.didCancel || !result.assets?.[0]?.uri) return;

      setUploadingImage(true);
      const { uri, type, fileName } = result.assets[0];

      try {
        const updatedUser = await authService.uploadAvatar(
          uri,
          type || 'image/jpeg',
          fileName || 'avatar.jpg'
        );
        setUser(updatedUser);
        Alert.alert('Perfect', 'Your profile photo has been updated.');
      } catch (error: any) {
        Alert.alert('Upload Failed', error.message || 'Could not update image.');
      } finally {
        setUploadingImage(false);
      }
    } catch (error) {
      setUploadingImage(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const updateData: Partial<User> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        pincode: formData.pincode || undefined,
      };
      await authService.updateCurrentUser(updateData);
      Alert.alert('Success', 'Your profile details have been saved.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Personal Details" showBackButton />

      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Modern Section */}
        <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-10">
          <View className="relative">
            <View className="w-32 h-32 rounded-[40px] bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200 dark:shadow-none items-center justify-center p-1 border-4 border-white dark:border-slate-800">
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} className="w-full h-full rounded-[36px]" />
              ) : (
                <View className="w-full h-full rounded-[36px] bg-slate-100 dark:bg-slate-800 items-center justify-center">
                  <Icon name="account" size={60} className="text-slate-300 dark:text-slate-600" />
                </View>
              )}
              {uploadingImage && (
                <View className="absolute inset-0 bg-black/40 rounded-[36px] items-center justify-center">
                  <ActivityIndicator color="white" />
                </View>
              )}
            </View>
            <TouchableOpacity
              className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center shadow-lg border-4 border-slate-50 dark:border-slate-950"
              onPress={handleSelectImage}
              disabled={uploadingImage}
            >
              <Icon name="camera-plus" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[3px] mt-6">Profile Snapshot</Text>
        </Animated.View>

        {/* Form Sections */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)}>
          <Card className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl shadow-slate-100 dark:shadow-none border border-slate-100 dark:border-slate-800">
            <View className="space-y-6">
              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Input
                    label="First Name"
                    placeholder="Enter"
                    value={formData.first_name}
                    onChangeText={(t) => setFormData({ ...formData, first_name: t })}
                    error={errors.first_name}
                    leftIcon="account-outline"
                  />
                </View>
                <View className="flex-1 ml-4">
                  <Input
                    label="Last Name"
                    placeholder="Enter"
                    value={formData.last_name}
                    onChangeText={(t) => setFormData({ ...formData, last_name: t })}
                    error={errors.last_name}
                    leftIcon="account-outline"
                  />
                </View>
              </View>

              <Input
                label="Mobile Number"
                placeholder="10 digit number"
                value={formData.phone}
                onChangeText={(t) => setFormData({ ...formData, phone: t })}
                leftIcon="phone-outline"
                keyboardType="phone-pad"
                error={errors.phone}
              />

              <Input
                label="Full Address"
                placeholder="Building, Street, Area"
                value={formData.address}
                onChangeText={(t) => setFormData({ ...formData, address: t })}
                leftIcon="map-marker-outline"
                multiline
                numberOfLines={3}
              />

              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Input
                    label="City"
                    placeholder="City"
                    value={formData.city}
                    onChangeText={(t) => setFormData({ ...formData, city: t })}
                    leftIcon="city-variant-outline"
                  />
                </View>
                <View className="flex-[0.8] ml-4">
                  <Input
                    label="Pincode"
                    placeholder="000000"
                    value={formData.pincode}
                    onChangeText={(t) => setFormData({ ...formData, pincode: t })}
                    leftIcon="mailbox-outline"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>
            </View>

            <View className="mt-10 mb-2">
              <Button
                title={loading ? 'Updating Profile...' : 'Save Profile Changes'}
                onPress={handleSave}
                loading={loading}
                disabled={loading}
                size="lg"
                className="rounded-3xl shadow-lg shadow-indigo-200 dark:shadow-none"
              />
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="mt-6 py-2 items-center"
              >
                <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider">Discard Changes</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>

        <View className="mt-10 items-center opacity-30">
          <Icon name="shield-lock-outline" size={24} className="text-slate-400" />
          <Text className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">End-to-End Encrypted Node</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default EditProfileScreen;
