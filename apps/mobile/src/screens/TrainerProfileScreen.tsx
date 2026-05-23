import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TrainerProfile'>;
  route: RouteProp<RootStackParamList, 'TrainerProfile'>;
};

export default function TrainerProfileScreen({ navigation, route }: Props) {
  const { trainerId } = (route.params as any) || {};
  const [profile, setProfile] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function loadProfile() {
      if (!trainerId) return;
      try {
        const data = await apiService.get(`/trainer-profiles/${trainerId}`);
        setProfile(data);
      } catch (err) {
        console.error('Failed to load trainer profile', err);
      }
    }
    loadProfile();
  }, [trainerId]);

  const handleHire = async () => {
    if (!user) return;
    try {
      await apiService.post(`/users/${user.id}/assign-trainer`, { trainerId });
      Alert.alert('Success', 'You are now assigned to this trainer!');
      navigation.navigate('MainTabs' as any);
    } catch (err) {
      console.error('Failed to hire trainer', err);
      Alert.alert('Error', 'Failed to assign trainer.');
    }
  };
  return (
    <View className="flex-1 bg-background pt-12">
      {/* Top App Bar */}
      <View className="w-full bg-surface/80 border-b border-white/10 z-50 px-margin-mobile py-4 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#d0bcff" />
        </TouchableOpacity>
        <Text className="font-headline-md text-headline-md font-black tracking-tighter text-primary">FITSYNC PRO</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings' as any)}>
          <MaterialIcons name="settings" size={24} color="#d0bcff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-6" contentContainerStyle={{ gap: 24, paddingBottom: 110 }}>
        {/* Profile Header */}
        <View className="rounded-xl overflow-hidden bg-white/10 border border-white/15">
          <View className="h-48 w-full bg-surface-container relative">
            <View className="absolute inset-0 bg-black/60" />
          </View>
          <View className="-mt-16 px-6 pb-6 flex-col items-center">
            <View className="w-32 h-32 rounded-full border-4 border-[#1F2937] bg-surface-container items-center justify-center overflow-hidden mb-4">
              <MaterialIcons name="person" size={64} color="#cbc3d7" />
            </View>
            <View className="items-center mb-4">
              <Text className="text-display-lg font-display-lg text-white font-bold text-center">
                {profile?.user?.fullName || 'Trainer'}
              </Text>
              <View className="flex-row items-center gap-2 mt-2">
                <MaterialIcons name="star" size={20} color="#d0bcff" />
                <Text className="text-primary font-body-lg text-body-lg">{profile?.rating || '0'} ({profile?.reviewCount || 0} Reviews)</Text>
              </View>
            </View>
            <View className="flex-row gap-4">
              <View className="items-center px-4 py-2 bg-white/10 rounded-lg border border-white/15">
                <Text className="text-[20px] font-bold text-white">8+</Text>
                <Text className="text-[12px] font-bold text-on-surface-variant uppercase mt-1">Years Exp</Text>
              </View>
              <View className="items-center px-4 py-2 bg-white/10 rounded-lg border border-white/15">
                <Text className="text-[20px] font-bold text-white">50</Text>
                <Text className="text-[12px] font-bold text-on-surface-variant uppercase mt-1">Clients</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bio */}
        <View className="bg-white/10 p-6 rounded-xl border border-white/15">
          <View className="flex-row items-center gap-2 mb-4">
            <MaterialIcons name="person" size={24} color="#d0bcff" />
            <Text className="text-headline-md font-headline-md text-white font-bold">Bio</Text>
          </View>
          <Text className="text-secondary font-body-base text-body-base leading-relaxed">
            {profile?.bio || 'Elite Coach.'}
          </Text>
        </View>

        {/* Education & Certifications */}
        <View className="bg-white/10 p-6 rounded-xl border border-white/15">
          <View className="flex-row items-center gap-2 mb-4">
            <MaterialIcons name="school" size={24} color="#d0bcff" />
            <Text className="text-headline-md font-headline-md text-white font-bold">Education</Text>
          </View>
          <View className="flex-col gap-4">
            <View className="flex-row gap-3 items-start">
              <View className="w-8 h-8 rounded-full bg-surface-container border border-white/10 items-center justify-center mt-1">
                <View className="w-2 h-2 bg-primary rounded-full" />
              </View>
              <View>
                <Text className="text-white font-body-base font-bold">{profile?.education || 'Degree in Kinesiology'}</Text>
                <Text className="text-secondary text-sm">University of Sports Science</Text>
              </View>
            </View>
          </View>
        </View>

        {profile?.certifications && profile.certifications.length > 0 && (
          <View className="bg-white/10 p-6 rounded-xl border border-white/15">
            <View className="flex-row items-center gap-2 mb-4">
              <MaterialIcons name="workspace-premium" size={24} color="#d0bcff" />
              <Text className="text-headline-md font-headline-md text-white font-bold">Certifications</Text>
            </View>
            <View className="flex-col gap-2">
              {profile.certifications.map((cert: string, idx: number) => (
                <Text key={idx} className="text-secondary text-body-base">- {cert}</Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      <View className="absolute bottom-0 left-0 w-full p-4 bg-surface/90 border-t border-white/10">
        <TouchableOpacity 
          onPress={handleHire}
          className="w-full h-14 bg-primary text-on-primary rounded-xl flex-row items-center justify-center gap-2"
        >
          <MaterialIcons name="handshake" size={24} color="#3c0091" />
          <Text className="text-headline-md font-headline-md font-bold text-on-primary">Request to Hire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
