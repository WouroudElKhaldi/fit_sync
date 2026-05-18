import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { ConfirmModal } from '../components/ui/Modal';
import { api } from '../../mocks/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WorkoutLogger'>;
  route: RouteProp<RootStackParamList, 'WorkoutLogger'>;
};

export default function WorkoutLoggerScreen({ navigation, route }: Props) {
  const { planId } = route.params || {};
  const [workout, setWorkout] = useState<any>(null);
  const [setsData, setSetsData] = useState<{ [setId: string]: { reps: string; weight: string; completed: boolean } }>({});
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadWorkout() {
      const schedules = await api.getWorkoutSchedule();
      const selected = schedules.find((s: any) => s.id === planId) || schedules[0];
      setWorkout(selected);

      if (selected && selected.exercises) {
        const initialData: any = {};
        selected.exercises.forEach((ex: any) => {
          ex.sets.forEach((set: any) => {
            initialData[set.id] = {
              reps: set.expectedReps?.toString() || '',
              weight: set.expectedWeight?.toString() || '',
              completed: set.status === 'COMPLETED',
            };
          });
        });
        setSetsData(initialData);
      }
    }
    loadWorkout();
  }, [planId]);

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
            <Text className="text-on-surface-variant text-label-caps uppercase">{workout?.title || 'Active Workout'}</Text>
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

      <ScrollView className="flex-1 px-margin-mobile pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {workout?.exercises && workout.exercises.length > 0 ? (
          workout.exercises.map((ex: any, exIdx: number) => (
            <View key={ex.id} className="bg-surface-container/30 border border-white/10 rounded-xl overflow-hidden mb-6">
              <View className="p-4 flex-row justify-between items-center border-b border-white/10 bg-surface-container/50">
                <View className="flex-1 pr-4">
                  <Text className="text-tertiary text-label-caps font-bold">
                    EXERCISE {exIdx + 1}/{workout.exercises.length}
                  </Text>
                  <Text className="text-on-surface text-headline-md font-bold mt-1">
                    {ex.exercise?.name || 'Exercise'}
                  </Text>
                  {ex.notes && (
                    <Text className="text-on-surface-variant text-xs mt-1 italic">
                      Note: {ex.notes}
                    </Text>
                  )}
                </View>
                <TouchableOpacity>
                  <MaterialIcons name="more-vert" size={24} color="#d9e3f6" />
                </TouchableOpacity>
              </View>

              {/* Sets Header */}
              <View className="flex-row p-4 border-b border-white/10 bg-white/[0.02]">
                <Text className="text-on-surface-variant flex-[0.5] font-bold text-xs uppercase">Set</Text>
                <Text className="text-on-surface-variant flex-1 text-center font-bold text-xs uppercase">Target</Text>
                <Text className="text-on-surface-variant flex-1 text-center font-bold text-xs uppercase">Weight (kg)</Text>
                <Text className="text-on-surface-variant flex-1 text-center font-bold text-xs uppercase">Reps</Text>
                <Text className="text-on-surface-variant flex-[0.5] text-right font-bold text-xs uppercase">Log</Text>
              </View>

              {/* Set Rows */}
              {ex.sets?.map((set: any) => {
                const isCompleted = setsData[set.id]?.completed;
                return (
                  <View 
                    key={set.id} 
                    className={`flex-row p-4 border-b border-white/5 items-center transition-colors duration-150 ${isCompleted ? 'bg-primary/5' : ''}`}
                  >
                    <Text className={`text-on-surface flex-[0.5] font-bold ${isCompleted ? 'text-primary' : ''}`}>
                      {set.setIndex}
                    </Text>
                    <Text className="text-on-surface-variant flex-1 text-center text-xs">
                      {set.expectedWeight}kg x {set.expectedReps}
                    </Text>
                    <View className="flex-1 px-2">
                      <TextInput 
                        className={`bg-surface-container rounded-lg text-center text-on-surface py-2 border border-white/10 focus:border-primary ${isCompleted ? 'border-primary/40' : ''}`}
                        keyboardType="numeric"
                        value={setsData[set.id]?.weight}
                        onChangeText={(val) => {
                          setSetsData(prev => ({
                            ...prev,
                            [set.id]: { ...prev[set.id], weight: val }
                          }));
                        }}
                        placeholder="0"
                        placeholderTextColor="#958ea0"
                        editable={!isCompleted}
                      />
                    </View>
                    <View className="flex-1 px-2">
                      <TextInput 
                        className={`bg-surface-container rounded-lg text-center text-on-surface py-2 border border-white/10 focus:border-primary ${isCompleted ? 'border-primary/40' : ''}`}
                        keyboardType="numeric"
                        value={setsData[set.id]?.reps}
                        onChangeText={(val) => {
                          setSetsData(prev => ({
                            ...prev,
                            [set.id]: { ...prev[set.id], reps: val }
                          }));
                        }}
                        placeholder="0"
                        placeholderTextColor="#958ea0"
                        editable={!isCompleted}
                      />
                    </View>
                    <View className="flex-[0.5] items-end">
                      <TouchableOpacity 
                        onPress={async () => {
                          const currentSet = setsData[set.id];
                          const completed = !currentSet?.completed;
                          
                          setSetsData(prev => ({
                            ...prev,
                            [set.id]: { ...prev[set.id], completed }
                          }));

                          if (completed) {
                            const repsNum = parseInt(currentSet.reps) || set.expectedReps;
                            const weightNum = parseFloat(currentSet.weight) || set.expectedWeight;
                            await api.logSetCompletion(set.id, repsNum, weightNum);
                          }
                        }}
                        className={`w-8 h-8 rounded border items-center justify-center transition-all ${isCompleted ? 'bg-primary border-primary' : 'bg-surface-container border-white/10'}`}
                      >
                        <MaterialIcons 
                          name="check" 
                          size={16} 
                          color={isCompleted ? '#3c0091' : '#958ea0'} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        ) : (
          <View className="bg-surface-container/20 border border-white/5 rounded-xl p-8 flex-col items-center justify-center min-h-[300px]">
            <MaterialIcons name="fitness-center" size={48} color="#cbc3d7" className="mb-4" />
            <Text className="text-[18px] font-bold text-on-surface text-center mb-2">No Exercises Scheduled</Text>
            <Text className="text-on-surface-variant text-sm text-center mb-6 max-w-[260px]">
              This plan is a placeholder or rest routine. Ready to log a quick freestyle set instead?
            </Text>
            <TouchableOpacity 
              className="px-6 h-12 bg-primary rounded-xl items-center justify-center"
              onPress={() => {
                const mockPlan = {
                  ...workout,
                  exercises: [
                    {
                      id: "we-freestyle",
                      workoutPlanId: "freestyle",
                      exerciseId: "e-freestyle",
                      orderIndex: 1,
                      restTimeSec: 90,
                      notes: "Freestyle session",
                      exercise: { id: "e-freestyle", name: "Freestyle Push-Ups" },
                      sets: [
                        { id: "ws-free-1", setIndex: 1, expectedReps: 15, expectedWeight: 0 },
                        { id: "ws-free-2", setIndex: 2, expectedReps: 15, expectedWeight: 0 }
                      ]
                    }
                  ]
                };
                setWorkout(mockPlan);
                setSetsData({
                  "ws-free-1": { reps: "15", weight: "0", completed: false },
                  "ws-free-2": { reps: "15", weight: "0", completed: false }
                });
              }}
            >
              <Text className="text-on-primary font-bold">Add Custom Exercise</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <ConfirmModal 
        visible={showFinishModal}
        title="Finish Workout?"
        message="Are you sure you want to finish and save this workout? Uncompleted sets will be marked as skipped."
        onConfirm={() => {
          setShowFinishModal(false);
          navigation.navigate('PostWorkoutSummary' as any);
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
