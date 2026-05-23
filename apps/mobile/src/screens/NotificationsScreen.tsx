import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Notifications'>;
};

export default function NotificationsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors, isDark } = useAppTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        if (!user) return;
        const res = await apiService.get(`/notifications/${user.id}`);
        setNotifications(res || []);

        // Mark all as read when viewing
        await apiService.post(`/notifications/${user.id}/read-all`);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, [user]);

  return (
    <View className="flex-1 bg-background pt-12">
      {/* Header */}
      <View className="flex-row items-center justify-between px-margin-mobile py-4 border-b border-white/10 bg-surface/80">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center rounded-full bg-surface-container border border-white/10"
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-headline-sm font-headline-sm text-on-surface font-bold">Notifications</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-4" contentContainerStyle={{ paddingBottom: 40, gap: 12 }}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} className="mt-10" />
        ) : notifications.length === 0 ? (
          <View className="bg-surface-container/20 border border-white/5 rounded-xl p-8 flex-col items-center justify-center mt-10">
            <MaterialIcons name="notifications-off" size={48} color={colors.textMuted} className="mb-4" />
            <Text className="text-[18px] font-bold text-on-surface text-center mb-2">You're all caught up!</Text>
            <Text className="text-on-surface-variant text-sm text-center">
              There are no new notifications at the moment.
            </Text>
          </View>
        ) : (
          notifications.map((notif: any, index: number) => (
            <TouchableOpacity 
              key={notif.id || index}
              className="bg-surface-container/40 border border-white/5 rounded-xl p-4 flex-row items-start gap-4"
            >
              <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                <MaterialIcons name="notifications" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-body-lg font-bold text-on-surface mb-1">{notif.title || 'Notification'}</Text>
                <Text className="text-body-base text-on-surface-variant">{notif.message}</Text>
                {notif.createdAt && (
                  <Text className="text-[10px] text-on-surface-variant/70 mt-2">
                    {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}
                  </Text>
                )}
              </View>
              {!notif.isRead && (
                <View className="w-2 h-2 bg-primary rounded-full mt-2" />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
