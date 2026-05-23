import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiService } from '../services/api';
import { useAppTheme } from '../context/ThemeContext';
import { AppHeader } from '../components/ui/AppHeader';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function TrainerMarketplaceScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Trainers');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrainers();
  }, [searchQuery]);

  async function loadTrainers() {
    try {
      setLoading(true);
      const data = await apiService.get('/trainer-profiles' + (searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''));
      setTrainers(data || []);
    } catch (err) {
      console.error('Failed to load trainers', err);
    } finally {
      setLoading(false);
    }
  }

  // Local filtering for tags if they are not entirely covered by the search API
  const displayedTrainers = selectedFilter === 'All Trainers' 
    ? trainers 
    : trainers.filter(t => t.specialties?.includes(selectedFilter));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader />

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ gap: 24, paddingBottom: 96, paddingTop: 12 }}>
        {/* Search Bar */}
        <View className="flex-row items-center w-full h-14 rounded-xl bg-transparent border border-white/20 px-4">
          <MaterialIcons name="search" size={24} color="#958ea0" className="mr-3" />
          <TextInput 
            className="flex-1 text-body-base font-body-base text-on-surface"
            placeholder="Find your trainer..."
            placeholderTextColor="#958ea0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <MaterialIcons name="tune" size={24} color="#d0bcff" />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
          {['All Trainers', 'Powerlifting', 'Hypertrophy', 'Mobility', 'CrossFit'].map((filter, idx) => (
            <TouchableOpacity 
              key={idx}
              className={`h-10 px-4 rounded-full items-center justify-center mr-3 ${selectedFilter === filter ? 'bg-primary' : 'bg-surface-container border border-white/10'}`}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text className={`${selectedFilter === filter ? 'text-on-primary font-bold' : 'text-on-surface-variant'}`}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trainer Grid */}
        <View className="gap-6 flex-row flex-wrap justify-between">
          {displayedTrainers.map((trainer: any, idx: number) => (
            <TouchableOpacity 
              key={trainer.id || idx} 
              className="w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-4"
              onPress={() => navigation.navigate('TrainerProfile' as any, { trainerId: trainer.userId })}
            >
              <View className="h-48 w-full bg-surface-container relative">
                <View className="absolute inset-0 bg-black/40" />
                <View className="absolute bottom-3 left-3 flex-row gap-2">
                  {trainer.specialties?.map((tag: string, tIdx: number) => (
                    <View key={tIdx} className="bg-black/50 border border-white/10 px-2 py-1 rounded-sm">
                      <Text className="text-white text-[10px] font-bold uppercase tracking-wider">{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View className="p-4 flex-col gap-2 relative z-10">
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="font-headline-md text-headline-md text-on-surface">{trainer.user?.fullName}</Text>
                    <Text className="text-on-surface-variant text-sm mt-1">{trainer.bio ? (trainer.bio.length > 30 ? trainer.bio.substring(0, 30) + '...' : trainer.bio) : 'Elite Coach'}</Text>
                  </View>
                  <View className="flex-row items-center gap-1 bg-surface/50 border border-[#B06B00]/30 px-2 py-1 rounded-full">
                    <MaterialIcons name="star" size={14} color="#B06B00" />
                    <Text className="font-bold text-sm text-on-surface">{trainer.rating}</Text>
                  </View>
                </View>
                <View className="mt-2 flex-row justify-between items-center border-t border-white/10 pt-3">
                  <Text className="text-on-surface font-semibold">Message for Pricing</Text>
                  <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center">
                    <MaterialIcons name="arrow-forward" size={16} color="#d0bcff" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {!loading && displayedTrainers.length === 0 && (
            <Text className="text-on-surface-variant w-full text-center py-4">No trainers found.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
