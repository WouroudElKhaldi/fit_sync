import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ActiveChat'>;
  route: RouteProp<RootStackParamList, 'ActiveChat'>;
};

export default function ActiveChatScreen({ navigation, route }: Props) {
  const { conversationId, isGroup, title } = (route.params as any) || {};
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const loadMessages = async () => {
    if (!user || !conversationId) return;
    try {
      let data;
      if (isGroup) {
        data = await apiService.get(`/messages/conversation/${user.id}/group/${conversationId}`);
      } else {
        data = await apiService.get(`/messages/conversation/${user.id}?with=${conversationId}`);
      }
      setMessages(data || []);
      // Auto-scroll after a short delay
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    loadMessages();
    
    // In a real app, you'd use websockets or polling here
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [user, conversationId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !conversationId) return;
    try {
      await apiService.post(`/messages/send/${user.id}`, {
        receiverId: isGroup ? undefined : conversationId,
        groupId: isGroup ? conversationId : undefined,
        content: message
      });
      setMessage('');
      loadMessages();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      {/* Top App Bar */}
      <View className="w-full bg-surface/80 border-b border-white/10 pt-12 z-50">
        <View className="flex-row items-center justify-between px-margin-mobile py-4">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color="#d0bcff" />
            </TouchableOpacity>
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-surface-container-high border border-white/10 overflow-hidden">
                <View className="w-full h-full bg-surface-container items-center justify-center">
                  <MaterialIcons name="person" size={24} color="#cbc3d7" />
                </View>
              </View>
              <View>
                <Text className="font-headline-md text-[18px] text-primary tracking-tighter font-bold">{title || 'Chat'}</Text>
                <Text className="font-label-caps text-label-caps text-tertiary uppercase">{isGroup ? 'Group Chat' : 'Trainer'}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity>
            <MaterialIcons name="more-vert" size={24} color="#d0bcff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-margin-mobile" 
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24, gap: 16 }}
      >
        {messages.map((msg: any, idx: number) => {
          const isMine = msg.senderId === user?.id;
          return (
            <View key={idx} className={`flex-row gap-3 max-w-[85%] ${isMine ? 'self-end' : 'self-start'}`}>
              {!isMine && (
                <View className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 mt-1 items-center justify-center">
                   <MaterialIcons name="person" size={20} color="#cbc3d7" />
                </View>
              )}
              <View className={`flex-col gap-1 ${isMine ? 'items-end' : ''}`}>
                <View className={`${isMine ? 'bg-primary rounded-2xl rounded-tr-sm' : 'bg-surface-container-high rounded-2xl rounded-tl-sm border border-white/5'} px-4 py-3`}>
                  <Text className={`text-body-base ${isMine ? 'text-on-primary' : 'text-on-surface'}`}>
                    {msg.content}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className={`text-[10px] text-on-surface-variant ${isMine ? 'mr-1' : 'ml-1'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {isMine && <MaterialIcons name="done-all" size={14} color="#d0bcff" />}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Area */}
      <View className="bg-surface-container-highest/90 border-t border-white/10 px-margin-mobile py-4 pb-8 flex-row items-center gap-3">
        <TouchableOpacity>
          <MaterialIcons name="add-circle-outline" size={28} color="#958ea0" />
        </TouchableOpacity>
        <View className="flex-1 relative justify-center">
          <TextInput 
            className="w-full h-12 bg-surface text-on-surface border border-white/20 rounded-full pl-4 pr-12 font-body-base"
            placeholder="Message Marcus..."
            placeholderTextColor="#494454"
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity 
            className="absolute right-2 w-8 h-8 bg-primary rounded-full items-center justify-center"
            onPress={handleSendMessage}
          >
            <MaterialIcons name="send" size={16} color="#3c0091" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
