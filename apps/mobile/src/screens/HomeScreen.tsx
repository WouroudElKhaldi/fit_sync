import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { api } from '../../mocks/api';
import { useIsFocused } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function HomeScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 4, 19)); // May 19, 2026
  const isFocused = useIsFocused();

  async function loadData() {
    const userProfile = await api.getUserProfile();
    setProfile(userProfile);
    
    const allSchedules = await api.getWorkoutSchedule();
    setSchedules(allSchedules);
  }

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  // Helper to get this week's days (Monday to Sunday) containing May 19, 2026
  const getThisWeekDays = () => {
    const today = new Date(2026, 4, 19); // Baseline Today
    const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const thisWeekDays = getThisWeekDays();
  const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const isWorkoutDone = (plan: any) => {
    return plan.exercises?.some((ex: any) => 
      ex.sets?.some((s: any) => s.status === 'COMPLETED' || s.actualReps !== null)
    );
  };

  // Find all workouts for the selected date
  const dayPlans = schedules.filter((s: any) => {
    const sDate = new Date(s.scheduledDate);
    return sDate.getFullYear() === selectedDate.getFullYear() &&
           sDate.getMonth() === selectedDate.getMonth() &&
           sDate.getDate() === selectedDate.getDate();
  });

  return (
    <View className="flex-1 bg-background pt-12">
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

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, gap: 16, paddingBottom: 96 }}>
        
        {/* Week Selector Ribbon */}
        <View className="flex-row justify-between items-center px-1 mt-2">
          <Text className="text-on-surface font-bold text-[18px] tracking-tight">
            This Week
          </Text>
          <Text className="text-primary text-[14px] font-bold">
            May 2026
          </Text>
        </View>

        {/* Horizontal Week Ribbon */}
        <View className="flex-row justify-between gap-1 mt-1">
          {thisWeekDays.map((day) => {
            const isSelected = selectedDate.getFullYear() === day.getFullYear() &&
                               selectedDate.getMonth() === day.getMonth() &&
                               selectedDate.getDate() === day.getDate();
            
            const hasWorkout = schedules.some((s: any) => {
              const sDate = new Date(s.scheduledDate);
              return sDate.getFullYear() === day.getFullYear() &&
                     sDate.getMonth() === day.getMonth() &&
                     sDate.getDate() === day.getDate();
            });

            return (
              <TouchableOpacity 
                key={day.toISOString()} 
                onPress={() => setSelectedDate(day)}
                className={`flex-1 items-center justify-center h-[76px] rounded-xl border ${isSelected ? 'bg-primary/20 border-primary/50' : 'bg-surface-container/40 border-white/5'} backdrop-blur-md`}
              >
                <Text className={`text-[10px] font-bold tracking-wider mb-1 ${isSelected ? 'text-primary font-black' : 'text-on-surface-variant'}`}>
                  {DAY_NAMES[day.getDay()]}
                </Text>
                <Text className={`text-[18px] font-bold ${isSelected ? 'text-primary font-black' : 'text-on-surface'}`}>
                  {day.getDate()}
                </Text>
                {hasWorkout && (
                  <View className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-tertiary'}`} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Today's Plans List */}
        <View className="flex flex-col gap-4">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-on-surface-variant text-label-caps uppercase tracking-wider font-bold">
              Scheduled Workouts
            </Text>
            {dayPlans.length > 0 && (
              <Text className="text-primary text-[12px] font-bold">
                {dayPlans.length} Session{dayPlans.length > 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {dayPlans.length > 0 ? (
            dayPlans.map((plan: any) => (
              <View key={plan.id} className="bg-surface-container/30 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                <View className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <View className="flex-row justify-between items-start mb-6">
                  <View className="flex-1 pr-4">
                    <View className="flex-row items-center gap-2 mb-2">
                      <MaterialIcons name="local-fire-department" size={16} color="#ffb869" />
                      <Text className="text-label-caps font-label-caps text-tertiary uppercase tracking-wider">
                        Workout Plan
                      </Text>
                    </View>
                    <Text className="text-display-lg font-display-lg text-on-surface leading-tight font-black">
                      {plan.title || plan.name}
                    </Text>
                    <Text className="text-on-surface-variant text-body-base font-body-base mt-1">
                      {plan.description || 'Custom session'}
                    </Text>
                  </View>
                  <View className="w-12 h-12 rounded-full bg-surface-container-high items-center justify-center border border-white/5">
                    <MaterialIcons name="fitness-center" size={24} color="#d0bcff" />
                  </View>
                </View>

                <View className="flex-row gap-4 mb-8">
                  <View className="flex-1 bg-surface-container/50 rounded-lg p-3 border border-white/5 items-center">
                    <Text className="text-numeric-data font-numeric-data text-on-surface font-bold">
                      {plan.exercises?.length || 0}
                    </Text>
                    <Text className="text-[10px] uppercase text-on-surface-variant tracking-wider font-bold">Exercises</Text>
                  </View>
                  <View className="flex-1 bg-surface-container/50 rounded-lg p-3 border border-white/5 items-center">
                    <Text className="text-numeric-data font-numeric-data text-on-surface font-bold">
                      {plan.estimatedDuration || 45}
                    </Text>
                    <Text className="text-[10px] uppercase text-on-surface-variant tracking-wider font-bold">Minutes</Text>
                  </View>
                  <View className="flex-1 bg-surface-container/50 rounded-lg p-3 border border-white/5 items-center">
                    <Text className="text-numeric-data font-numeric-data text-on-surface font-bold">
                      {plan.difficulty || 'Med'}
                    </Text>
                    <Text className="text-[10px] uppercase text-on-surface-variant tracking-wider font-bold">Intensity</Text>
                  </View>
                </View>

                {(() => {
                  const isDone = isWorkoutDone(plan);
                  return (
                    <TouchableOpacity 
                      className={`w-full h-14 rounded-xl flex-row items-center justify-center gap-2 border-t border-white/20 ${isDone ? 'bg-secondary' : 'bg-primary'}`}
                      onPress={() => {
                        navigation.navigate('WorkoutLogger', { planId: plan.id });
                      }}
                    >
                      <MaterialIcons name={isDone ? "edit" : "play-arrow"} size={24} color={isDone ? "#30312e" : "#3c0091"} />
                      <Text className={`font-headline-md text-[18px] font-bold ${isDone ? 'text-on-secondary' : 'text-on-primary'}`}>
                        {isDone ? "Edit Workout" : "Start Workout"}
                      </Text>
                    </TouchableOpacity>
                  );
                })()}
              </View>
            ))
          ) : (
            <View className="bg-surface-container/20 border border-white/5 rounded-xl p-6 flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
              <View className="absolute top-0 right-0 w-48 h-48 bg-tertiary/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <View className="w-12 h-12 rounded-full bg-surface-container-high border border-white/10 items-center justify-center mb-4">
                <MaterialIcons name="spa" size={24} color="#cbc3d7" />
              </View>
              <Text className="text-[18px] font-bold text-on-surface text-center mb-1">Rest Day</Text>
              <Text className="text-on-surface-variant text-sm text-center mb-6 max-w-[280px]">
                No workouts scheduled for today. Rest and recover to let your muscles grow!
              </Text>
              <TouchableOpacity 
                className="px-6 h-10 bg-white/10 border border-white/15 rounded-full items-center justify-center"
                onPress={() => {
                  navigation.navigate('WorkoutBuilder', { defaultDate: selectedDate.toISOString() });
                }}
              >
                <Text className="text-white font-bold text-sm">Plan a Session</Text>
              </TouchableOpacity>
            </View>
          )}
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

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#d0bcff',
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          zIndex: 999
        }}
        onPress={() => {
          navigation.navigate('WorkoutBuilder', { defaultDate: selectedDate.toISOString() });
        }}
      >
        <MaterialIcons name="add" size={32} color="#3c0091" />
      </TouchableOpacity>
    </View>
  );
}
