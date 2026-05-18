import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function ChatInboxScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-background pt-12 pb-24">
      {/* Top App Bar */}
      <View className="w-full bg-surface/80 border-b border-white/10 z-50 px-margin-mobile py-4 flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center">
             <MaterialIcons name="person" size={20} color="#d0bcff" />
          </View>
          <Text className="font-headline-md text-headline-md font-black tracking-tighter text-primary">FITSYNC PRO</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <MaterialIcons name="settings" size={24} color="#d0bcff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-6" contentContainerStyle={{ gap: 24, paddingBottom: 40 }}>
        {/* Header Section */}
        <View className="flex-row justify-between items-end">
          <View>
            <Text className="text-display-lg font-display-lg text-on-surface">Messages</Text>
            <Text className="text-body-base font-body-base text-on-surface-variant mt-2">
              Connect with your trainers and community.
            </Text>
          </View>
          <TouchableOpacity className="w-12 h-12 rounded-full bg-surface-container-high border border-white/15 items-center justify-center shadow-lg">
            <MaterialIcons name="edit" size={24} color="#d0bcff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center w-full h-14 rounded-xl bg-white/5 border border-white/15 px-4">
          <MaterialIcons name="search" size={24} color="#cbc3d7" className="mr-3" />
          <TextInput 
            className="flex-1 text-body-base font-body-base text-on-surface pl-2"
            placeholder="Search conversations..."
            placeholderTextColor="#cbc3d7"
          />
        </View>

        {/* Active Trainers */}
        <View className="space-y-4">
          <Text className="text-label-caps font-label-caps text-on-surface-variant mb-4">ONLINE TRAINERS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {['Alex M.', 'Sarah T.', 'Marcus R.', 'Elena G.'].map((trainer, idx) => (
              <View key={idx} className="items-center gap-2">
                <View className={`w-16 h-16 rounded-full border-2 ${idx % 2 === 0 ? 'border-primary' : 'border-transparent'} p-0.5 relative`}>
                  <View className="w-full h-full rounded-full bg-surface-container items-center justify-center">
                    <MaterialIcons name="person" size={28} color="#cbc3d7" />
                  </View>
                  <View className="absolute bottom-0 right-0 w-4 h-4 bg-tertiary rounded-full border-2 border-[#1F2937]" />
                </View>
                <Text className="text-label-caps font-label-caps text-on-surface">{trainer}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Chat List */}
        <View className="space-y-4">
          <Text className="text-label-caps font-label-caps text-on-surface-variant mb-2 mt-4">RECENT CONVERSATIONS</Text>
          
          <TouchableOpacity 
            className="w-full rounded-xl bg-white/10 border border-white/15 p-4 flex-row items-center gap-4 mb-2"
            onPress={() => navigation.navigate('ActiveChat')}
          >
            <View className="w-14 h-14 rounded-full bg-surface-container items-center justify-center">
               <MaterialIcons name="person" size={28} color="#cbc3d7" />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-baseline mb-1">
                <View className="flex-row items-center">
                  <Text className="text-body-base font-headline-md text-on-surface font-bold">Alex M.</Text>
                  <View className="ml-2 bg-primary/10 px-2 py-0.5 rounded-sm">
                    <Text className="text-label-caps font-label-caps text-primary">TRAINER</Text>
                  </View>
                </View>
                <Text className="text-label-caps font-label-caps text-primary">09:42 AM</Text>
              </View>
              <Text className="text-body-base font-body-base text-on-surface font-bold" numberOfLines={1}>
                Your deadlift form looks much better in that last video. Keep the core tight.
              </Text>
            </View>
            <View className="w-3 h-3 bg-primary rounded-full shadow-lg" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
