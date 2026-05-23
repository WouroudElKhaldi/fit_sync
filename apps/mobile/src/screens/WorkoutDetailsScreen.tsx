import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { RouteProp, useIsFocused } from '@react-navigation/native';
import { apiService } from '../services/api';
import { useAppTheme } from '../context/ThemeContext';
import { ConfirmModal } from '../components/ui/Modal';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WorkoutDetails'>;
  route: RouteProp<RootStackParamList, 'WorkoutDetails'>;
};

export default function WorkoutDetailsScreen({ navigation, route }: Props) {
  const { planId } = route.params;
  const { colors } = useAppTheme();
  const isFocused = useIsFocused();

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not Scheduled';
    const date = new Date(dateString);
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${DAYS_OF_WEEK[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()} | ${h}:${m} ${ampm}`;
  };

  async function loadPlan() {
    try {
      setLoading(true);
      const res = await apiService.get(`/workouts/plans/${planId}`);
      setPlan(res);
    } catch (err) {
      console.error('Failed to load workout details:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isFocused && planId) {
      loadPlan();
    }
  }, [planId, isFocused]);

  const handleDeletePlan = async () => {
    try {
      setShowDeleteModal(false);
      await apiService.delete(`/workouts/plans/${planId}`);
      navigation.popToTop(); // pop to home/calendar
    } catch (err) {
      console.error('Failed to delete workout plan:', err);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textMuted, marginTop: 12 }}>Loading details…</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <MaterialIcons name="error-outline" size={48} color={colors.textMuted} />
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 12 }}>Workout Not Found</Text>
        <TouchableOpacity 
          style={{ marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: 52, paddingBottom: 16, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.surfaceContainer }}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.text }}>
            Workout Details
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {/* Title and details block */}
        <View style={{ backgroundColor: colors.surfaceContainer, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <MaterialIcons name="calendar-today" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>
              {formatDate(plan.scheduledDate)}
            </Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 6 }}>
            {plan.title || 'Custom Session'}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, lineHeight: 20 }}>
            {plan.description || 'No description provided.'}
          </Text>
        </View>

        {/* Exercises Section */}
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          Exercises ({plan.exercises?.length || 0})
        </Text>

        {plan.exercises?.map((ex: any, idx: number) => {
          const primaryMuscle = ex.exercise?.muscles?.find((m: any) => m.targetType === 'PRIMARY')?.muscle?.name || 'Full Body';
          const equipment = ex.exercise?.equipment?.name || 'Bodyweight';

          return (
            <View key={ex.id} style={{ backgroundColor: colors.surfaceContainer, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                    {idx + 1}. {ex.exercise?.name || 'Exercise'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    {equipment} • {primaryMuscle}
                  </Text>
                </View>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialIcons name="fitness-center" size={18} color={colors.primary} />
                </View>
              </View>

              {/* Set grid */}
              <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 12 }}>
                {ex.sets?.map((set: any, setIdx: number) => (
                  <View key={set.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textMuted }}>
                      Set {setIdx + 1}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                      {set.expectedReps} reps x {set.expectedWeight} kg
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer sticky bar */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.background, borderTopWidth: 1, borderColor: colors.border, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32, flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity 
          style={{ flex: 2, height: 54, borderRadius: 12, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onPress={() => navigation.navigate('WorkoutLogger', { planId: plan.id })}
        >
          <MaterialIcons name="play-arrow" size={24} color={colors.onPrimary} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.onPrimary }}>
            Start Workout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ width: 54, height: 54, borderRadius: 12, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
          onPress={() => navigation.navigate('WorkoutBuilder', { planId: plan.id })}
        >
          <MaterialIcons name="edit" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ width: 54, height: 54, borderRadius: 12, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
          onPress={() => setShowDeleteModal(true)}
        >
          <MaterialIcons name="delete" size={24} color="#ffb4ab" />
        </TouchableOpacity>
      </View>

      <ConfirmModal 
        visible={showDeleteModal}
        title="Delete Workout?"
        message="Are you sure you want to permanently delete this workout session plan?"
        onConfirm={handleDeletePlan}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </View>
  );
}
