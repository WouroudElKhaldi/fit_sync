import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { api } from '../../mocks/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function HomeScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<any>(null);
  const [todaysPlan, setTodaysPlan] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const userProfile = await api.getUserProfile();
      setProfile(userProfile);
      
      const schedules = await api.getWorkoutSchedule();
      if (schedules.length > 0) {
        setTodaysPlan(schedules[0]);
      }
    }
    loadData();
  }, []);

  return (
    <View className="flex-1 bg-background pt-12 pb-32">
      {/* Mobile Top Header */}
      <View className="px-margin-mobile pt-4 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-on-surface-variant text-label-caps font-label-caps uppercase tracking-wider mb-1">
            Good Morning
          </Text>
          <Text className="text-headline-md font-headline-md text-on-surface font-bold">
            Welcome back, {profile?.name?.split(' ')[0] || 'Athlete'}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity 
            className="w-12 h-12 rounded-full bg-surface-container-high items-center justify-center border border-white/10"
            onPress={() => navigation.navigate('Settings')}
          >
            <MaterialIcons name="settings" size={24} color="#d9e3f6" />
          </TouchableOpacity>
          <TouchableOpacity className="w-12 h-12 rounded-full bg-surface-container-high items-center justify-center border border-white/10">
            <MaterialIcons name="notifications" size={24} color="#d9e3f6" />
            <View className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full shadow-lg" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, gap: 24, paddingBottom: 40 }}>
        
        {/* Horizontal Calendar Ribbon */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mx-5 px-5" contentContainerStyle={{ gap: 16, paddingRight: 40 }}>
          {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day, i) => {
            const isActive = day === 'TUE';
            return (
              <TouchableOpacity key={day} className={`items-center justify-center min-w-[64px] h-[80px] rounded-xl border ${isActive ? 'bg-primary/20 border-primary/50' : 'bg-surface-container/40 border-white/5'} backdrop-blur-md`}>
                <Text className={`text-label-caps font-label-caps mb-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>{day}</Text>
                <Text className={`text-numeric-data font-numeric-data font-bold ${isActive ? 'text-primary' : 'text-on-surface'}`}>{12 + i}</Text>
                {day === 'WED' && <View className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-tertiary/50" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Today's Plan Card */}
        <View className="bg-surface-container/30 border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <View className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <View className="flex-row items-center gap-2 mb-2">
                <MaterialIcons name="local-fire-department" size={16} color="#ffb869" />
                <Text className="text-label-caps font-label-caps text-tertiary uppercase tracking-wider">
                  Today's Plan
                </Text>
              </View>
              <Text className="text-display-lg font-display-lg text-on-surface leading-tight font-black">
                {todaysPlan?.name || 'Pull Day'}
              </Text>
              <Text className="text-on-surface-variant text-body-base font-body-base mt-1">
                {todaysPlan?.description || 'Back & Biceps Focus'}
              </Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-surface-container-high items-center justify-center border border-white/5">
              <MaterialIcons name="fitness-center" size={24} color="#d0bcff" />
            </View>
          </View>

          <View className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-surface-container/50 rounded-lg p-3 border border-white/5 items-center">
              <Text className="text-numeric-data font-numeric-data text-on-surface font-bold">
                {todaysPlan?.exercises?.length || 6}
              </Text>
              <Text className="text-[10px] uppercase text-on-surface-variant tracking-wider font-bold">Exercises</Text>
            </View>
            <View className="flex-1 bg-surface-container/50 rounded-lg p-3 border border-white/5 items-center">
              <Text className="text-numeric-data font-numeric-data text-on-surface font-bold">
                {todaysPlan?.estimatedDuration || 45}
              </Text>
              <Text className="text-[10px] uppercase text-on-surface-variant tracking-wider font-bold">Minutes</Text>
            </View>
            <View className="flex-1 bg-surface-container/50 rounded-lg p-3 border border-white/5 items-center">
              <Text className="text-numeric-data font-numeric-data text-on-surface font-bold">
                {todaysPlan?.difficulty || 'Hi'}
              </Text>
              <Text className="text-[10px] uppercase text-on-surface-variant tracking-wider font-bold">Intensity</Text>
            </View>
          </View>

          <TouchableOpacity 
            className="w-full h-14 bg-primary rounded-xl flex-row items-center justify-center gap-2 border-t border-white/20"
            onPress={() => {
              if (todaysPlan) {
                navigation.navigate('WorkoutLogger', { planId: todaysPlan.id });
              }
            }}
          >
            <MaterialIcons name="play-arrow" size={24} color="#3c0091" />
            <Text className="text-on-primary font-headline-md text-[18px] font-bold">Start Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Bento Grid: Stats & Prompts */}
        <View className="flex-row gap-4">
          <View className="flex-1 bg-surface-container/30 border border-white/10 rounded-xl p-5 aspect-square justify-between overflow-hidden relative">
            <View className="absolute -bottom-10 -right-10 w-32 h-32 bg-tertiary/20 rounded-full blur-2xl" />
            <View className="w-10 h-10 rounded-full items-center justify-center mb-4" style={{ backgroundColor: '#B06B00' }}>
              <MaterialIcons name="emoji-events" size={20} color="white" />
            </View>
            <View>
              <Text className="text-numeric-data font-numeric-data text-on-surface font-bold">New PR!</Text>
              <Text className="text-label-caps font-label-caps text-on-surface-variant mt-1">Deadlift 315lbs</Text>
            </View>
          </View>

          <View className="flex-1 bg-surface-container/30 border border-white/10 rounded-xl p-5 aspect-square items-center justify-center">
            <View className="relative w-24 h-24 mb-2 items-center justify-center">
              {/* Fake progress ring */}
              <View className="w-20 h-20 rounded-full border-[8px] border-white/10 absolute" />
              <View className="w-20 h-20 rounded-full border-[8px] border-primary absolute" style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent', transform: [{ rotate: '45deg' }] }} />
              <Text className="text-numeric-data font-numeric-data text-on-surface font-bold">75%</Text>
            </View>
            <Text className="text-label-caps font-label-caps text-on-surface-variant text-center">Weekly Goal</Text>
          </View>
        </View>

        {/* Find a Coach Prompt */}
        <TouchableOpacity className="bg-surface-container-high/50 border border-white/5 rounded-xl p-6 flex-row items-center gap-4">
          <View className="w-16 h-16 rounded-lg bg-surface items-center justify-center border border-white/10">
            <MaterialIcons name="sports" size={32} color="#ffb869" />
          </View>
          <View className="flex-1">
            <Text className="text-body-lg font-body-lg text-on-surface font-bold mb-1">Stalled Progress?</Text>
            <Text className="text-body-base font-body-base text-on-surface-variant text-sm">
              Find an elite coach in the market to push your limits.
            </Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-surface border border-white/10 items-center justify-center">
            <MaterialIcons name="arrow-forward" size={20} color="#d9e3f6" />
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
