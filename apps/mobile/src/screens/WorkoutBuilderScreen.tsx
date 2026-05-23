import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WorkoutBuilder'>;
  route: RouteProp<RootStackParamList, 'WorkoutBuilder'>;
};

interface ExerciseState {
  id: string;
  name: string;
  sets: {
    id: string;
    reps: string;
    weight: string;
    rest: string;
  }[];
}

export default function WorkoutBuilderScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { defaultDate, planId } = route.params || {};
  const [selectedDate, setSelectedDate] = useState(defaultDate ? new Date(defaultDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const formatTime = (date: Date) => {
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  };

  const formattedDateString = `${DAYS_OF_WEEK[selectedDate.getDay()]}, ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()} | ${formatTime(selectedDate)}`;

  const [workoutName, setWorkoutName] = useState('New Workout');
  const [exercises, setExercises] = useState<ExerciseState[]>([]);

  // Load existing plan if editing
  useEffect(() => {
    async function loadPlanForEdit() {
      if (!planId) return;
      try {
        setLoading(true);
        const plan = await apiService.get(`/workouts/plans/${planId}`);
        setWorkoutName(plan.title || '');
        if (plan.scheduledDate) {
          setSelectedDate(new Date(plan.scheduledDate));
        }
        if (plan.exercises) {
          const loadedExs = plan.exercises.map((ex: any, exIdx: number) => ({
            id: ex.exercise?.id || ex.exerciseId,
            name: ex.exercise?.name || 'Exercise',
            sets: (ex.sets || []).map((s: any, sIdx: number) => ({
              id: s.id || `s-${Date.now()}-${exIdx}-${sIdx}`,
              reps: (s.expectedReps ?? 10).toString(),
              weight: (s.expectedWeight ?? 0).toString(),
              rest: '2:00',
            }))
          }));
          setExercises(loadedExs);
        }
      } catch (err) {
        console.error('Failed to load plan for editing:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlanForEdit();
  }, [planId]);

  // Reactive Navigation Param Listener to process selected exercises
  useEffect(() => {
    if ((route.params as any)?.addedExercises && (route.params as any).addedExercises.length > 0) {
      const newExercises = (route.params as any).addedExercises;
      setExercises(prev => {
        const newlyAdded = newExercises.map((ex: any, idx: number) => ({
          id: ex.id,
          name: ex.name,
          sets: [
            { id: `s-${Date.now()}-${idx}-1`, reps: '10', weight: '135', rest: '2:00' }
          ]
        }));
        // filter out any exercises already in the list
        const filteredNew = newlyAdded.filter((n: any) => !prev.some(p => p.id === n.id));
        return [...prev, ...filteredNew];
      });

      // Clear params to avoid double adding
      navigation.setParams({ addedExercises: undefined } as any);
    }
  }, [(route.params as any)?.addedExercises]);

  const handleAddSet = (exerciseId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        const nextIndex = ex.sets.length + 1;
        return {
          ...ex,
          sets: [
            ...ex.sets,
            { id: `s-${Date.now()}-${nextIndex}`, reps: '10', weight: '135', rest: '2:00' }
          ]
        };
      }
      return ex;
    }));
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight' | 'rest', value: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
        };
      }
      return ex;
    }));
  };

  const handleUpdateExerciseName = (exerciseId: string, name: string) => {
    setExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, name } : ex));
  };

  const handleAddExercise = () => {
    navigation.navigate('ExerciseSelector');
  };

  const handleSaveWorkout = async () => {
    if (!user) return;
    const newPlan = {
      title: workoutName || 'Custom Workout',
      description: 'Dynamically created custom workout session.',
      scheduledDate: selectedDate.toISOString(),
      isRecurring: false,
      clientId: user.role === 'USER' ? user.id : undefined,
      trainerId: user.role === 'TRAINER' ? user.id : undefined,
      exercises: exercises.map((ex, exIdx) => ({
        exerciseId: ex.id,
        orderIndex: exIdx + 1,
        restTimeSec: 90,
        notes: '',
        sets: ex.sets.map((set, setIdx) => ({
          setIndex: setIdx + 1,
          expectedReps: parseInt(set.reps) || 10,
          expectedWeight: parseFloat(set.weight) || 0,
        }))
      }))
    };

    try {
      let saved;
      if (planId) {
        saved = await apiService.patch(`/workouts/plans/${planId}`, newPlan);
      } else {
        saved = await apiService.post('/workouts/plans', newPlan);
      }

      const targetPlanId = planId || saved.id;
      navigation.reset({
        index: 1,
        routes: [
          { name: 'MainTabs' },
          { name: 'WorkoutDetails', params: { planId: targetPlanId } }
        ]
      });
    } catch (err) {
      console.error('Failed to save workout', err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#d0bcff" />
        <Text className="text-on-surface-variant mt-3 font-body-base">Loading workout details…</Text>
      </View>
    );
  }

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
            onPress={handleSaveWorkout}
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
          <TouchableOpacity 
            className="flex-row items-center gap-2 self-start px-3 py-1.5 rounded-lg bg-surface-container-high/50 border border-white/5"
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={18} color="#d0bcff" />
            <Text className="text-primary font-body-base font-bold">{formattedDateString}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) {
                  const updatedDate = new Date(selectedDate);
                  updatedDate.setFullYear(date.getFullYear());
                  updatedDate.setMonth(date.getMonth());
                  updatedDate.setDate(date.getDate());
                  setSelectedDate(updatedDate);
                  if (Platform.OS !== 'ios') setShowTimePicker(true);
                }
              }}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="time"
              display="default"
              onChange={(event, date) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (date) {
                  const updatedDate = new Date(selectedDate);
                  updatedDate.setHours(date.getHours());
                  updatedDate.setMinutes(date.getMinutes());
                  setSelectedDate(updatedDate);
                }
              }}
            />
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-4" contentContainerStyle={{ paddingBottom: 140 }}>
        {exercises.map((ex, exIdx) => (
          <View key={ex.id} className="bg-surface-container/60 border border-white/15 rounded-3xl p-6 shadow-lg mb-6">
            <View className="flex-row items-center justify-between mb-8">
              <View className="flex-1 flex-row items-center gap-3 pr-4">
                <MaterialIcons name="drag-indicator" size={24} color="#494454" />
                <TextInput
                  className="flex-1 font-headline-md text-headline-md text-on-background p-0"
                  value={ex.name}
                  onChangeText={(val) => handleUpdateExerciseName(ex.id, val)}
                  placeholder="Exercise Name"
                  placeholderTextColor="#cbc3d7"
                />
              </View>
              <TouchableOpacity 
                onPress={() => setExercises(prev => prev.filter(item => item.id !== ex.id))}
                className="w-8 h-8 items-center justify-center rounded-full bg-white/5 border border-white/10"
              >
                <MaterialIcons name="delete" size={18} color="#ffb4ab" />
              </TouchableOpacity>
            </View>
            
            <View className="flex-row mb-4 px-2 pl-12 gap-4">
              <Text className="flex-1 text-center font-label-caps text-label-caps text-on-surface-variant">Sets</Text>
              <Text className="flex-[2] text-center font-label-caps text-label-caps text-on-surface-variant font-bold">Reps</Text>
              <Text className="flex-[2] text-center font-label-caps text-label-caps text-on-surface-variant font-bold">Lbs / Kg</Text>
              <Text className="flex-[2] text-center font-label-caps text-label-caps text-on-surface-variant font-bold">Rest</Text>
            </View>

            {ex.sets.map((set, setIdx) => (
              <View key={set.id} className="flex-row items-center gap-4 mb-4">
                <View className="w-8 h-8 rounded-full bg-surface-variant items-center justify-center">
                  <Text className="font-numeric-data text-[14px] text-on-surface-variant">{setIdx + 1}</Text>
                </View>
                <TextInput 
                  className="flex-[2] h-touch-target-min bg-surface-container-lowest border border-white/10 rounded-xl text-center font-numeric-data text-numeric-data text-on-background py-1" 
                  value={set.reps}
                  onChangeText={(val) => handleUpdateSet(ex.id, set.id, 'reps', val)}
                  keyboardType="numeric" 
                  placeholder="0"
                />
                <TextInput 
                  className="flex-[2] h-touch-target-min bg-surface-container-lowest border border-white/10 rounded-xl text-center font-numeric-data text-numeric-data text-on-background py-1" 
                  value={set.weight}
                  onChangeText={(val) => handleUpdateSet(ex.id, set.id, 'weight', val)}
                  keyboardType="numeric" 
                  placeholder="0"
                />
                <TextInput 
                  className="flex-[2] h-touch-target-min bg-surface-container-lowest border border-white/10 rounded-xl text-center font-numeric-data text-numeric-data text-on-background py-1" 
                  value={set.rest}
                  onChangeText={(val) => handleUpdateSet(ex.id, set.id, 'rest', val)}
                  placeholder="1:30"
                />
              </View>
            ))}

            <TouchableOpacity 
              onPress={() => handleAddSet(ex.id)}
              className="w-full h-touch-target-min items-center justify-center flex-row gap-2 rounded-2xl border border-dashed border-primary/30 mt-4 py-2"
            >
              <MaterialIcons name="add" size={20} color="#d0bcff" />
              <Text className="font-body-lg text-body-lg text-primary">Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 w-full px-margin-mobile pb-8 pt-4 bg-background/90 border-t border-white/5">
        <TouchableOpacity 
          onPress={handleAddExercise}
          className="w-full h-[56px] bg-primary rounded-[16px] flex-row items-center justify-center gap-3"
        >
          <MaterialIcons name="add" size={24} color="#3c0091" />
          <Text className="font-headline-md text-[20px] text-on-primary font-bold">Add Exercise</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
