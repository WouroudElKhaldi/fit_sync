import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function TrainerMarketplaceScreen({ navigation }: Props) {
  const trainers = [
    { name: 'Marcus Vance', title: 'Strength & Conditioning', rating: 4.9, price: '$85/hr', tags: ['Powerlifting', 'Elite'] },
    { name: 'Elena Rostova', title: 'Body Recomposition', rating: 5.0, price: '$95/hr', tags: ['Hypertrophy', 'Nutrition'] },
    { name: 'Dr. James Chen', title: 'Movement Specialist', rating: 4.8, price: '$110/hr', tags: ['Mobility', 'Rehab'] },
    { name: 'Sam Reynolds', title: 'HIIT & MetCon', rating: 4.7, price: '$70/hr', tags: ['CrossFit'] }
  ];

  return (
    <View className="flex-1 bg-background pt-12 pb-24">
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

      <ScrollView className="flex-1 px-margin-mobile pt-6" contentContainerStyle={{ gap: 24, paddingBottom: 40 }}>
        {/* Search Bar */}
        <View className="flex-row items-center w-full h-14 rounded-xl bg-transparent border border-white/20 px-4">
          <MaterialIcons name="search" size={24} color="#958ea0" className="mr-3" />
          <TextInput 
            className="flex-1 text-body-base font-body-base text-on-surface"
            placeholder="Find your trainer..."
            placeholderTextColor="#958ea0"
          />
          <MaterialIcons name="tune" size={24} color="#d0bcff" />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
          {['All Trainers', 'Powerlifting', 'Hypertrophy', 'Mobility', 'CrossFit'].map((filter, idx) => (
            <TouchableOpacity 
              key={idx}
              className={`h-10 px-4 rounded-full items-center justify-center mr-3 ${idx === 0 ? 'bg-primary' : 'bg-surface-container border border-white/10'}`}
            >
              <Text className={`${idx === 0 ? 'text-on-primary font-bold' : 'text-on-surface-variant'}`}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trainer Grid */}
        <View className="gap-6 flex-row flex-wrap justify-between">
          {trainers.map((trainer, idx) => (
            <TouchableOpacity 
              key={idx} 
              className="w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-4"
              onPress={() => navigation.navigate('TrainerProfile' as any)}
            >
              <View className="h-48 w-full bg-surface-container relative">
                <View className="absolute inset-0 bg-black/40" />
                <View className="absolute bottom-3 left-3 flex-row gap-2">
                  {trainer.tags.map((tag, tIdx) => (
                    <View key={tIdx} className="bg-black/50 border border-white/10 px-2 py-1 rounded-sm">
                      <Text className="text-white text-[10px] font-bold uppercase tracking-wider">{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View className="p-4 flex-col gap-2 relative z-10">
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="font-headline-md text-headline-md text-on-surface">{trainer.name}</Text>
                    <Text className="text-on-surface-variant text-sm mt-1">{trainer.title}</Text>
                  </View>
                  <View className="flex-row items-center gap-1 bg-surface/50 border border-[#B06B00]/30 px-2 py-1 rounded-full">
                    <MaterialIcons name="star" size={14} color="#B06B00" />
                    <Text className="font-bold text-sm text-on-surface">{trainer.rating}</Text>
                  </View>
                </View>
                <View className="mt-2 flex-row justify-between items-center border-t border-white/10 pt-3">
                  <Text className="text-on-surface font-semibold">{trainer.price}</Text>
                  <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center">
                    <MaterialIcons name="arrow-forward" size={16} color="#d0bcff" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
