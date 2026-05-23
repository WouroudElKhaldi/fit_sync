import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useIsFocused } from '@react-navigation/native';
import { useAppTheme } from '../context/ThemeContext';
import { AppHeader } from '../components/ui/AppHeader';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Default to today
  const isFocused = useIsFocused();
  const [prs, setPrs] = useState<any[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (!user) return;

        // Load upcoming plans
        const res = await apiService.get(`/workouts/plans/client/${user.id}`);
        setSchedules(res || []);

        // Load recent PRs
        const prsRes = await apiService.get(`/biometrics/${user.id}/prs`);
        setPrs(prsRes || []);

        // Load analytics for weekly goal calculation
        const analyticsRes = await apiService.get(`/workouts/plans/analytics/${user.id}`);
        if (analyticsRes && analyticsRes.summary) {
          const { totalSessionsThisWeek, weeklyGoalDays } = analyticsRes.summary;
          const target = weeklyGoalDays || 4;
          const progress = Math.min(100, Math.round((totalSessionsThisWeek / target) * 100));
          setWeeklyGoal(progress);
        }

        if (analyticsRes && analyticsRes.summary) {
          const { totalSessionsThisWeek, weeklyGoalDays } = analyticsRes.summary;
          const target = weeklyGoalDays || 4;
          const progress = Math.min(100, Math.round((totalSessionsThisWeek / target) * 100));
          setWeeklyGoal(progress);
        }
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    if (isFocused) {
      loadData();
    }
  }, [isFocused, user]);

  const handleDeletePlan = async (planId: string) => {
    try {
      await apiService.delete(`/workouts/plans/${planId}`);
      if (user) {
        const res = await apiService.get(`/workouts/plans/client/${user.id}`);
        setSchedules(res || []);
      }
    } catch (err) {
      console.error('Failed to delete workout plan:', err);
    }
  };

  const confirmDelete = (planId: string) => {
    Alert.alert(
      'Delete Workout?',
      'Are you sure you want to permanently delete this workout session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeletePlan(planId) },
      ]
    );
  };

  // Helper to get this week's days (Mon–Sun) for the current real date
  const getThisWeekDays = () => {
    const today = new Date(); // always real today
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const thisWeekDays = getThisWeekDays();
  const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const isWorkoutDone = (plan: any) => {
    return plan.exercises?.some((ex: any) =>
      ex.sets?.some((s: any) => s.status === 'COMPLETED' || s.actualReps !== null)
    );
  };

  // Find all workouts for the selected date
  const dayPlans = schedules.filter((s: any) => {
    const sDate = new Date(s.scheduledDate);
    return sDate.getFullYear() === selectedDate.getFullYear() &&
      sDate.getMonth() === selectedDate.getMonth() &&
      sDate.getDate() === selectedDate.getDate();
  });

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <AppHeader />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 16, paddingBottom: 96 }}>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginTop: 16 }}>
          <View>
            <Text style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, color: colors.textMuted }}>
              Good Morning
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>
              Welcome back, {user?.fullName?.split(' ')[0] || 'Athlete'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginTop: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
            This Week
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>
            {weeklyGoal}% Goal
          </Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
        >
            {thisWeekDays.map((d, idx) => {
              const isToday = d.toDateString() === new Date().toDateString();
              const isSelected = d.toDateString() === selectedDate.toDateString();
              const dayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][d.getDay()];

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedDate(d)}
                  style={{
                    width: 52, height: 72, borderRadius: 12,
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: isToday && !isSelected ? 2 : 1,
                    backgroundColor: isSelected ? colors.primary : colors.surfaceContainer,
                    borderColor: isSelected ? 'transparent' : isToday ? colors.primary : colors.border
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '700', marginBottom: 4, color: isSelected ? colors.onPrimary : isToday ? colors.primary : colors.textMuted }}>
                    {dayName}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: isSelected ? colors.onPrimary : isToday ? colors.primary : colors.text }}>
                    {d.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={{ flex: 1, gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', color: colors.textMuted }}>
                SCHEDULED SESSIONS
              </Text>
            </View>

            {dayPlans.length > 0 ? (
            dayPlans.map((plan: any) => (
              <View key={plan.id} style={{ backgroundColor: colors.surfaceContainer, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 24, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <View style={{ flex: 1, paddingRight: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <MaterialIcons name="local-fire-department" size={16} color="#ffb869" />
                      <Text style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: colors.textMuted }}>
                        Workout Plan
                      </Text>
                    </View>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 4 }}>
                      {plan.title || plan.name}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textMuted }}>
                      {plan.description || 'Custom session'}
                    </Text>
                  </View>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
                    <MaterialIcons name="fitness-center" size={24} color={colors.primary} />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 32 }}>
                  <View style={{ flex: 1, backgroundColor: colors.surfaceContainerHigh, borderRadius: 8, padding: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                      {plan.exercises?.length || 0}
                    </Text>
                    <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', color: colors.textMuted }}>Exercises</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: colors.surfaceContainerHigh, borderRadius: 8, padding: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                      {plan.estimatedDuration || 45}
                    </Text>
                    <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', color: colors.textMuted }}>Minutes</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: colors.surfaceContainerHigh, borderRadius: 8, padding: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                      {plan.difficulty || 'Med'}
                    </Text>
                    <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', color: colors.textMuted }}>Intensity</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  {/* Start Workout */}
                  <TouchableOpacity 
                    style={{ flex: 1.6, height: 46, borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onPress={() => {
                      navigation.navigate('WorkoutLogger', { planId: plan.id });
                    }}
                  >
                    <MaterialIcons name="play-arrow" size={20} color={colors.onPrimary} />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.onPrimary }}>
                      Start
                    </Text>
                  </TouchableOpacity>

                  {/* View Details */}
                  <TouchableOpacity 
                    style={{ width: 46, height: 46, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
                    onPress={() => {
                      (navigation as any).navigate('WorkoutDetails', { planId: plan.id });
                    }}
                  >
                    <MaterialIcons name="info" size={20} color={colors.text} />
                  </TouchableOpacity>

                  {/* Edit Plan */}
                  <TouchableOpacity 
                    style={{ width: 46, height: 46, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
                    onPress={() => {
                      (navigation as any).navigate('WorkoutBuilder', { planId: plan.id });
                    }}
                  >
                    <MaterialIcons name="edit" size={20} color={colors.text} />
                  </TouchableOpacity>

                  {/* Delete Plan */}
                  <TouchableOpacity 
                    style={{ width: 46, height: 46, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
                    onPress={() => confirmDelete(plan.id)}
                  >
                    <MaterialIcons name="delete" size={20} color="#ffb4ab" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={{ backgroundColor: colors.surfaceContainer, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <MaterialIcons name="spa" size={24} color={colors.textMuted} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 }}>Rest Day</Text>
              <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 24, maxWidth: 280 }}>
                No workouts scheduled for today. Rest and recover to let your muscles grow!
              </Text>
              <TouchableOpacity 
                style={{ paddingHorizontal: 24, height: 40, backgroundColor: colors.primary, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => {
                  navigation.navigate('WorkoutBuilder', { defaultDate: selectedDate.toISOString() });
                }}
              >
                <Text style={{ fontWeight: '700', fontSize: 14, color: colors.onPrimary }}>Add Workout</Text>
              </TouchableOpacity>
            </View>
          )}
          </View>

        {/* Bento Grid: Stats & Prompts */}
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flex: 1, backgroundColor: colors.surfaceContainer, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16, backgroundColor: '#B06B00' }}>
              <MaterialIcons name="emoji-events" size={20} color="white" />
            </View>
            <View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>
                {prs.length > 0 ? 'New PR!' : 'No PRs Yet'}
              </Text>
              <Text style={{ fontSize: 12, textTransform: 'uppercase', color: colors.textMuted, marginTop: 4 }}>
                {prs.length > 0 ? `${prs[0].exercise.name} ${prs[0].weight}${user?.weightUnit || 'KG'}` : 'Keep pushing!'}
              </Text>
            </View>
          </View>

          <View style={{ flex: 1, backgroundColor: colors.surfaceContainer, borderRadius: 16, padding: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
            <View style={{ width: 96, height: 96, marginBottom: 8, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 8, borderColor: colors.surfaceContainerHigh }} />
              <View style={{ position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 8, borderColor: colors.primary, borderRightColor: 'transparent', borderBottomColor: 'transparent', transform: [{ rotate: `${(weeklyGoal / 100) * 360}deg` }] }} />
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{weeklyGoal}%</Text>
            </View>
            <Text style={{ fontSize: 12, textTransform: 'uppercase', color: colors.textMuted }}>Weekly Goal</Text>
          </View>
        </View>

        {/* Find a Coach Prompt */}
        <TouchableOpacity 
          style={{ backgroundColor: colors.surfaceContainer, borderRadius: 16, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: colors.border }}
          onPress={() => (navigation as any).navigate('Market')}
        >
          <View style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
            <MaterialIcons name="sports" size={32} color="#ffb869" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 }}>Stalled Progress?</Text>
            <Text style={{ fontSize: 14, color: colors.textMuted }}>
              Find an elite coach in the market to push your limits.
            </Text>
          </View>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
            <MaterialIcons name="arrow-forward" size={20} color={colors.text} />
          </View>
        </TouchableOpacity>

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
          backgroundColor: colors.primary,
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
        <MaterialIcons name="add" size={32} color={colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}
