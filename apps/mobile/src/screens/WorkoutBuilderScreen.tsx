import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WorkoutBuilder'>;
};

export default function WorkoutBuilderScreen({ navigation }: Props) {
  const [workoutName, setWorkoutName] = useState('My Custom Leg Day');
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      {/* Header */}
      <View className="px-margin-mobile pt-12 pb-6 border-b border-transparent bg-background/85">
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center bg-surface-container rounded-full"
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="close" size={24} color="#d9e3f6" />
          </TouchableOpacity>
          <TouchableOpacity 
            className="w-12 h-12 bg-primary items-center justify-center rounded-full"
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="check" size={24} color="#3c0091" />
          </TouchableOpacity>
        </View>
        
        <View className="flex flex-col gap-3">
          <TextInput
            className="w-full bg-transparent border-none font-display-lg text-display-lg text-on-background p-0 tracking-tighter"
            placeholder="Name your workout"
            placeholderTextColor="#474744"
            value={workoutName}
            onChangeText={setWorkoutName}
          />
          <TouchableOpacity className="flex-row items-center gap-2 self-start px-3 py-1.5 rounded-lg bg-surface-container-high/50 border border-white/5">
            <MaterialIcons name="calendar-today" size={18} color="#d0bcff" />
            <Text className="text-primary font-body-base">Monday, Oct 12 | 6:00 PM</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-4" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Exercise Card 1 */}
        <View className="bg-surface-container/60 border border-white/15 rounded-3xl p-6 shadow-lg mb-6">
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="drag-indicator" size={24} color="#494454" />
              <Text className="font-headline-md text-headline-md text-on-background">Barbell Squat</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full">
              <MaterialIcons name="more-vert" size={24} color="#cbc3d7" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row mb-4 px-2 pl-12 gap-4">
            <Text className="flex-1 text-center font-label-caps text-label-caps text-on-surface-variant">Reps</Text>
            <Text className="flex-1 text-center font-label-caps text-label-caps text-on-surface-variant">Lbs</Text>
            <Text className="flex-1 text-center font-label-caps text-label-caps text-on-surface-variant">Rest</Text>
          </View>

          {[1, 2].map((set) => (
            <View key={set} className="flex-row items-center gap-4 mb-4">
              <View className="w-8 h-8 rounded-full bg-surface-variant items-center justify-center">
                <Text className="font-numeric-data text-[14px] text-on-surface-variant">{set}</Text>
              </View>
              <TextInput className="flex-1 h-touch-target-min bg-surface-container-lowest border border-white/10 rounded-xl text-center font-numeric-data text-numeric-data text-on-background" defaultValue="10" keyboardType="numeric" />
              <TextInput className="flex-1 h-touch-target-min bg-surface-container-lowest border border-white/10 rounded-xl text-center font-numeric-data text-numeric-data text-on-background" defaultValue="225" keyboardType="numeric" />
              <TextInput className="flex-1 h-touch-target-min bg-surface-container-lowest border border-white/10 rounded-xl text-center font-numeric-data text-numeric-data text-on-background" defaultValue="2:00" />
            </View>
          ))}

          <TouchableOpacity className="w-full h-touch-target-min items-center justify-center flex-row gap-2 rounded-2xl border border-dashed border-primary/30 mt-4">
            <MaterialIcons name="add" size={20} color="#d0bcff" />
            <Text className="font-body-lg text-body-lg text-primary">Add Set</Text>
          </TouchableOpacity>
        </View>

        {/* Exercise Card 2 (Collapsed) */}
        <View className="bg-surface-container/40 border border-white/10 rounded-3xl p-6 shadow-lg flex-row items-center justify-between opacity-80 mb-6">
          <View className="flex-row items-center gap-4">
            <MaterialIcons name="drag-indicator" size={24} color="#494454" />
            <View>
              <Text className="font-headline-md text-[20px] text-on-background mb-1">Leg Press</Text>
              <Text className="font-body-base text-[14px] text-on-surface-variant">3 Sets • Targeting 10-12 Reps</Text>
            </View>
          </View>
          <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full">
            <MaterialIcons name="expand-more" size={24} color="#cbc3d7" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 w-full px-margin-mobile pb-8 pt-4 bg-background/90 border-t border-white/5">
        <TouchableOpacity className="w-full h-[56px] bg-primary rounded-[16px] flex-row items-center justify-center gap-3">
          <MaterialIcons name="add" size={24} color="#3c0091" />
          <Text className="font-headline-md text-[20px] text-on-primary font-bold">Add Exercise</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
