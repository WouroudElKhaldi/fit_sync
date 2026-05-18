import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

type TabType = 'overview' | 'strength' | 'composition';
type LiftType = 'bench' | 'squat' | 'deadlift';

export default function AnalyticsDashboardScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedLift, setSelectedLift] = useState<LiftType>('bench');

  // Static high-fidelity mock data
  const liftsData = {
    bench: {
      pr: '225 lbs',
      history: [
        { date: 'Apr 1', weight: 205 },
        { date: 'Apr 15', weight: 210 },
        { date: 'May 1', weight: 215 },
        { date: 'May 15', weight: 225 },
      ],
      targets: { '1RM': '225 lbs', '3RM': '210 lbs', '5RM': '195 lbs' }
    },
    squat: {
      pr: '315 lbs',
      history: [
        { date: 'Apr 1', weight: 295 },
        { date: 'Apr 15', weight: 300 },
        { date: 'May 1', weight: 305 },
        { date: 'May 15', weight: 315 },
      ],
      targets: { '1RM': '315 lbs', '3RM': '295 lbs', '5RM': '275 lbs' }
    },
    deadlift: {
      pr: '405 lbs',
      history: [
        { date: 'Apr 1', weight: 375 },
        { date: 'Apr 15', weight: 385 },
        { date: 'May 1', weight: 395 },
        { date: 'May 15', weight: 405 },
      ],
      targets: { '1RM': '405 lbs', '3RM': '380 lbs', '5RM': '355 lbs' }
    }
  };

  return (
    <View className="flex-1 bg-background pt-12">
      {/* Top App Bar */}
      <View className="w-full bg-surface/80 border-b border-white/10 z-50 px-margin-mobile py-4 flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center">
             <MaterialIcons name="insights" size={20} color="#d0bcff" />
          </View>
          <Text className="font-headline-md text-headline-md font-black tracking-tighter text-primary">PERFORMANCE</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <MaterialIcons name="settings" size={24} color="#d0bcff" />
        </TouchableOpacity>
      </View>

      {/* Glassmorphic Category Tabs */}
      <View className="flex-row px-margin-mobile pt-4 pb-2 justify-between gap-2">
        {(['overview', 'strength', 'composition'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-full border items-center justify-center ${
              activeTab === tab 
                ? 'bg-primary/20 border-primary/50' 
                : 'bg-surface-container/40 border-white/5'
            }`}
          >
            <Text className={`text-xs font-bold capitalize ${
              activeTab === tab ? 'text-primary font-black' : 'text-on-surface-variant'
            }`}>
              {tab === 'composition' ? 'Body Comp' : tab === 'strength' ? 'Strength PRs' : 'Overview'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-3" contentContainerStyle={{ gap: 20, paddingBottom: 110 }}>
        
        {/* OVERVIEW TAB CONTENT */}
        {activeTab === 'overview' && (
          <View className="flex flex-col gap-5">
            {/* Bento Grid: Core Metrics */}
            <View className="flex-row gap-4">
              {/* Daily Energy */}
              <View className="flex-1 bg-surface-container/30 border border-white/10 rounded-2xl p-4 min-h-[135px] justify-between relative overflow-hidden">
                <View className="flex-row justify-between items-start mb-2">
                  <Text style={{ flex: 1, marginRight: 8 }} className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Active Calories</Text>
                  <View className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 items-center justify-center">
                    <MaterialIcons name="flash-on" size={16} color="#ffb869" />
                  </View>
                </View>
                <View>
                  <Text className="text-display-md font-black text-on-surface leading-tight">640 kcal</Text>
                  {/* Mini-progress bar */}
                  <View className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <View className="w-[80%] h-full bg-primary rounded-full" />
                  </View>
                  <Text className="text-[9px] text-on-surface-variant mt-1">80% of daily target</Text>
                </View>
              </View>

              {/* Weekly training time */}
              <View className="flex-1 bg-surface-container/30 border border-white/10 rounded-2xl p-4 min-h-[135px] justify-between relative overflow-hidden">
                <View className="flex-row justify-between items-start mb-2">
                  <Text style={{ flex: 1, marginRight: 8 }} className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Weekly Time</Text>
                  <View className="w-8 h-8 rounded-full bg-tertiary/10 border border-tertiary/20 items-center justify-center">
                    <MaterialIcons name="timer" size={16} color="#d0bcff" />
                  </View>
                </View>
                <View>
                  <Text className="text-display-md font-black text-on-surface leading-tight">4.8 hrs</Text>
                  <View className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <View className="w-[65%] h-full bg-tertiary rounded-full" />
                  </View>
                  <Text className="text-[9px] text-on-surface-variant mt-1">Goal: 6 hours</Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-4">
              {/* Logged Workouts */}
              <View className="flex-1 bg-surface-container/30 border border-white/10 rounded-2xl p-4 min-h-[120px] justify-between relative overflow-hidden">
                <View className="flex-row justify-between items-start mb-2">
                  <Text style={{ flex: 1, marginRight: 8 }} className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Completed Sessions</Text>
                  <View className="w-8 h-8 rounded-full bg-white/5 border border-white/10 items-center justify-center">
                    <MaterialIcons name="check-circle" size={16} color="#52b788" />
                  </View>
                </View>
                <View>
                  <Text className="text-display-lg font-black text-on-surface">14</Text>
                  <Text className="text-[9px] text-on-surface-variant mt-1">100% completion rate</Text>
                </View>
              </View>

              {/* Active Streak */}
              <View className="flex-1 bg-surface-container/30 border border-white/10 rounded-2xl p-4 min-h-[120px] justify-between relative overflow-hidden">
                <View className="flex-row justify-between items-start mb-2">
                  <Text style={{ flex: 1, marginRight: 8 }} className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Active Streak</Text>
                  <View className="w-8 h-8 rounded-full bg-white/5 border border-white/10 items-center justify-center">
                    <MaterialIcons name="local-fire-department" size={16} color="#ffb869" />
                  </View>
                </View>
                <View>
                  <Text className="text-display-lg font-black text-on-surface">12 Days</Text>
                  <Text className="text-[9px] text-on-surface-variant mt-1">Personal record is 15!</Text>
                </View>
              </View>
            </View>

            {/* Weekly Training Frequency */}
            <View className="bg-surface-container/30 border border-white/10 rounded-2xl p-5 shadow-lg">
              <Text className="text-sm font-bold text-on-surface mb-4">Training Days This Week</Text>
              <View className="flex-row justify-between gap-1 items-end h-32">
                {[
                  { day: 'M', active: true, h: '70%' },
                  { day: 'T', active: true, h: '85%' },
                  { day: 'W', active: false, h: '10%' },
                  { day: 'T', active: true, h: '75%' },
                  { day: 'F', active: true, h: '90%' },
                  { day: 'S', active: false, h: '10%' },
                  { day: 'S', active: false, h: '10%' },
                ].map((item, idx) => (
                  <View key={idx} className="flex-1 items-center gap-2">
                    <View 
                      style={{ height: item.h }} 
                      className={`w-full rounded-t-lg ${item.active ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-surface-container-high/50'}`} 
                    />
                    <Text className={`text-[10px] font-bold ${item.active ? 'text-primary' : 'text-on-surface-variant'}`}>{item.day}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Target Muscle Focus Split */}
            <View className="bg-surface-container/30 border border-white/10 rounded-2xl p-5 shadow-lg">
              <Text className="text-sm font-bold text-on-surface mb-4">Target Muscle Balance</Text>
              
              <View className="flex flex-col gap-4">
                {[
                  { muscle: 'Chest / Push (Hypertrophy)', val: '35%', color: 'bg-primary' },
                  { muscle: 'Back / Pull (Volume)', val: '25%', color: 'bg-tertiary' },
                  { muscle: 'Legs / Posterior Chain', val: '30%', color: 'bg-orange-400' },
                  { muscle: 'Core & Stabilizers', val: '10%', color: 'bg-white/30' },
                ].map((item, idx) => (
                  <View key={idx}>
                    <View className="flex-row justify-between mb-1.5">
                      <Text className="text-[11px] font-bold text-on-surface">{item.muscle}</Text>
                      <Text className="text-[11px] font-black text-on-surface">{item.val}</Text>
                    </View>
                    <View className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <View style={{ width: item.val }} className={`h-full rounded-full ${item.color}`} />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* STRENGTH PRS TAB CONTENT */}
        {activeTab === 'strength' && (
          <View className="flex flex-col gap-5">
            {/* PR Selector Pills */}
            <View className="flex-row gap-2 bg-surface-container/50 border border-white/5 p-1 rounded-xl">
              {(['bench', 'squat', 'deadlift'] as LiftType[]).map((lift) => (
                <TouchableOpacity
                  key={lift}
                  onPress={() => setSelectedLift(lift)}
                  className={`flex-1 py-2.5 rounded-lg items-center ${
                    selectedLift === lift ? 'bg-primary/20 border border-primary/30' : 'border border-transparent'
                  }`}
                >
                  <Text className={`text-xs font-bold uppercase ${
                    selectedLift === lift ? 'text-primary font-black' : 'text-on-surface-variant'
                  }`}>
                    {lift === 'bench' ? 'Bench' : lift === 'squat' ? 'Squat' : 'Deadlift'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Personal Records Cards */}
            <View className="bg-surface-container/30 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-[10px] text-tertiary uppercase tracking-wider font-bold">Verified Personal Record</Text>
                  <Text className="text-[28px] font-black text-on-surface mt-1">{liftsData[selectedLift].pr}</Text>
                </View>
                <View className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 items-center justify-center">
                  <MaterialIcons name="emoji-events" size={24} color="#ffb869" />
                </View>
              </View>

              {/* Progress Targets Grid */}
              <View className="flex-row justify-between gap-2 border-t border-white/5 pt-4">
                {Object.entries(liftsData[selectedLift].targets).map(([repMax, val]) => (
                  <View key={repMax} className="flex-1 bg-surface-container/50 border border-white/5 rounded-xl p-3 items-center">
                    <Text className="text-[10px] font-bold text-on-surface-variant mb-1">{repMax}</Text>
                    <Text className="text-sm font-bold text-on-surface">{val}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 1RM Line Chart */}
            <View className="bg-surface-container/30 border border-white/10 rounded-2xl p-5 shadow-lg">
              <Text className="text-sm font-bold text-on-surface mb-6">Estimated 1RM Progression</Text>
              
              <View className="h-44 flex-row items-end justify-between border-b border-l border-white/15 pb-2 pl-2 relative">
                {/* Visual Line Graph Representation */}
                <View className="absolute inset-0 flex-row items-end justify-around pb-6">
                  {liftsData[selectedLift].history.map((pt, idx) => {
                    const min = 190;
                    const max = 420;
                    const heightPercent = `${Math.min(100, Math.max(15, ((pt.weight - min) / (max - min)) * 100))}%`;
                    
                    return (
                      <View key={idx} style={{ height: heightPercent }} className="items-center justify-end relative">
                        {/* Interactive PR indicator point */}
                        <View className="w-3 h-3 rounded-full bg-primary border-2 border-white absolute -top-1.5 shadow-lg shadow-primary" />
                        
                        {/* floating label */}
                        <Text className="text-[10px] font-black text-on-surface absolute -top-7 px-1.5 py-0.5 rounded bg-primary/20 border border-primary/30">
                          {pt.weight}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* X Axis dates */}
              <View className="flex-row justify-around w-full mt-3">
                {liftsData[selectedLift].history.map((pt, idx) => (
                  <Text key={idx} className="text-[10px] font-bold text-on-surface-variant">{pt.date}</Text>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* BODY COMP TAB CONTENT */}
        {activeTab === 'composition' && (
          <View className="flex flex-col gap-5">
            {/* Weight Progression */}
            <View className="bg-surface-container/30 border border-white/10 rounded-2xl p-5 shadow-lg">
              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-[10px] text-tertiary uppercase tracking-wider font-bold">Body Weight Trend</Text>
                  <Text className="text-[28px] font-black text-on-surface mt-1">178.6 lbs</Text>
                </View>
                <View className="bg-surface-container-high px-4 py-2 rounded-full border border-white/5">
                  <Text className="text-[10px] font-bold text-primary">-3.4 lbs this month</Text>
                </View>
              </View>

              {/* Weight Progression Chart */}
              <View className="h-44 flex-row items-end justify-between border-b border-l border-white/15 pb-2 pl-2 relative">
                <View className="absolute inset-0 flex-row items-end justify-around pb-4">
                  {[182.0, 180.5, 179.2, 178.6].map((w, idx) => {
                    const min = 170;
                    const max = 190;
                    const heightPercent = `${100 - ((w - min) / (max - min)) * 100}%`;

                    return (
                      <View key={idx} style={{ height: heightPercent }} className="items-center justify-end relative">
                        <View className="w-3 h-3 rounded-full bg-tertiary border-2 border-white absolute -top-1.5 shadow-lg" />
                        <Text className="text-[10px] font-black text-on-surface absolute -top-7 px-1.5 py-0.5 rounded bg-tertiary/20 border border-tertiary/30">
                          {w}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View className="flex-row justify-around w-full mt-3">
                {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((wk) => (
                  <Text key={wk} className="text-[10px] font-bold text-on-surface-variant">{wk}</Text>
                ))}
              </View>
            </View>

            {/* Muscle vs Fat stats */}
            <View className="flex-row gap-4">
              <View className="flex-1 bg-surface-container/30 border border-white/10 rounded-2xl p-5 items-center justify-center relative overflow-hidden">
                <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Body Fat %</Text>
                <Text className="text-[28px] font-black text-tertiary">14.2%</Text>
                <Text className="text-[9px] text-on-surface-variant mt-2">Target: 12% | Down 0.8%</Text>
              </View>

              <View className="flex-1 bg-surface-container/30 border border-white/10 rounded-2xl p-5 items-center justify-center relative overflow-hidden">
                <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Lean Mass</Text>
                <Text className="text-[28px] font-black text-primary">153.2 lbs</Text>
                <Text className="text-[9px] text-on-surface-variant mt-2">Target: 155 lbs | Up 1.4 lbs</Text>
              </View>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
