import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '@/components/layout/Header';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const ChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { participantName, participantRole } = route.params || { participantName: 'Chat', participantRole: '' };

  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Good morning! I wanted to discuss about the upcoming parent-teacher meeting.', sender: 'other', timestamp: '9:00 AM', status: 'read' },
    { id: '2', text: 'Good morning! Sure, what details do you need?', sender: 'me', timestamp: '9:05 AM', status: 'read' },
    { id: '3', text: 'Can we schedule it for next Thursday? I need to discuss my child\'s progress in Mathematics.', sender: 'other', timestamp: '9:08 AM', status: 'read' },
    { id: '4', text: 'Thursday works perfectly. I have a slot available at 11 AM. Would that work for you?', sender: 'me', timestamp: '9:12 AM', status: 'read' },
    { id: '5', text: 'That would be great! Thank you for accommodating. Should I bring anything specific?', sender: 'other', timestamp: '9:15 AM', status: 'read' },
    { id: '6', text: 'Please bring the homework notebooks and any test papers you\'d like to discuss. I\'ll prepare the progress report.', sender: 'me', timestamp: '9:18 AM', status: 'delivered' },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return 'check';
      case 'delivered': return 'check-all';
      case 'read': return 'check-all';
      default: return 'clock-outline';
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    return (
      <View className={`mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
        <View className={`max-w-[80%] px-4 py-3 rounded-[24px] ${isMe
          ? 'bg-indigo-600 rounded-br-none'
          : 'bg-white dark:bg-slate-900 rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-800'
          }`}>
          <Text className={`text-sm leading-6 ${isMe ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
            {item.text}
          </Text>
          <View className="flex-row items-center justify-end mt-1">
            <Text className={`text-[10px] ${isMe ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
              {item.timestamp}
            </Text>
            {isMe && (
              <Icon
                name={getStatusIcon(item.status)}
                size={12}
                className={`ml-1 ${item.status === 'read' ? 'text-white' : 'text-white/50'}`}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header
        title={participantName}
        subtitle={participantRole}
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIcon="dots-vertical"
        onRightIconPress={() => { }}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 24, paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Bar */}
        <View className="bg-white dark:bg-slate-900 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex-row items-end shadow-lg">
          <TouchableOpacity className="w-10 h-10 items-center justify-center mr-2">
            <Icon name="plus-circle-outline" size={24} className="text-slate-400 dark:text-slate-500" />
          </TouchableOpacity>

          <View className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] px-5 py-2.5 border border-slate-100 dark:border-slate-700 max-h-[120px]">
            <TextInput
              className="text-sm text-slate-900 dark:text-slate-100 p-0"
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              placeholderTextColor="#94a3b8"
              multiline
            />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            disabled={!message.trim()}
            className={`ml-3 w-10 h-10 rounded-full items-center justify-center ${message.trim() ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'
              } active:scale-95 transition-all`}
          >
            <Icon
              name="send"
              size={18}
              color={message.trim() ? 'white' : '#94a3b8'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;
