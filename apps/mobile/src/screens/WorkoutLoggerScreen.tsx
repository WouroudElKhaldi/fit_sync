import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { RouteProp } from '@react-navigation/native';
import { ConfirmModal } from '../components/ui/Modal';
import { api } from '../../mocks/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WorkoutLogger'>;
  route: RouteProp<RootStackParamList, 'WorkoutLogger'>;
};

export default function WorkoutLoggerScreen({ navigation, route }: Props) {
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row justify-between items-center px-margin-mobile py-4 border-b border-white/10 bg-surface/90 pt-12">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center rounded-full bg-surface-container border border-white/10"
            onPress={() => setShowCancelModal(true)}
          >
            <MaterialIcons name="close" size={24} color="#d9e3f6" />
          </TouchableOpacity>
          <View>
            <Text className="text-on-surface-variant text-label-caps uppercase">Pull Day</Text>
            <Text className="text-on-surface text-body-lg font-bold">{formatTime(timer)}</Text>
          </View>
        </View>
        <TouchableOpacity 
          className="bg-primary px-4 py-2 rounded-lg"
          onPress={() => setShowFinishModal(true)}
        >
          <Text className="text-on-primary font-bold">Finish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-4">
        {/* Exercise Card */}
        <View className="bg-surface-container/30 border border-white/10 rounded-xl overflow-hidden mb-4">
          <View className="p-4 flex-row justify-between items-center border-b border-white/10 bg-surface-container/50">
            <View>
              <Text className="text-tertiary text-label-caps font-bold">EXERCISE 1/6</Text>
              <Text className="text-on-surface text-headline-md font-bold mt-1">Deadlift</Text>
            </View>
            <TouchableOpacity>
              <MaterialIcons name="more-vert" size={24} color="#d9e3f6" />
            </TouchableOpacity>
          </View>

          {/* Sets Header */}
          <View className="flex-row p-4 border-b border-white/10">
            <Text className="text-on-surface-variant flex-[0.5] font-bold">SET</Text>
            <Text className="text-on-surface-variant flex-1 text-center font-bold">LBS</Text>
            <Text className="text-on-surface-variant flex-1 text-center font-bold">REPS</Text>
            <Text className="text-on-surface-variant flex-[0.5] text-right font-bold"><MaterialIcons name="check" size={16} /></Text>
          </View>

          {/* Set Row */}
          {[1, 2, 3].map((set) => (
            <View key={set} className="flex-row p-4 border-b border-white/5 items-center">
              <Text className="text-on-surface flex-[0.5] font-bold">{set}</Text>
              <View className="flex-1 px-2">
                <TextInput 
                  className="bg-surface-container rounded-lg text-center text-on-surface py-2 border border-white/10 focus:border-primary"
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#958ea0"
                />
              </View>
              <View className="flex-1 px-2">
                <TextInput 
                  className="bg-surface-container rounded-lg text-center text-on-surface py-2 border border-white/10 focus:border-primary"
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#958ea0"
                />
              </View>
              <View className="flex-[0.5] items-end">
                <TouchableOpacity className="w-8 h-8 rounded bg-surface-container border border-white/10 items-center justify-center">
                  <MaterialIcons name="check" size={16} color="#958ea0" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Add Set Button */}
          <TouchableOpacity className="p-4 flex-row items-center justify-center border-t border-white/10">
            <MaterialIcons name="add" size={20} color="#d0bcff" />
            <Text className="text-primary font-bold ml-2">Add Set</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Modals */}
      <ConfirmModal 
        visible={showFinishModal}
        title="Finish Workout?"
        message="Are you sure you want to finish and save this workout? Uncompleted sets will be marked as skipped."
        onConfirm={() => {
          setShowFinishModal(false);
          navigation.goBack();
        }}
        onCancel={() => setShowFinishModal(false)}
        confirmText="Save Workout"
      />

      <ConfirmModal 
        visible={showCancelModal}
        title="Cancel Workout?"
        message="Are you sure you want to cancel? All progress will be lost."
        onConfirm={() => {
          setShowCancelModal(false);
          navigation.goBack();
        }}
        onCancel={() => setShowCancelModal(false)}
        confirmText="Discard"
      />
    </View>
  );
}
