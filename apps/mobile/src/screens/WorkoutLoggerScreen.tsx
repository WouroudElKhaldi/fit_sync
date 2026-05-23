import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { ConfirmModal } from '../components/ui/Modal';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { AppHeader } from '../components/ui/AppHeader';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WorkoutLogger'>;
  route: RouteProp<RootStackParamList, 'WorkoutLogger'>;
};

export default function WorkoutLoggerScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { colors, isDark } = useAppTheme();
  const { planId, templateId } = (route.params as any) || {};
  const [workout, setWorkout] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
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
      try {
        let session;
        try {
          session = await apiService.get(`/workouts/sessions/by-plan/${planId}`);
        } catch (err: any) {
          if (err.status === 404 || err.message?.includes('Not Found')) {
            session = await apiService.post('/workouts/sessions/start', { workoutPlanId: planId });
          } else {
            throw err;
          }
        }
        
        setSessionId(session.id);
        const plan = session.workoutPlan || session; // fallback in case structure varies
        setWorkout(plan);

        if (plan && plan.exercises) {
          const initialData: any = {};
          plan.exercises.forEach((ex: any) => {
            ex.sets.forEach((set: any) => {
              const isCompleted = set.status === 'COMPLETED';
              initialData[set.id] = {
                reps: isCompleted && set.actualReps !== null && set.actualReps !== undefined
                  ? set.actualReps.toString()
                  : (set.expectedReps?.toString() || ''),
                weight: isCompleted && set.actualWeight !== null && set.actualWeight !== undefined
                  ? set.actualWeight.toString()
                  : (set.expectedWeight?.toString() || ''),
                completed: isCompleted,
              };
            });
          });
          setSetsData(initialData);
        }
      } catch (err) {
        console.error('Failed to load or start workout session', err);
      }
    }
    if (planId) {
      loadWorkout();
    }
  }, [planId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <AppHeader />

      {/* Session Status Bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.surfaceContainer, borderBottomWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity 
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
            onPress={() => setShowCancelModal(true)}
          >
            <MaterialIcons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: colors.textMuted }}>{workout?.title || 'Active Workout'}</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>⏱ {formatTime(timer)}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
          onPress={() => setShowFinishModal(true)}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: 14 }}>Finish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {workout?.exercises && workout.exercises.length > 0 ? (
          workout.exercises.map((ex: any, exIdx: number) => (
            <View key={ex.id} style={{ backgroundColor: colors.surfaceContainer, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: 24 }}>
              {/* Exercise Header */}
              <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceContainerHigh }}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', color: colors.primary }}>
                    EXERCISE {exIdx + 1}/{workout.exercises.length}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 4 }}>
                    {ex.exercise?.name || 'Exercise'}
                  </Text>
                  {ex.notes && (
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2, fontStyle: 'italic' }}>
                      Note: {ex.notes}
                    </Text>
                  )}
                </View>
                <TouchableOpacity>
                  <MaterialIcons name="more-vert" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Sets Header */}
              <View style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.background + '22' }}>
                <Text style={{ flex: 0.5, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: colors.textMuted }}>Set</Text>
                <Text style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: colors.textMuted }}>Target</Text>
                <Text style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: colors.textMuted }}>Weight (kg)</Text>
                <Text style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: colors.textMuted }}>Reps</Text>
                <Text style={{ flex: 0.5, textAlign: 'right', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: colors.textMuted }}>Log</Text>
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
                        editable={true}
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
                        editable={true}
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
                            await apiService.patch(`/workouts/sessions/set/${set.id}`, {
                              actualReps: repsNum,
                              actualWeight: weightNum,
                              status: 'COMPLETED'
                            });
                          } else {
                            await apiService.patch(`/workouts/sessions/set/${set.id}`, {
                              status: 'PENDING'
                            });
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
                navigation.navigate('ExerciseSelector');
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
        onConfirm={async () => {
          setShowFinishModal(false);
          // Persist all completed sets' values to database/API
          for (const setId of Object.keys(setsData)) {
            const data = setsData[setId];
            if (data.completed) {
              const repsNum = parseInt(data.reps) || 0;
              const weightNum = parseFloat(data.weight) || 0;
              await apiService.patch(`/workouts/sessions/set/${setId}`, {
                actualReps: repsNum,
                actualWeight: weightNum,
                status: 'COMPLETED'
              });
            }
          }
          if (sessionId) {
            await apiService.post(`/workouts/sessions/${sessionId}/complete`, {});
          }
          navigation.navigate('PostWorkoutSummary' as any, { sessionId });
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
    </KeyboardAvoidingView>
  );
}
