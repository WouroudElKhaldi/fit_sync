import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { api } from '../../mocks/api';

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
  const { defaultDate } = route.params || {};
  const selectedDate = defaultDate ? new Date(defaultDate) : new Date('2026-05-19'); // stable mock fallback
  
  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDateString = `${DAYS_OF_WEEK[selectedDate.getDay()]}, ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()} | 9:00 AM`;

  const [workoutName, setWorkoutName] = useState('My Custom Leg Day');
  const [exercises, setExercises] = useState<ExerciseState[]>([
    {
      id: 'ex-sq-1',
      name: 'Back Squat',
      sets: [
        { id: 's-sq-1', reps: '10', weight: '225', rest: '2:00' },
        { id: 's-sq-2', reps: '10', weight: '225', rest: '2:00' }
      ]
    }
  ]);

  // Reactive Navigation Param Listener to process selected exercises
  useEffect(() => {
    if (route.params?.addedExerciseNames && route.params.addedExerciseNames.length > 0) {
      const newNames = route.params.addedExerciseNames;
      setExercises(prev => {
        const newlyAdded = newNames.map((name, idx) => ({
          id: `ex-${Date.now()}-${idx}`,
          name: name,
          sets: [
            { id: `s-${Date.now()}-${idx}-1`, reps: '10', weight: '135', rest: '2:00' }
          ]
        }));
        return [...prev, ...newlyAdded];
      });

      // Clear params to avoid double adding
      navigation.setParams({ addedExerciseNames: undefined });
    }
  }, [route.params?.addedExerciseNames]);

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
    const newPlan = {
      id: `wp-custom-${Date.now()}`,
      title: workoutName || 'Custom Workout',
      description: 'Dynamically created custom workout session.',
      scheduledDate: selectedDate.toISOString(),
      isRecurring: false,
      createdById: 't-2001',
      clientId: 'u-1001',
      createdAt: new Date().toISOString(),
      exercises: exercises.map((ex, exIdx) => ({
        id: `we-custom-${exIdx}-${Date.now()}`,
        workoutPlanId: `wp-custom-${Date.now()}`,
        exerciseId: `e-custom-${exIdx}`,
        orderIndex: exIdx + 1,
        restTimeSec: 90,
        notes: '',
        exercise: {
          id: `e-custom-${exIdx}`,
          name: ex.name
        },
        sets: ex.sets.map((set, setIdx) => ({
          id: `ws-custom-${exIdx}-${setIdx}-${Date.now()}`,
          setIndex: setIdx + 1,
          expectedReps: parseInt(set.reps) || 10,
          expectedWeight: parseFloat(set.weight) || 0,
          actualReps: null,
          actualWeight: null,
          status: 'PENDING'
        }))
      }))
    };

    await api.addWorkoutPlan(newPlan);
    navigation.goBack();
  };

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
          <TouchableOpacity className="flex-row items-center gap-2 self-start px-3 py-1.5 rounded-lg bg-surface-container-high/50 border border-white/5">
            <MaterialIcons name="calendar-today" size={18} color="#d0bcff" />
            <Text className="text-primary font-body-base font-bold">{formattedDateString}</Text>
          </TouchableOpacity>
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
