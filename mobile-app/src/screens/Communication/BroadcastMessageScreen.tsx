import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

const BroadcastMessageScreen: React.FC = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendPush, setSendPush] = useState(true);
  const [sendSMS, setSendSMS] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const recipientGroups = [
    { id: 'all', label: 'All', icon: 'account-group', count: 1200 },
    { id: 'students', label: 'Students', icon: 'school', count: 500 },
    { id: 'parents', label: 'Parents', icon: 'account-child', count: 450 },
    { id: 'teachers', label: 'Teachers', icon: 'human-male-board', count: 50 },
    { id: 'staff', label: 'Staff', icon: 'briefcase', count: 80 },
  ];

  const toggleGroup = (groupId: string) => {
    if (groupId === 'all') {
      setSelectedGroups(selectedGroups.includes('all') ? [] : ['all']);
      return;
    }
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(g => g !== groupId)
        : [...prev.filter(g => g !== 'all'), groupId]
    );
  };

  const totalRecipients = selectedGroups.includes('all')
    ? 1200
    : recipientGroups.filter(g => selectedGroups.includes(g.id)).reduce((sum, g) => sum + g.count, 0);

  const isFormValid = title.length > 0 && message.length > 0 && totalRecipients > 0;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header
        title="Broadcast Message"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="p-6">
          {/* Recipients */}
          <View className="mb-8">
            <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-6">Recipients</Text>
            <View className="flex-row flex-wrap gap-3">
              {recipientGroups.map((group) => {
                const isSelected = selectedGroups.includes(group.id) || (group.id !== 'all' && selectedGroups.includes('all'));
                return (
                  <TouchableOpacity
                    key={group.id}
                    onPress={() => toggleGroup(group.id)}
                    className={`flex-row items-center px-5 py-3 rounded-2xl border ${isSelected
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                      } active:scale-95 transition-all shadow-sm`}
                  >
                    <Icon
                      name={isSelected ? 'checkbox-marked-circle' : group.icon}
                      size={18}
                      className={isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500'}
                    />
                    <Text className={`font-black uppercase tracking-tighter ml-2 mr-3 ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                      {group.label}
                    </Text>
                    <View className={`px-2 py-0.5 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800'
                      }`}>
                      <Text className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                        }`}>
                        {group.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            {totalRecipients > 0 && (
              <Text className="text-indigo-600 dark:text-indigo-400 font-black mt-4 uppercase tracking-widest text-xs">
                {totalRecipients} recipients selected
              </Text>
            )}
          </View>

          {/* Message Section */}
          <View className="mb-8">
            <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-6">Message Content</Text>
            <View className="bg-white dark:bg-slate-900 rounded-[32px] p-2 border border-slate-100 dark:border-slate-800 shadow-sm">
              <TextInput
                className="p-5 font-black text-slate-900 dark:text-slate-100 border-b border-slate-50 dark:border-slate-800/50"
                placeholder="Subject / Title"
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                className="p-5 font-bold text-slate-600 dark:text-slate-300 min-h-[160px]"
                placeholder="Type your message here..."
                placeholderTextColor="#94a3b8"
                value={message}
                onChangeText={setMessage}
                multiline
                textAlignVertical="top"
              />
              <View className="flex-row justify-between items-center px-5 pb-4">
                <TouchableOpacity className="flex-row items-center gap-2">
                  <Icon name="paperclip" size={20} className="text-indigo-600" />
                  <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Attach File</Text>
                </TouchableOpacity>
                <Text className={`text-[10px] font-black uppercase tracking-widest ${message.length > 450 ? 'text-rose-500' : 'text-slate-300 dark:text-slate-600'
                  }`}>
                  {message.length}/500
                </Text>
              </View>
            </View>
          </View>

          {/* Delivery Channels */}
          <View className="mb-10">
            <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-6">Delivery Channels</Text>
            <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              {[
                {
                  id: 'push',
                  label: 'Push Notification',
                  desc: 'Instant alert on mobile app',
                  icon: 'bell-ring',
                  val: sendPush,
                  setter: setSendPush,
                  color: 'text-indigo-600',
                  bg: 'bg-indigo-50 dark:bg-indigo-900/20'
                },
                {
                  id: 'sms',
                  label: 'SMS Gateway',
                  desc: 'Direct text to mobile number',
                  icon: 'message-text',
                  val: sendSMS,
                  setter: setSendSMS,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50 dark:bg-emerald-900/20'
                },
                {
                  id: 'email',
                  label: 'Official Email',
                  desc: 'Send to registered accounts',
                  icon: 'email',
                  val: sendEmail,
                  setter: setSendEmail,
                  color: 'text-rose-600',
                  bg: 'bg-rose-50 dark:bg-rose-900/20'
                },
              ].map((channel, idx) => (
                <View key={channel.id} className={`${idx !== 0 ? 'mt-6 pt-6 border-t border-slate-50 dark:border-slate-800/50' : ''}`}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${channel.bg}`}>
                        <Icon name={channel.icon} size={24} className={channel.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-black text-slate-900 dark:text-slate-100">{channel.label}</Text>
                        <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">{channel.desc}</Text>
                      </View>
                    </View>
                    <Switch
                      value={channel.val}
                      onValueChange={channel.setter}
                      trackColor={{ true: '#4f46e5', false: Platform.OS === 'android' ? '#e2e8f0' : '#f1f5f9' }}
                      thumbColor={Platform.OS === 'ios' ? '#ffffff' : (channel.val ? '#ffffff' : '#94a3b8')}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Send Broadcast Button */}
          <TouchableOpacity
            disabled={!isFormValid}
            className={`flex-row items-center justify-center py-5 rounded-[24px] gap-3 shadow-xl ${isFormValid
              ? 'bg-indigo-600 shadow-indigo-200 dark:shadow-none'
              : 'bg-slate-200 dark:bg-slate-800'
              }`}
          >
            <Icon name="send" size={20} color="white" className={!isFormValid ? 'opacity-20' : ''} />
            <Text className={`font-black uppercase tracking-widest ${isFormValid ? 'text-white' : 'text-slate-400 dark:text-slate-600'
              }`}>
              Send Broadcast to {totalRecipients}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default BroadcastMessageScreen;
