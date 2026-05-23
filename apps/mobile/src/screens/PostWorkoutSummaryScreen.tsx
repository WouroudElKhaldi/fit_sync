import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

import { apiService } from '../services/api';
import { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PostWorkoutSummary'>;
  route: RouteProp<RootStackParamList, 'PostWorkoutSummary'>;
};

export default function PostWorkoutSummaryScreen({ navigation, route }: Props) {
  const { sessionId } = (route.params as any) || {};
  const [session, setSession] = React.useState<any>(null);

  React.useEffect(() => {
    async function loadSession() {
      if (!sessionId) return;
      try {
        const data = await apiService.get(`/workouts/sessions/${sessionId}`);
        setSession(data);
      } catch (err) {
        console.error('Failed to load session summary', err);
      }
    }
    loadSession();
  }, [sessionId]);
  return (
    <View className="flex-1 bg-background pt-12">
      {/* Top App Bar */}
      <View className="w-full bg-surface/80 border-b border-white/10 z-50 px-margin-mobile py-4 flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center">
             <MaterialIcons name="person" size={20} color="#d0bcff" />
          </View>
        </View>
        <Text className="font-headline-md text-headline-md font-black tracking-tighter text-primary">FITSYNC PRO</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings' as any)}>
          <MaterialIcons name="settings" size={24} color="#d0bcff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-6" contentContainerStyle={{ gap: 24, paddingBottom: 96 }}>
        {/* Header Section */}
        <View className="items-center py-8">
          <Text className="text-label-caps font-label-caps text-primary mb-2 uppercase">Workout Complete</Text>
          <Text className="text-display-lg font-display-lg text-on-surface">{session?.workoutPlan?.title || 'Custom Session'}</Text>
        </View>

        <View className="flex-col gap-6">
          {/* Total Volume */}
          <View className="bg-white/10 border border-white/15 rounded-xl p-6 flex-col items-center justify-center min-h-[200px] relative overflow-hidden">
            <View className="absolute inset-0 bg-primary/5 rounded-full" />
            <Text className="text-label-caps font-label-caps text-on-surface-variant mb-4 uppercase">Total Volume Lifted</Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-[48px] font-black text-primary font-display-xl">
                {session?.totalVolume || 0}
              </Text>
              <Text className="text-headline-md font-headline-md text-on-surface-variant">kg</Text>
            </View>
          </View>

          {/* PR Badges */}
          <View className="bg-white/10 border border-white/15 rounded-xl p-6 flex-col gap-4">
            <Text className="text-label-caps font-label-caps text-on-surface-variant uppercase">Achievements</Text>
            <View className="flex-col gap-3">
              {[
                { name: 'Squat', pr: '140kg x 5' },
                { name: 'Leg Press', pr: '320kg x 10' }
              ].map((item, idx) => (
                <View key={idx} className="bg-tertiary rounded-lg p-3 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <MaterialIcons name="workspace-premium" size={24} color="white" />
                    <View>
                      <Text className="text-body-base font-body-base font-bold text-white">{item.name}</Text>
                      <Text className="text-label-caps font-label-caps text-white/80">{item.pr}</Text>
                    </View>
                  </View>
                  <View className="bg-white/20 px-2 py-1 rounded">
                    <Text className="text-label-caps font-label-caps text-white font-bold">NEW PR!</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Struggles & Notes */}
          <View className="bg-white/10 border border-white/15 rounded-xl p-6 flex-col gap-4">
            <Text className="text-label-caps font-label-caps text-on-surface-variant uppercase">Struggles & Notes</Text>
            <TextInput
              className="w-full bg-surface-container-low/50 border border-white/20 rounded-lg p-4 text-body-base font-body-base text-on-surface min-h-[120px]"
              multiline
              placeholder="Felt strong on squats today..."
              placeholderTextColor="#cbc3d7"
              textAlignVertical="top"
            />
          </View>

          {/* Done Button */}
          <TouchableOpacity 
            className="w-full h-14 bg-primary rounded-2xl items-center justify-center flex-row gap-2"
            onPress={async () => {
              // Optionally submit the notes to the backend here if needed
              navigation.navigate('MainTabs' as any);
            }}
          >
            <Text className="text-headline-md font-headline-md font-bold text-on-primary">Done</Text>
            <MaterialIcons name="check-circle" size={24} color="#3c0091" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
