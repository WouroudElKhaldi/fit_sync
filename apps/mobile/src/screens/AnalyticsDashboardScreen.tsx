import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function AnalyticsDashboardScreen({ navigation }: Props) {
  const screenWidth = Dimensions.get('window').width;

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
        <View>
          <Text className="text-display-lg font-display-lg text-primary mb-2">Analytics</Text>
          <Text className="text-body-lg font-body-lg text-on-surface-variant">
            Track your progress and performance metrics.
          </Text>
        </View>

        {/* Body Weight Chart Placeholder */}
        <View className="bg-surface-container/30 border border-white/10 rounded-xl p-6 shadow-lg">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-headline-md font-headline-md text-on-surface">Body Weight</Text>
            <View className="bg-surface-container-high px-4 py-2 rounded-full border border-white/5">
              <Text className="text-label-caps font-label-caps text-tertiary">LBS</Text>
            </View>
          </View>
          
          <View className="h-64 flex-row border-b border-l border-white/20 pb-2 pl-2 relative">
            {/* Y Axis */}
            <View className="absolute -left-8 bottom-0 top-0 justify-between py-2">
              <Text className="text-label-caps text-on-surface-variant">190</Text>
              <Text className="text-label-caps text-on-surface-variant">185</Text>
              <Text className="text-label-caps text-on-surface-variant">180</Text>
              <Text className="text-label-caps text-on-surface-variant">175</Text>
            </View>
            
            {/* Chart Graphic Area */}
            <View className="flex-1 relative">
              {/* Fake line / area */}
              <View className="absolute bottom-0 w-full h-[60%] bg-tertiary/20 border-t-2 border-tertiary rounded-tl-full opacity-50" />
            </View>
          </View>

          {/* X Axis */}
          <View className="flex-row justify-between w-full mt-4 pl-2">
            <Text className="text-label-caps text-on-surface-variant">Week 1</Text>
            <Text className="text-label-caps text-on-surface-variant">Week 2</Text>
            <Text className="text-label-caps text-on-surface-variant">Week 3</Text>
            <Text className="text-label-caps text-on-surface-variant">Week 4</Text>
          </View>
        </View>

        {/* Volume Progression Chart Placeholder */}
        <View className="bg-surface-container/30 border border-white/10 rounded-xl p-6 shadow-lg">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-headline-md font-headline-md text-on-surface">Volume Progression</Text>
            <View className="flex-row gap-4">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-primary" />
                <Text className="text-label-caps text-on-surface-variant">Planned</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-tertiary" />
                <Text className="text-label-caps text-on-surface-variant">Actual</Text>
              </View>
            </View>
          </View>

          <View className="h-64 flex-row items-end justify-between border-b border-white/20 pb-0 gap-2">
             {[
               { h1: '60%', h2: '65%' },
               { h1: '70%', h2: '68%' },
               { h1: '80%', h2: '85%' },
               { h1: '90%', h2: '95%' }
             ].map((bar, i) => (
               <View key={i} className="flex-row items-end justify-center gap-1 flex-1 h-full">
                 <View className="flex-1 bg-primary/80 rounded-t-sm" style={{ height: bar.h1 as any }} />
                 <View className="flex-1 bg-tertiary/80 rounded-t-sm shadow-lg" style={{ height: bar.h2 as any }} />
               </View>
             ))}
          </View>

          {/* X Axis */}
          <View className="flex-row justify-between w-full mt-4">
            <Text className="flex-1 text-center text-label-caps text-on-surface-variant">Bench</Text>
            <Text className="flex-1 text-center text-label-caps text-on-surface-variant">Squat</Text>
            <Text className="flex-1 text-center text-label-caps text-on-surface-variant">Deadlift</Text>
            <Text className="flex-1 text-center text-label-caps text-on-surface-variant">Press</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
