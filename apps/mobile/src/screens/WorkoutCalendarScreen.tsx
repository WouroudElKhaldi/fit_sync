import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function WorkoutCalendarScreen({ navigation }: Props) {
  const [currentMonth, setCurrentMonth] = useState('October 2023');

  return (
    <View className="flex-1 bg-background">
      {/* Top App Bar */}
      <View className="w-full bg-surface/80 border-b border-white/10 pt-12">
        <View className="flex-row items-center justify-between px-margin-mobile py-4">
          <View className="w-8 h-8 rounded-full border border-white/20 bg-surface-container" />
          <Text className="font-headline-md text-headline-md tracking-tighter text-primary">
            CALENDAR
          </Text>
          <TouchableOpacity className="w-8 h-8 items-center justify-center">
            <MaterialIcons name="settings" size={24} color="#cbc3d7" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-stack-lg pb-stack-lg" contentContainerStyle={{ gap: 24, paddingBottom: 40 }}>
        {/* Calendar Section */}
        <View className="flex flex-col gap-stack-md">
          <View className="flex-row justify-between items-center px-2">
            <TouchableOpacity><MaterialIcons name="chevron-left" size={24} color="#cbc3d7" /></TouchableOpacity>
            <Text className="font-headline-md text-headline-md text-on-surface">{currentMonth}</Text>
            <TouchableOpacity><MaterialIcons name="chevron-right" size={24} color="#cbc3d7" /></TouchableOpacity>
          </View>
          
          <View className="bg-white/10 rounded-xl p-stack-sm border border-white/10">
            <View className="flex-row justify-between mb-2">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <Text key={i} className="flex-1 text-center font-label-caps text-label-caps text-on-surface-variant">{d}</Text>
              ))}
            </View>
            <View className="flex-row flex-wrap">
              {Array.from({ length: 21 }).map((_, i) => (
                <View key={i} className="w-[14.28%] h-10 items-center justify-center relative">
                  {i === 12 ? (
                    <View className="w-8 h-8 rounded-full bg-surface-container-highest items-center justify-center border-2 border-primary shadow-lg">
                      <Text className="font-bold text-primary">{i + 1}</Text>
                    </View>
                  ) : (
                    <Text className="text-on-surface-variant">{i + 1}</Text>
                  )}
                  {i === 11 && <View className="w-1.5 h-1.5 rounded-full bg-primary absolute bottom-1" />}
                </View>
              ))}
            </View>
          </View>

          <View className="flex-row items-center justify-center gap-4 mt-2">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-primary" />
              <Text className="font-label-caps text-label-caps text-on-surface-variant">Personal</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-tertiary" />
              <Text className="font-label-caps text-label-caps text-on-surface-variant">Trainer Assigned</Text>
            </View>
          </View>
        </View>

        {/* Today's Agenda */}
        <View className="flex flex-col gap-stack-md">
          <Text className="font-headline-md text-headline-md text-on-surface">Today's Agenda</Text>
          
          {/* Card 1 */}
          <View className="bg-white/10 rounded-xl p-5 flex flex-col gap-4 overflow-hidden border border-white/10">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="font-numeric-data text-numeric-data text-on-surface mb-1">Hypertrophy Pull Day</Text>
                <View className="flex-row items-center gap-1 px-2 py-1 rounded bg-tertiary/10 border border-tertiary/50 self-start">
                  <MaterialIcons name="person-outline" size={14} color="#ffb869" />
                  <Text className="font-label-caps text-[10px] text-tertiary">Assigned by Marcus Vance</Text>
                </View>
              </View>
              <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center border border-white/10">
                <MaterialIcons name="fitness-center" size={24} color="#ffb869" />
              </View>
            </View>
            <View className="flex-row items-center justify-between border-t border-white/10 pt-4">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="check-circle" size={20} color="#d0bcff" />
                <Text className="text-primary font-bold">Completed</Text>
              </View>
            </View>
          </View>

          {/* Card 2 */}
          <View className="bg-white/10 rounded-xl p-5 flex flex-col gap-4 overflow-hidden border border-white/10">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="font-numeric-data text-numeric-data text-on-surface mb-1">Power Session</Text>
                <View className="flex-row items-center gap-1 px-2 py-1 rounded bg-primary/10 border border-primary/50 self-start">
                  <MaterialIcons name="assignment" size={14} color="#d0bcff" />
                  <Text className="font-label-caps text-[10px] text-primary">Personal Plan</Text>
                </View>
              </View>
              <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center border border-white/10">
                <MaterialIcons name="bolt" size={24} color="#d0bcff" />
              </View>
            </View>
            <View className="flex-row items-center justify-between border-t border-white/10 pt-4">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="schedule" size={20} color="#cbc3d7" />
                <Text className="text-on-surface-variant font-bold">Upcoming: 5:00 PM</Text>
              </View>
              <TouchableOpacity 
                className="bg-primary/20 border border-primary/30 px-4 py-2 rounded-lg"
                // Interactive link
                onPress={() => navigation.navigate('WorkoutBuilder')}
              >
                <Text className="text-primary font-bold">Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 w-14 h-14 bg-inverse-primary rounded-xl items-center justify-center shadow-lg border-t border-white/30"
        onPress={() => navigation.navigate('WorkoutBuilder')}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
