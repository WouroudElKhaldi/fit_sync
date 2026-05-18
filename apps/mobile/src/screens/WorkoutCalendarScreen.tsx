import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useIsFocused } from '@react-navigation/native';
import { api } from '../../mocks/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function WorkoutCalendarScreen({ navigation }: Props) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2026, 4, 1)); // May 2026
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 4, 19)); // May 19, 2026
  const isFocused = useIsFocused();

  // Temporary state for Year/Month picker modal
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [tempYear, setTempYear] = useState(2026);
  const [tempMonth, setTempMonth] = useState(4);

  async function loadData() {
    const allSchedules = await api.getWorkoutSchedule();
    setSchedules(allSchedules);
  }

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  // Helper to get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= numDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const daysInSelectedMonth = getDaysInMonth(selectedMonth);

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const handlePrevMonth = () => {
    const newMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
    const minMonth = new Date(2025, 4, 1); // May 2025
    if (newMonth >= minMonth) {
      setSelectedMonth(newMonth);
      setSelectedDate(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1));
    }
  };

  const handleNextMonth = () => {
    const newMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
    const maxMonth = new Date(2026, 5, 1); // June 2026
    if (newMonth <= maxMonth) {
      setSelectedMonth(newMonth);
      setSelectedDate(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1));
    }
  };

  // Find all workouts for the selected date
  const dayPlans = schedules.filter((s: any) => {
    const sDate = new Date(s.scheduledDate);
    return sDate.getFullYear() === selectedDate.getFullYear() &&
           sDate.getMonth() === selectedDate.getMonth() &&
           sDate.getDate() === selectedDate.getDate();
  });

  return (
    <View className="flex-1 bg-background">
      {/* Top App Bar */}
      <View className="w-full bg-surface/80 border-b border-white/10 pt-12">
        <View className="flex-row items-center justify-between px-margin-mobile py-4">
          <View className="w-8 h-8 rounded-full border border-white/20 bg-surface-container" />
          <Text className="font-headline-md text-headline-md tracking-tighter text-primary">
            CALENDAR
          </Text>
          <TouchableOpacity 
            className="w-8 h-8 items-center justify-center"
            onPress={() => navigation.navigate('Settings')}
          >
            <MaterialIcons name="settings" size={24} color="#cbc3d7" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-4" contentContainerStyle={{ gap: 20, paddingBottom: 110 }}>
        {/* Month Selector Bar */}
        <View className="flex-row justify-between items-center px-1 mt-2">
          <TouchableOpacity 
            className="flex-row items-center gap-1.5"
            onPress={() => {
              setTempYear(selectedMonth.getFullYear());
              setTempMonth(selectedMonth.getMonth());
              setIsPickerVisible(true);
            }}
          >
            <Text className="text-on-surface font-bold text-[18px] tracking-tight">
              {MONTH_NAMES[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={20} color="#d0bcff" />
          </TouchableOpacity>
          <View className="flex-row gap-2">
            <TouchableOpacity 
              className="w-8 h-8 rounded-full bg-surface-container/60 border border-white/5 items-center justify-center"
              onPress={handlePrevMonth}
            >
              <MaterialIcons name="chevron-left" size={20} color="#cbc3d7" />
            </TouchableOpacity>
            <TouchableOpacity 
              className="w-8 h-8 rounded-full bg-surface-container/60 border border-white/5 items-center justify-center"
              onPress={handleNextMonth}
            >
              <MaterialIcons name="chevron-right" size={20} color="#cbc3d7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizontal Scrollable Monthly Ribbon */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5" contentContainerStyle={{ gap: 12, paddingRight: 40 }}>
          {daysInSelectedMonth.map((day) => {
            const isSelected = selectedDate.getFullYear() === day.getFullYear() &&
                               selectedDate.getMonth() === day.getMonth() &&
                               selectedDate.getDate() === day.getDate();
            
            const hasWorkout = schedules.some((s: any) => {
              const sDate = new Date(s.scheduledDate);
              return sDate.getFullYear() === day.getFullYear() &&
                     sDate.getMonth() === day.getMonth() &&
                     sDate.getDate() === day.getDate();
            });

            return (
              <TouchableOpacity 
                key={day.toISOString()} 
                onPress={() => setSelectedDate(day)}
                className={`items-center justify-center min-w-[60px] h-[76px] rounded-xl border ${isSelected ? 'bg-primary/20 border-primary/50' : 'bg-surface-container/40 border-white/5'} backdrop-blur-md`}
              >
                <Text className={`text-[10px] font-bold tracking-wider mb-1 ${isSelected ? 'text-primary font-black' : 'text-on-surface-variant'}`}>
                  {DAY_NAMES[day.getDay()]}
                </Text>
                <Text className={`text-[18px] font-bold ${isSelected ? 'text-primary font-black' : 'text-on-surface'}`}>
                  {day.getDate()}
                </Text>
                {hasWorkout && (
                  <View className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-tertiary'}`} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Scheduled Workouts Header */}
        <View className="flex-row items-center justify-between mt-2 mb-1">
          <Text className="text-on-surface-variant text-label-caps uppercase tracking-wider font-bold">
            Workouts & Plans
          </Text>
          {dayPlans.length > 0 && (
            <Text className="text-primary text-[12px] font-bold">
              {dayPlans.length} Session{dayPlans.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Workout Cards list */}
        {dayPlans.length > 0 ? (
          dayPlans.map((plan: any) => (
            <View key={plan.id} className="bg-surface-container/30 border border-white/10 rounded-xl p-6 relative overflow-hidden">
              <View className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
              <View className="flex-row justify-between items-start mb-6">
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center gap-2 mb-2">
                    <MaterialIcons name="local-fire-department" size={16} color="#ffb869" />
                    <Text className="text-label-caps font-label-caps text-tertiary uppercase tracking-wider">
                      Scheduled Session
                    </Text>
                  </View>
                  <Text className="text-display-lg font-display-lg text-on-surface leading-tight font-black">
                    {plan.title || plan.name}
                  </Text>
                  <Text className="text-on-surface-variant text-body-base font-body-base mt-1">
                    {plan.description || 'Custom workout planned.'}
                  </Text>
                </View>
                <View className="w-12 h-12 rounded-full bg-surface-container-high items-center justify-center border border-white/5">
                  <MaterialIcons name="fitness-center" size={24} color="#d0bcff" />
                </View>
              </View>

              <View className="flex-row gap-4 mb-6">
                <View className="flex-1 bg-surface-container/50 rounded-lg p-3 border border-white/5 items-center">
                  <Text className="text-numeric-data font-numeric-data text-on-surface font-bold">
                    {plan.exercises?.length || 0}
                  </Text>
                  <Text className="text-[10px] uppercase text-on-surface-variant tracking-wider font-bold">Exercises</Text>
                </View>
                <View className="flex-1 bg-surface-container/50 rounded-lg p-3 border border-white/5 items-center">
                  <Text className="text-numeric-data font-numeric-data text-on-surface font-bold">
                    {plan.estimatedDuration || 45}
                  </Text>
                  <Text className="text-[10px] uppercase text-on-surface-variant tracking-wider font-bold">Minutes</Text>
                </View>
                <View className="flex-1 bg-surface-container/50 rounded-lg p-3 border border-white/5 items-center">
                  <Text className="text-numeric-data font-numeric-data text-on-surface font-bold">
                    {plan.difficulty || 'Med'}
                  </Text>
                  <Text className="text-[10px] uppercase text-on-surface-variant tracking-wider font-bold">Intensity</Text>
                </View>
              </View>

              <TouchableOpacity 
                className="w-full h-14 bg-primary rounded-xl flex-row items-center justify-center gap-2 border-t border-white/20"
                onPress={() => {
                  navigation.navigate('WorkoutLogger', { planId: plan.id });
                }}
              >
                <MaterialIcons name="play-arrow" size={24} color="#3c0091" />
                <Text className="text-on-primary font-headline-md text-[18px] font-bold">Start Workout</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View className="bg-surface-container/20 border border-white/5 rounded-xl p-6 flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
            <View className="absolute top-0 right-0 w-48 h-48 bg-tertiary/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <View className="w-12 h-12 rounded-full bg-surface-container-high border border-white/10 items-center justify-center mb-4">
              <MaterialIcons name="spa" size={24} color="#cbc3d7" />
            </View>
            <Text className="text-[18px] font-bold text-on-surface text-center mb-1">Rest Day</Text>
            <Text className="text-on-surface-variant text-sm text-center mb-6 max-w-[280px]">
              No workouts scheduled for today. Rest and recover to let your muscles grow!
            </Text>
            <TouchableOpacity 
              className="px-6 h-10 bg-white/10 border border-white/15 rounded-full items-center justify-center"
              onPress={() => {
                navigation.navigate('WorkoutBuilder', { defaultDate: selectedDate.toISOString() });
              }}
            >
              <Text className="text-white font-bold text-sm">Plan a Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#d0bcff',
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          zIndex: 999
        }}
        onPress={() => {
          navigation.navigate('WorkoutBuilder', { defaultDate: selectedDate.toISOString() });
        }}
      >
        <MaterialIcons name="add" size={32} color="#3c0091" />
      </TouchableOpacity>

      {/* Dropdown Modal overlay for Month & Year Selection */}
      {isPickerVisible && (
        <View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 8, 16, 0.9)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <View 
            style={{
              width: '90%',
              backgroundColor: '#1b1525',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              borderRadius: 24,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.5,
              shadowRadius: 15,
              elevation: 10
            }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-on-surface text-lg font-bold">Select Month & Year</Text>
              <TouchableOpacity onPress={() => setIsPickerVisible(false)}>
                <MaterialIcons name="close" size={24} color="#cbc3d7" />
              </TouchableOpacity>
            </View>

            {/* Year Selector */}
            <Text className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wider mb-2 px-1">Year</Text>
            <View className="flex-row gap-3 mb-6">
              {[2025, 2026].map((y) => (
                <TouchableOpacity
                  key={y}
                  onPress={() => {
                    setTempYear(y);
                    if (y === 2025 && tempMonth < 4) {
                      setTempMonth(4);
                    }
                    if (y === 2026 && tempMonth > 5) {
                      setTempMonth(5);
                    }
                  }}
                  className={`flex-1 py-2.5 rounded-xl border items-center ${tempYear === y ? 'bg-primary border-primary/50' : 'bg-surface-container border-white/5'}`}
                >
                  <Text className={`font-bold text-sm ${tempYear === y ? 'text-on-primary' : 'text-on-surface'}`}>
                    {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Month Grid */}
            <Text className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wider mb-2 px-1">Month</Text>
            <View className="flex-row flex-wrap gap-2 justify-between">
              {MONTH_NAMES.map((name, index) => {
                const isMonthValid = (tempYear === 2025 && index >= 4) || (tempYear === 2026 && index <= 5);
                const isSelected = tempMonth === index;

                return (
                  <TouchableOpacity
                    key={name}
                    disabled={!isMonthValid}
                    onPress={() => {
                      setTempMonth(index);
                      const newMonth = new Date(tempYear, index, 1);
                      setSelectedMonth(newMonth);
                      setSelectedDate(new Date(tempYear, index, 1));
                      setIsPickerVisible(false);
                    }}
                    style={{ width: '31%', marginBottom: 8 }}
                    className={`py-3 rounded-xl items-center border ${
                      isSelected 
                        ? 'bg-primary/20 border-primary/60' 
                        : isMonthValid 
                          ? 'bg-surface-container border-white/5' 
                          : 'opacity-20 bg-surface-container border-transparent'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? 'text-primary font-black' : isMonthValid ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {name.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
