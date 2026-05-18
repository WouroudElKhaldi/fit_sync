import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>; // Adjust to what navigates here
};

export default function RoleSelectionScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-background justify-center px-margin-mobile">
      
      {/* Header Section */}
      <View className="items-center mb-12">
        <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4 border border-primary/20">
          <MaterialIcons name="route" size={32} color="#d0bcff" />
        </View>
        <Text className="text-display-lg font-display-lg text-on-background mb-2 text-center font-bold">
          How will you use FitSync?
        </Text>
        <Text className="text-body-lg font-body-lg text-on-surface-variant text-center max-w-[300px]">
          Select your primary role to customize your high-performance dashboard and toolset.
        </Text>
      </View>

      {/* Role Selection Cards */}
      <View className="gap-6 w-full">
        {/* Athlete Card */}
        <TouchableOpacity 
          className="bg-white/10 rounded-xl p-8 items-center border border-white/15"
          onPress={() => navigation.navigate('MainTabs' as any)}
        >
          <View className="w-24 h-24 rounded-full bg-surface-container-highest items-center justify-center mb-6 border border-white/5">
            <MaterialIcons name="directions-run" size={48} color="#d9e3f6" />
          </View>
          <Text className="text-headline-md font-headline-md text-on-background mb-2 font-bold">I am an Athlete</Text>
          <Text className="text-body-base font-body-base text-on-surface-variant text-center">
            Log workouts, track performance metrics, and push your limits.
          </Text>
        </TouchableOpacity>

        {/* Coach Card */}
        <TouchableOpacity 
          className="bg-white/10 rounded-xl p-8 items-center border border-white/15"
          onPress={() => navigation.navigate('MainTabs' as any)}
        >
          <View className="w-24 h-24 rounded-full bg-surface-container-highest items-center justify-center mb-6 border border-white/5">
            <MaterialIcons name="sports" size={48} color="#d9e3f6" />
          </View>
          <Text className="text-headline-md font-headline-md text-on-background mb-2 font-bold">I am a Coach</Text>
          <Text className="text-body-base font-body-base text-on-surface-variant text-center">
            Manage clients, design elite programs, and monitor athlete progress.
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer Action */}
      <TouchableOpacity className="mt-12 flex-row justify-center items-center gap-2">
        <MaterialIcons name="help-outline" size={16} color="#cbc3d7" />
        <Text className="text-label-caps font-label-caps text-on-surface-variant uppercase">Need help deciding?</Text>
      </TouchableOpacity>
    </View>
  );
}
