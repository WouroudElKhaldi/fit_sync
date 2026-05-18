import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ExerciseSelector'>;
};

interface PredefinedExercise {
  name: string;
  category: string;
  type: string;
}

const PREDEFINED_EXERCISES: PredefinedExercise[] = [
  // Chest
  { name: 'Bench Press', category: 'Chest', type: 'Barbell • Flat Chest' },
  { name: 'Incline DB Press', category: 'Chest', type: 'Dumbbell • Incline Chest' },
  { name: 'Dumbbell Bench', category: 'Chest', type: 'Dumbbell • Flat Chest' },
  { name: 'DB Flyes', category: 'Chest', type: 'Dumbbell • Chest Isolation' },
  
  // Shoulders
  { name: 'Overhead Press', category: 'Shoulders', type: 'Barbell • Shoulder Strength' },
  { name: 'Lateral Raises', category: 'Shoulders', type: 'Dumbbell • Side Delts' },
  { name: 'Face Pulls', category: 'Shoulders', type: 'Cable • Rear Delts' },
  { name: 'Seated OHP', category: 'Shoulders', type: 'Dumbbell • Shoulders' },

  // Back
  { name: 'Barbell Rows', category: 'Back', type: 'Barbell • Mid Back' },
  { name: 'Lat Pulldown', category: 'Back', type: 'Cable • Lats Width' },
  { name: 'Cable Rows', category: 'Back', type: 'Cable • Upper Back' },
  { name: 'Weighted Pull-ups', category: 'Back', type: 'Bodyweight • Lats/Upper Back' },

  // Arms
  { name: 'Tricep Pushdown', category: 'Arms', type: 'Cable • Triceps' },
  { name: 'Overhead Tricep Ext', category: 'Arms', type: 'Dumbbell/Cable • Triceps' },
  { name: 'Barbell Curl', category: 'Arms', type: 'Barbell • Biceps' },
  { name: 'Hammer Curls', category: 'Arms', type: 'Dumbbell • Biceps/Brachialis' },
  { name: 'Reverse Curls', category: 'Arms', type: 'Barbell • Forearms' },
  { name: 'EZ Bar Curl', category: 'Arms', type: 'EZ Bar • Biceps' },

  // Legs
  { name: 'Back Squat', category: 'Legs', type: 'Barbell • Quads/Glutes' },
  { name: 'Deadlift', category: 'Legs', type: 'Barbell • Posterior Chain' },
  { name: 'Romanian Deadlift', category: 'Legs', type: 'Barbell • Hamstrings/Glutes' },
  { name: 'Leg Press', category: 'Legs', type: 'Machine • Quads/Legs' },
  { name: 'Leg Curl', category: 'Legs', type: 'Machine • Hamstrings' },
  { name: 'Calf Raises', category: 'Legs', type: 'Calves • Calf Strength' },
  { name: 'Front Squat', category: 'Legs', type: 'Barbell • Quads Focus' },
  { name: 'Walking Lunges', category: 'Legs', type: 'Dumbbell • Glutes/Quads' },
  { name: 'Leg Extension', category: 'Legs', type: 'Machine • Quads' },
  { name: 'Hip Thrust', category: 'Legs', type: 'Barbell • Glutes' },
];

interface ExerciseItemProps {
  name: string;
  type: string;
  isSelected: boolean;
  onPress: () => void;
}

const ExerciseItem = React.memo(({ name, type, isSelected, onPress }: ExerciseItemProps) => {
  return (
    <TouchableOpacity 
      className="w-full flex-row items-center px-margin-mobile py-3 min-h-[64px] border-b border-white/5"
      style={{ backgroundColor: isSelected ? 'rgba(208, 188, 255, 0.1)' : 'transparent' }}
      onPress={onPress}
    >
      <View className="w-12 h-12 rounded-lg bg-surface-container-high shrink-0 overflow-hidden border border-white/10 mr-4 items-center justify-center">
        <MaterialIcons name="fitness-center" size={24} color="#cbc3d7" />
      </View>
      <View className="flex-1 justify-center">
        <Text className="text-body-base font-body-base font-bold text-on-background">{name}</Text>
        <Text className="text-label-caps font-label-caps text-on-surface-variant mt-1">{type}</Text>
      </View>
      <View 
        className="w-6 h-6 rounded-full flex items-center justify-center ml-4"
        style={{ 
          backgroundColor: isSelected ? '#d0bcff' : 'transparent',
          borderWidth: isSelected ? 0 : 1,
          borderColor: isSelected ? 'transparent' : 'rgba(255, 255, 255, 0.3)'
        }}
      >
        {isSelected && <MaterialIcons name="check" size={16} color="#3c0091" />}
      </View>
    </TouchableOpacity>
  );
});

