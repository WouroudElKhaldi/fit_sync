import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { AppHeader } from '../components/ui/AppHeader';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function ChatInboxScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInbox() {
      if (!user) return;
      try {
        setLoading(true);
        // Fetch candidates (connected users) and active conversations
        const [candidates, activeConvs] = await Promise.all([
          apiService.get(`/messages/candidates/${user.id}`),
          apiService.get(`/messages/conversations/${user.id}`)
        ]);
        
        // Merge them. Show all candidates, and use activeConvs for last message info
        const convMap = new Map();
        
        (candidates || []).forEach((c: any) => {
          convMap.set(c.id, {
            ...c,
            isGroup: false,
            otherUser: c,
            lastMessage: 'No messages yet',
            lastMessageTime: '',
            unreadCount: 0,
          });
        });

        (activeConvs || []).forEach((conv: any) => {
          const key = conv.isGroup ? conv.id : conv.id;
          if (convMap.has(key)) {
            // update existing
            const existing = convMap.get(key);
            existing.lastMessage = conv.lastMessage;
            existing.lastMessageTime = conv.lastMessageTime;
            existing.unreadCount = conv.unreadCount;
          } else {
            convMap.set(key, conv);
          }
        });

        // Convert back to array
        setConversations(Array.from(convMap.values()));
      } catch (err) {
        console.error('Failed to load inbox data', err);
      } finally {
        setLoading(false);
      }
    }
    loadInbox();
  }, [user]);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader />

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ gap: 24, paddingBottom: 96, paddingTop: 24 }}>
        {/* Header Section */}
        <View className="flex-row justify-between items-end">
          <View>
            <Text className="text-display-lg font-display-lg text-on-surface">Messages</Text>
            <Text className="text-body-base font-body-base text-on-surface-variant mt-2">
              Connect with your trainers and community.
            </Text>
          </View>
          <TouchableOpacity className="w-12 h-12 rounded-full bg-surface-container-high border border-white/15 items-center justify-center shadow-lg">
            <MaterialIcons name="edit" size={24} color="#d0bcff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center w-full h-14 rounded-xl bg-white/5 border border-white/15 px-4">
          <MaterialIcons name="search" size={24} color="#cbc3d7" className="mr-3" />
          <TextInput 
            className="flex-1 text-body-base font-body-base text-on-surface pl-2"
            placeholder="Search conversations..."
            placeholderTextColor="#cbc3d7"
          />
        </View>

        {/* Active Trainers */}
        <View className="space-y-4">
          <Text className="text-label-caps font-label-caps text-on-surface-variant mb-4">ONLINE TRAINERS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {conversations.filter(c => c.role === 'TRAINER').length > 0 ? (
              conversations.filter(c => c.role === 'TRAINER').map((trainer: any, idx: number) => (
                <TouchableOpacity 
                  key={idx} 
                  className="items-center gap-2"
                  onPress={() => navigation.navigate('ActiveChat' as any, { 
                    conversationId: trainer.id,
                    isGroup: false,
                    title: trainer.fullName || trainer.name
                  })}
                >
                  <View className={`w-16 h-16 rounded-full border-2 ${trainer.isOnline ? 'border-primary' : 'border-transparent'} p-0.5 relative`}>
                    <View className="w-full h-full rounded-full bg-surface-container items-center justify-center overflow-hidden">
                      {trainer.avatar ? (
                        <Image source={{ uri: trainer.avatar }} className="w-full h-full" />
                      ) : (
                        <MaterialIcons name="person" size={28} color="#cbc3d7" />
                      )}
                    </View>
                    {trainer.isOnline && (
                      <View className="absolute bottom-0 right-0 w-4 h-4 bg-tertiary rounded-full border-2 border-[#1F2937]" />
                    )}
                  </View>
                  <Text className="text-label-caps font-label-caps text-on-surface">
                    {trainer.fullName ? trainer.fullName.split(' ')[0] : trainer.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-body-base font-body-base text-on-surface-variant">No trainers connected yet.</Text>
            )}
          </ScrollView>
        </View>

        {/* Chat List */}
        <View className="space-y-4">
          <Text className="text-label-caps font-label-caps text-on-surface-variant mb-2 mt-4">RECENT CONVERSATIONS</Text>
          
          {conversations.map((conv: any, idx: number) => {
            const isGroup = conv.isGroup;
            const title = isGroup ? conv.group?.name : conv.otherUser?.fullName;
            const lastMessage = conv.lastMessage;
            
            return (
              <TouchableOpacity 
                key={idx}
                className="w-full rounded-xl bg-white/10 border border-white/15 p-4 flex-row items-center gap-4 mb-2"
                onPress={() => navigation.navigate('ActiveChat' as any, { 
                  conversationId: isGroup ? conv.group.id : conv.otherUser.id,
                  isGroup,
                  title
                })}
              >
                <View className="w-14 h-14 rounded-full bg-surface-container items-center justify-center">
                   <MaterialIcons name={isGroup ? 'group' : 'person'} size={28} color="#cbc3d7" />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-baseline mb-1">
                    <View className="flex-row items-center">
                      <Text className="text-body-base font-headline-md text-on-surface font-bold">{title}</Text>
                      {!isGroup && conv.otherUser?.role === 'TRAINER' && (
                        <View className="ml-2 bg-primary/10 px-2 py-0.5 rounded-sm">
                          <Text className="text-label-caps font-label-caps text-primary">TRAINER</Text>
                        </View>
                      )}
                    </View>
                    {lastMessage && (
                      <Text className="text-label-caps font-label-caps text-primary">
                        {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    )}
                  </View>
                  {lastMessage && (
                    <Text className="text-body-base font-body-base text-on-surface" numberOfLines={1}>
                      {lastMessage.content || 'Sent a workout plan'}
                    </Text>
                  )}
                </View>
                {conv.unreadCount > 0 && (
                  <View className="w-3 h-3 bg-primary rounded-full shadow-lg" />
                )}
              </TouchableOpacity>
            );
          })}
          
          {!loading && conversations.length === 0 && (
            <Text className="text-on-surface-variant text-center py-4">No recent conversations.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
