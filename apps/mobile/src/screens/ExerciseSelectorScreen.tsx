import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WorkoutBuilder'>;
};

export default function ExerciseSelectorScreen({ navigation }: Props) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['All']);
  const [selectedExercises, setSelectedExercises] = useState<string[]>(['Incline Dumbbell Press', 'Barbell Squat']);

  const toggleFilter = (filter: string) => {
    if (filter === 'All') {
      setSelectedFilters(['All']);
    } else {
      const newFilters = selectedFilters.filter(f => f !== 'All');
      if (newFilters.includes(filter)) {
        setSelectedFilters(newFilters.filter(f => f !== filter));
      } else {
        setSelectedFilters([...newFilters, filter]);
      }
    }
  };

  const toggleExercise = (ex: string) => {
    if (selectedExercises.includes(ex)) {
      setSelectedExercises(selectedExercises.filter(e => e !== ex));
    } else {
      setSelectedExercises([...selectedExercises, ex]);
    }
  };

  const ExerciseItem = ({ name, type }: { name: string, type: string }) => {
    const isSelected = selectedExercises.includes(name);
    return (
      <TouchableOpacity 
        className={`w-full flex-row items-center px-margin-mobile py-3 min-h-[64px] border-b border-white/10 ${isSelected ? 'bg-primary/10' : ''}`}
        onPress={() => toggleExercise(name)}
      >
        <View className="w-12 h-12 rounded-lg bg-surface-container-high shrink-0 overflow-hidden border border-white/10 mr-4 items-center justify-center">
          <MaterialIcons name="fitness-center" size={24} color="#cbc3d7" />
        </View>
        <View className="flex-1 justify-center">
          <Text className="text-body-base font-body-base font-bold text-on-background">{name}</Text>
          <Text className="text-label-caps font-label-caps text-on-surface-variant mt-1">{type}</Text>
        </View>
        <View className={`w-6 h-6 rounded-full flex items-center justify-center ml-4 ${isSelected ? 'bg-primary shadow-lg' : 'border border-white/30'}`}>
          {isSelected && <MaterialIcons name="check" size={16} color="#3c0091" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Sticky Header */}
      <View className="bg-background pt-12 pb-2 border-b border-white/10 z-40">
        <View className="px-margin-mobile flex-row items-center justify-between h-12 mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="close" size={28} color="#d9e3f6" />
          </TouchableOpacity>
          <Text className="text-headline-md font-headline-md text-on-background absolute left-1/2 -translate-x-1/2 font-bold">
            Add Exercises
          </Text>
          <View className="w-12" />
        </View>

        <View className="px-margin-mobile mb-4">
          <View className="relative flex-row items-center h-12">
            <MaterialIcons name="search" size={24} color="#958ea0" className="absolute left-4 z-10" />
            <TextInput 
              className="w-full h-full bg-surface-container rounded-lg pl-12 pr-4 text-body-base font-body-base text-on-background border border-white/20"
              placeholder="Search exercises, muscles..."
              placeholderTextColor="#958ea0"
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-margin-mobile pb-2 gap-2 flex-row">
          {['All', 'Chest', 'Legs', 'Back', 'Dumbbell', 'Barbell'].map(filter => (
            <TouchableOpacity 
              key={filter}
              onPress={() => toggleFilter(filter)}
              className={`h-10 px-6 rounded-full flex items-center justify-center mr-2 ${selectedFilters.includes(filter) ? 'bg-primary shadow-lg' : 'bg-surface-container border border-white/10'}`}
            >
              <Text className={`${selectedFilters.includes(filter) ? 'text-on-primary' : 'text-on-surface-variant'} font-bold`}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* CHEST Section */}
        <View className="mt-6">
          <View className="px-margin-mobile py-2 sticky top-0 bg-background/90 border-b border-white/5">
            <Text className="text-label-caps font-label-caps text-outline uppercase tracking-widest font-bold">CHEST</Text>
          </View>
          <View>
            <ExerciseItem name="Incline Dumbbell Press" type="Dumbbell • Upper Chest" />
            <ExerciseItem name="Barbell Bench Press" type="Barbell • Middle Chest" />
            <ExerciseItem name="Cable Crossover" type="Cable • Inner Chest" />
          </View>
        </View>

        {/* LEGS Section */}
        <View className="mt-4">
          <View className="px-margin-mobile py-2 sticky top-0 bg-background/90 border-b border-white/5">
            <Text className="text-label-caps font-label-caps text-outline uppercase tracking-widest font-bold">LEGS</Text>
          </View>
          <View>
            <ExerciseItem name="Barbell Squat" type="Barbell • Quads/Glutes" />
            <ExerciseItem name="Leg Press" type="Machine • Quads" />
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 z-50 p-margin-mobile pb-8 bg-gradient-to-t from-background to-transparent">
        <View className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-row items-center justify-between border border-white/15">
          <Text className="text-body-base font-body-base font-bold text-on-background">{selectedExercises.length} Selected</Text>
          <TouchableOpacity 
            className="h-14 px-8 rounded-2xl bg-[#8B5CF6] items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-white font-bold text-lg">Add to Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