export default function ExerciseSelectorScreen({ navigation }: Props) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['All']);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFilter = (filter: string) => {
    if (filter === 'All') {
      setSelectedFilters(['All']);
    } else {
      const newFilters = selectedFilters.filter(f => f !== 'All');
      if (newFilters.includes(filter)) {
        if (newFilters.length === 1) {
          setSelectedFilters(['All']);
        } else {
          setSelectedFilters(newFilters.filter(f => f !== filter));
        }
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

  // Filtering Logic
  const filteredExercises = PREDEFINED_EXERCISES.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.type.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesCategory = selectedFilters.includes('All') || 
                            selectedFilters.includes(ex.category);
                            
    return matchesSearch && matchesCategory;
  });

  // Group by Categories
  const categoriesPresent = Array.from(new Set(filteredExercises.map(ex => ex.category)));

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
            <View className="absolute left-4 z-10">
              <MaterialIcons name="search" size={24} color="#958ea0" />
            </View>
            <TextInput 
              className="w-full h-full bg-surface-container rounded-lg pl-12 pr-4 text-body-base font-body-base text-on-background border border-white/20"
              placeholder="Search exercises, muscles..."
              placeholderTextColor="#958ea0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-margin-mobile pb-2 gap-2 flex-row">
          {['All', 'Chest', 'Legs', 'Back', 'Shoulders', 'Arms'].map(filter => {
            const isChipSelected = selectedFilters.includes(filter);
            return (
              <TouchableOpacity 
                key={filter}
                onPress={() => toggleFilter(filter)}
                className="h-10 px-6 rounded-full flex items-center justify-center mr-2"
                style={{ 
                  backgroundColor: isChipSelected ? '#d0bcff' : '#16202e',
                  borderWidth: isChipSelected ? 0 : 1,
                  borderColor: isChipSelected ? 'transparent' : 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <Text 
                  className="font-bold"
                  style={{ color: isChipSelected ? '#3c0091' : '#cbc3d7' }}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 130 }}>
        {categoriesPresent.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <MaterialIcons name="search-off" size={48} color="#958ea0" />
            <Text className="text-on-surface-variant font-bold mt-4">No exercises match search criteria</Text>
          </View>
        ) : (
          categoriesPresent.map(category => (
            <View key={category} className="mt-4">
              <View className="px-margin-mobile py-2 bg-surface-container/20 border-b border-white/5">
                <Text className="text-label-caps font-label-caps text-outline uppercase tracking-widest font-black text-primary">{category}</Text>
              </View>
                {filteredExercises
                  .filter(ex => ex.category === category)
                  .map(ex => (
                    <ExerciseItem 
                      key={ex.name} 
                      name={ex.name} 
                      type={ex.type} 
                      isSelected={selectedExercises.includes(ex.name)}
                      onPress={() => toggleExercise(ex.name)}
                    />
                  ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Action Bar */}
      {selectedExercises.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 z-50 p-margin-mobile pb-8 bg-gradient-to-t from-background to-transparent">
          <View className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-row items-center justify-between border border-white/15">
            <Text className="text-body-base font-body-base font-bold text-on-background">{selectedExercises.length} Selected</Text>
            <TouchableOpacity 
              className="h-14 px-8 rounded-2xl bg-[#8B5CF6] items-center justify-center shadow-lg"
              onPress={() => {
                navigation.navigate({
                  name: 'WorkoutBuilder' as any,
                  params: { addedExerciseNames: selectedExercises },
                  merge: true
                } as any);
              }}
            >
              <Text className="text-white font-bold text-lg">Add to Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
