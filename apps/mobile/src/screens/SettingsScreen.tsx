import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ConfirmModal } from '../components/ui/Modal';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: Props) {
  const { isDark, toggleTheme, colors } = useAppTheme();
  const { user, logout } = useAuth();
  
  // Settings Controls
  const [isMetric, setIsMetric] = useState(user?.weightUnit === 'KG');
  const [height, setHeight] = useState('180');
  const [weight, setWeight] = useState('75.5');
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(user?.notificationLeadMinutes?.toString() || '60');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBiometrics, setSavingBiometrics] = useState(false);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [goalsForm, setGoalsForm] = useState({
    weeklyGoalDays: user?.weeklyGoalDays?.toString() || '4',
    weeklyGoalHours: user?.weeklyGoalHours?.toString() || '6',
    weeklyGoalCalories: user?.weeklyGoalCalories?.toString() || '2000',
  });
  const { updateProfile } = useAuth();
  const { apiService } = require('../services/api');

  useEffect(() => {
    if (!user) return;
    const fetchBio = async () => {
      try {
        const bio = await apiService.get(`/biometrics/${user.id}/latest`);
        if (bio) {
          if (bio.height) setHeight(bio.height.toString());
          if (bio.weight) setWeight(bio.weight.toString());
        }
      } catch (err) {
        // No biometrics exist yet or network error
      }
    };
    fetchBio();
  }, [user]);

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'May 18, 2026';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      await updateProfile(editForm);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveBiometrics = async () => {
    setSavingBiometrics(true);
    try {
      await apiService.post(`/biometrics/${user?.id}`, {
        height: parseFloat(height),
        weight: parseFloat(weight),
      });
    } catch (err) {
      console.error('Failed to save biometrics', err);
    } finally {
      setSavingBiometrics(false);
    }
  };

  const handleSaveGoals = async () => {
    setSavingGoals(true);
    try {
      await updateProfile({
        weeklyGoalDays: parseInt(goalsForm.weeklyGoalDays, 10),
        weeklyGoalHours: parseFloat(goalsForm.weeklyGoalHours),
        weeklyGoalCalories: parseFloat(goalsForm.weeklyGoalCalories),
      });
      setIsEditingGoals(false);
    } catch (err) {
      console.error('Failed to save goals', err);
    } finally {
      setSavingGoals(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Top App Bar */}
      <View className="w-full border-b pt-12 z-50" style={{ backgroundColor: colors.card, borderBottomColor: colors.border }}>
        <View className="flex-row items-center justify-between px-margin-mobile py-4">
          <TouchableOpacity 
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.surfaceContainerHigh }}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text className="font-headline-md text-headline-md tracking-tighter font-black" style={{ color: colors.primary }}>
            Profile & Settings
          </Text>
          <View 
            className="w-8 h-8 rounded-full overflow-hidden border items-center justify-center"
            style={{ backgroundColor: colors.surfaceContainer, borderColor: colors.border }}
          >
            <MaterialIcons name="person" size={20} color={colors.primary} />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-4" contentContainerStyle={{ paddingBottom: 120, gap: 24 }}>
        
        {/* 👤 PERSONAL PROFILE CARD */}
        {user ? (
          <View className="flex-col gap-3">
            <View className="flex-row items-center justify-between pl-2">
              <Text className="text-label-caps font-label-caps uppercase tracking-wider" style={{ color: colors.textMuted }}>
                Personal Profile
              </Text>
              <TouchableOpacity onPress={() => {
                if (isEditingProfile) {
                  handleSaveProfile();
                } else {
                  setIsEditingProfile(true);
                  setEditForm({
                    fullName: user?.fullName || '',
                    username: user?.username || '',
                    bio: user?.bio || '',
                  });
                }
              }}>
                <Text className="text-[12px] font-bold uppercase tracking-wider" style={{ color: colors.primary }}>
                  {isEditingProfile ? (savingProfile ? 'Saving...' : 'Save') : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View 
              className="border rounded-2xl p-5 gap-5"
              style={{ 
                backgroundColor: isDark ? 'rgba(22, 32, 46, 0.4)' : '#FFFFFF', 
                borderColor: colors.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.2 : 0.05,
                shadowRadius: 8,
                elevation: 2
              }}
            >
              {/* Profile Header (Avatar + Name) */}
              <View className="flex-row items-center gap-4">
                {/* Initials Avatar Ring */}
                <View 
                  style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: 32, 
                    backgroundColor: isDark ? 'rgba(208, 188, 255, 0.15)' : 'rgba(109, 59, 215, 0.12)', 
                    borderColor: colors.primary, 
                    borderWidth: 2, 
                    justifyContent: 'center', 
                    alignItems: 'center' 
                  }}
                >
                  <Text style={{ color: colors.primary, fontSize: 24, fontWeight: 'bold' }}>
                    {user.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('') : 'WK'}
                  </Text>
                </View>
                
                {/* Name Info */}
                <View className="flex-1 justify-center">
                  {isEditingProfile ? (
                    <View className="gap-2">
                      <TextInput 
                        className="border rounded-lg px-3 py-1 font-bold text-[16px]"
                        style={{ borderColor: colors.border, color: colors.text }}
                        value={editForm.fullName}
                        onChangeText={v => setEditForm({...editForm, fullName: v})}
                        placeholder="Full Name"
                      />
                      <TextInput 
                        className="border rounded-lg px-3 py-1 text-[14px]"
                        style={{ borderColor: colors.border, color: colors.primary }}
                        value={editForm.username}
                        onChangeText={v => setEditForm({...editForm, username: v})}
                        placeholder="Username"
                        autoCapitalize="none"
                      />
                    </View>
                  ) : (
                    <>
                      <Text className="text-[20px] font-bold tracking-tight" style={{ color: colors.text }}>
                        {user.fullName}
                      </Text>
                      <Text className="text-[14px] mt-0.5" style={{ color: colors.primary, fontWeight: 'bold' }}>
                        @{user.username}
                      </Text>
                    </>
                  )}
                  <View className="flex-row items-center mt-1 gap-1">
                    <MaterialIcons name="verified" size={14} color="#00e676" />
                    <Text className="text-[11px] uppercase tracking-wider font-bold text-[#00e676]">
                      {user.role === 'TRAINER' ? 'Verified Coach' : 'Verified Athlete'}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="h-px w-full" style={{ backgroundColor: colors.border }} />

              {/* Account details */}
              <View className="gap-3">
                {/* Email address */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="mail-outline" size={18} color={colors.textMuted} />
                    <Text className="text-[14px]" style={{ color: colors.textMuted }}>Email</Text>
                  </View>
                  <Text className="text-[14px] font-medium" style={{ color: colors.text }}>
                    {user.email}
                  </Text>
                </View>

                {/* Member Since */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="date-range" size={18} color={colors.textMuted} />
                    <Text className="text-[14px]" style={{ color: colors.textMuted }}>Member Since</Text>
                  </View>
                  <Text className="text-[14px]" style={{ color: colors.text }}>
                    {formatDate(user.createdAt)}
                  </Text>
                </View>

                {/* ID Reference */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="tag" size={18} color={colors.textMuted} />
                    <Text className="text-[14px]" style={{ color: colors.textMuted }}>Athlete ID</Text>
                  </View>
                  <Text className="text-[12px] font-mono tracking-tight" style={{ color: colors.textMuted }}>
                    {user.id}
                  </Text>
                </View>
              </View>

              {/* Bio text box */}
              <View className="h-px w-full" style={{ backgroundColor: colors.border }} />
              <View className="gap-1.5">
                <Text className="text-[11px] uppercase tracking-wider font-bold" style={{ color: colors.textMuted }}>
                  Bio / Goals
                </Text>
                {isEditingProfile ? (
                  <TextInput 
                    className="border rounded-lg px-3 py-2 text-[13px]"
                    style={{ borderColor: colors.border, color: colors.text, minHeight: 60 }}
                    value={editForm.bio}
                    onChangeText={v => setEditForm({...editForm, bio: v})}
                    placeholder="Tell us about your fitness goals..."
                    multiline
                  />
                ) : (
                  <Text className="text-[13px] leading-5" style={{ color: colors.text }}>
                    {user.bio ? `"${user.bio}"` : <Text className="italic" style={{ color: colors.textMuted }}>"Pushing boundaries, smashing PRs, and getting fit."</Text>}
                  </Text>
                )}
              </View>
            </View>
          </View>
        ) : null}

        {/* 🏋️ COACH INFO CARD (Alex Johnson) */}
        {user && user.trainer ? (
          <View className="flex-col gap-3">
            <Text className="text-label-caps font-label-caps uppercase tracking-wider pl-2" style={{ color: colors.textMuted }}>
              Assigned Coach
            </Text>
            
            <View 
              className="border rounded-2xl p-5 gap-4"
              style={{ 
                backgroundColor: isDark ? 'rgba(22, 32, 46, 0.4)' : '#FFFFFF', 
                borderColor: colors.border 
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  {/* Coach Icon Ring */}
                  <View className="w-10 h-10 rounded-full bg-tertiary/10 items-center justify-center">
                    <MaterialIcons name="sports" size={22} color="#ffb869" />
                  </View>
                  <View>
                    <Text className="text-[16px] font-bold" style={{ color: colors.text }}>
                      {user.trainer.fullName}
                    </Text>
                    <Text className="text-[12px]" style={{ color: colors.textMuted }}>
                      {user.trainer.trainerProfile?.education || 'M.S. Kinesiology'}
                    </Text>
                  </View>
                </View>
                
                {/* Coach Rating */}
                <View className="flex-row items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full">
                  <MaterialIcons name="star" size={14} color="#ffb020" />
                  <Text className="text-[12px] font-bold text-[#ffb020]">
                    {user.trainer.trainerProfile?.rating || '4.9'}
                  </Text>
                </View>
              </View>

              <Text className="text-[13px] leading-5 italic" style={{ color: colors.textMuted }}>
                "{user.trainer.bio || 'Dedicated to helping athletes unlock their ultimate potential through science-based athletic coaching.'}"
              </Text>

              <View className="h-px w-full" style={{ backgroundColor: colors.border }} />

              {/* Certifications & Specialties */}
              <View className="flex flex-col gap-2">
                {/* Certs */}
                <View className="flex-row flex-wrap gap-1.5 items-center">
                  <Text className="text-[11px] uppercase tracking-wider font-bold mr-1" style={{ color: colors.textMuted }}>
                    Certs:
                  </Text>
                  {(user.trainer.trainerProfile?.certifications || ['NSCA-CSCS', 'NASM-CPT']).map((c: string) => (
                    <View key={c} className="bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      <Text className="text-[10px] font-bold" style={{ color: colors.primary }}>{c}</Text>
                    </View>
                  ))}
                </View>
                {/* Specialties */}
                <View className="flex-row flex-wrap gap-1.5 items-center">
                  <Text className="text-[11px] uppercase tracking-wider font-bold mr-1" style={{ color: colors.textMuted }}>
                    Focus:
                  </Text>
                  {(user.trainer.trainerProfile?.specialties || ['Powerlifting', 'Hypertrophy']).map((s: string) => (
                    <View key={s} className="bg-tertiary/10 px-2 py-0.5 rounded border border-tertiary/20">
                      <Text className="text-[10px] font-bold text-tertiary">{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* Empty State for unassigned coach */
          <View className="flex-col gap-3">
            <Text className="text-label-caps font-label-caps uppercase tracking-wider pl-2" style={{ color: colors.textMuted }}>
              Assigned Coach
            </Text>
            
            <View 
              className="border rounded-2xl p-5 gap-4 items-center justify-center"
              style={{ 
                backgroundColor: isDark ? 'rgba(22, 32, 46, 0.4)' : '#FFFFFF', 
                borderColor: colors.border 
              }}
            >
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-2">
                <MaterialIcons name="person-add-alt-1" size={24} color={colors.primary} />
              </View>
              <Text className="text-[16px] font-bold text-center" style={{ color: colors.text }}>
                No Coach Assigned
              </Text>
              <Text className="text-[13px] text-center" style={{ color: colors.textMuted }}>
                Browse the marketplace to find the perfect coach to help you reach your goals.
              </Text>
              
              <TouchableOpacity 
                className="mt-2 px-6 py-3 rounded-xl flex-row items-center justify-center gap-2"
                style={{ backgroundColor: colors.primary }}
                onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Market' })}
              >
                <Text className="text-[14px] font-bold" style={{ color: colors.onPrimary }}>
                  Browse Trainers
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Biometrics */}
        <View className="flex-col gap-4">
          <View className="flex-row items-center justify-between pl-2">
            <Text className="text-label-caps font-label-caps uppercase tracking-wider" style={{ color: colors.textMuted }}>Biometrics</Text>
            <TouchableOpacity onPress={handleSaveBiometrics}>
              <Text className="text-[12px] font-bold uppercase tracking-wider" style={{ color: colors.primary }}>
                {savingBiometrics ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
          <View 
            className="border rounded-xl p-5 gap-6"
            style={{ backgroundColor: isDark ? 'rgba(22,32,46,0.3)' : '#FFFFFF', borderColor: colors.border }}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-4">
                <Text className="text-body-lg font-body-lg font-bold" style={{ color: colors.text }}>System of Measurement</Text>
                <Text className="text-body-base font-body-base mt-1" style={{ color: colors.textMuted }}>Imperial (lbs, ft) vs Metric (kg, cm)</Text>
              </View>
              <Switch 
                value={isMetric}
                onValueChange={async (val) => {
                  setIsMetric(val);
                  try {
                    await updateProfile({
                      weightUnit: val ? 'KG' : 'LBS',
                      lengthUnit: val ? 'CM' : 'IN'
                    });
                  } catch (err) {
                    console.error('Failed to update metric preference', err);
                    setIsMetric(!val);
                  }
                }}
                trackColor={{ false: isDark ? '#494454' : '#C8C6C3', true: isDark ? '#a078ff' : '#6D3BD7' }}
                thumbColor={isMetric ? colors.primary : '#ffffff'}
              />
            </View>
            <View className="h-px w-full" style={{ backgroundColor: colors.border }} />
            <View className="gap-2">
              <Text className="text-body-base font-body-base font-bold" style={{ color: colors.text }}>Height</Text>
              <View className="relative justify-center">
                <TextInput 
                  className="w-full h-12 bg-transparent border rounded-lg pl-4 pr-12 text-numeric-data font-numeric-data"
                  style={{ borderColor: colors.border, color: colors.text }}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
                <Text className="absolute right-4 text-body-base font-body-base" style={{ color: colors.textMuted }}>cm</Text>
              </View>
            </View>
            <View className="gap-2">
              <Text className="text-body-base font-body-base font-bold" style={{ color: colors.text }}>Weight</Text>
              <View className="relative justify-center">
                <TextInput 
                  className="w-full h-12 bg-transparent border rounded-lg pl-4 pr-12 text-numeric-data font-numeric-data"
                  style={{ borderColor: colors.border, color: colors.text }}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
                <Text className="absolute right-4 text-body-base font-body-base" style={{ color: colors.textMuted }}>kg</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Goals */}
        <View className="flex-col gap-4">
          <View className="flex-row justify-between items-center pl-2">
            <Text className="text-label-caps font-label-caps uppercase tracking-wider" style={{ color: colors.textMuted }}>Weekly Goals</Text>
            {isEditingGoals ? (
              <TouchableOpacity onPress={handleSaveGoals} disabled={savingGoals}>
                <Text className="text-[12px] font-bold uppercase tracking-wider" style={{ color: colors.primary }}>
                  {savingGoals ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsEditingGoals(true)}>
                <Text className="text-[12px] font-bold uppercase tracking-wider" style={{ color: colors.primary }}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          <View 
            className="border rounded-xl p-5 gap-6"
            style={{ backgroundColor: isDark ? 'rgba(22,32,46,0.3)' : '#FFFFFF', borderColor: colors.border }}
          >
            <View className="gap-2">
              <Text className="text-body-base font-body-base font-bold" style={{ color: colors.text }}>Training Days (per week)</Text>
              <TextInput 
                className="w-full h-12 bg-transparent border rounded-lg px-4"
                style={{ borderColor: colors.border, color: colors.text }}
                keyboardType="numeric"
                value={goalsForm.weeklyGoalDays}
                onChangeText={(text) => setGoalsForm({...goalsForm, weeklyGoalDays: text})}
                editable={isEditingGoals}
              />
            </View>
            <View className="gap-2">
              <Text className="text-body-base font-body-base font-bold" style={{ color: colors.text }}>Total Hours (per week)</Text>
              <TextInput 
                className="w-full h-12 bg-transparent border rounded-lg px-4"
                style={{ borderColor: colors.border, color: colors.text }}
                keyboardType="numeric"
                value={goalsForm.weeklyGoalHours}
                onChangeText={(text) => setGoalsForm({...goalsForm, weeklyGoalHours: text})}
                editable={isEditingGoals}
              />
            </View>
            <View className="gap-2">
              <Text className="text-body-base font-body-base font-bold" style={{ color: colors.text }}>Calories to Burn (per week)</Text>
              <TextInput 
                className="w-full h-12 bg-transparent border rounded-lg px-4"
                style={{ borderColor: colors.border, color: colors.text }}
                keyboardType="numeric"
                value={goalsForm.weeklyGoalCalories}
                onChangeText={(text) => setGoalsForm({...goalsForm, weeklyGoalCalories: text})}
                editable={isEditingGoals}
              />
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View className="flex-col gap-4">
          <Text className="text-label-caps font-label-caps uppercase tracking-wider pl-2" style={{ color: colors.textMuted }}>Preferences</Text>
          <View 
            className="border rounded-xl p-5 gap-6"
            style={{ backgroundColor: isDark ? 'rgba(22,32,46,0.3)' : '#FFFFFF', borderColor: colors.border }}
          >
            {/* Dynamic Theme Toggle */}
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-4">
                <Text className="text-body-lg font-body-lg font-bold" style={{ color: colors.text }}>Dark Theme</Text>
                <Text className="text-body-base font-body-base mt-1" style={{ color: colors.textMuted }}>Toggle between dark & light styling</Text>
              </View>
              <Switch 
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: isDark ? '#494454' : '#C8C6C3', true: isDark ? '#a078ff' : '#6D3BD7' }}
                thumbColor={isDark ? colors.primary : '#ffffff'}
              />
            </View>
            <View className="h-px w-full" style={{ backgroundColor: colors.border }} />
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-4">
                <Text className="text-body-lg font-body-lg font-bold" style={{ color: colors.text }}>Haptic Feedback</Text>
                <Text className="text-body-base font-body-base mt-1" style={{ color: colors.textMuted }}>Vibrate on set completion</Text>
              </View>
              <Switch 
                value={hapticEnabled}
                onValueChange={setHapticEnabled}
                trackColor={{ false: isDark ? '#494454' : '#C8C6C3', true: isDark ? '#a078ff' : '#6D3BD7' }}
                thumbColor={hapticEnabled ? colors.primary : '#ffffff'}
              />
            </View>
            <View className="h-px w-full" style={{ backgroundColor: colors.border }} />
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-4">
                <Text className="text-body-lg font-body-lg font-bold" style={{ color: colors.text }}>Workout Reminder</Text>
                <Text className="text-body-base font-body-base mt-1" style={{ color: colors.textMuted }}>Minutes before workout to notify</Text>
              </View>
              <TextInput 
                className="w-16 h-10 bg-transparent border rounded-lg px-2 text-center"
                style={{ borderColor: colors.border, color: colors.text }}
                keyboardType="numeric"
                value={reminderMinutes}
                onChangeText={setReminderMinutes}
                onEndEditing={async () => {
                  try {
                    await updateProfile({
                      notificationLeadMinutes: parseInt(reminderMinutes, 10) || 60,
                    });
                  } catch (err) {
                    console.error('Failed to update reminder setting', err);
                  }
                }}
              />
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View className="flex-col gap-4 pt-4">
          <TouchableOpacity 
            className="w-full h-12 border rounded-xl flex-row items-center justify-between px-5"
            style={{ backgroundColor: colors.surfaceContainerHigh, borderColor: colors.border }}
          >
            <Text className="text-body-lg font-body-lg font-bold" style={{ color: colors.text }}>Export Data</Text>
            <MaterialIcons name="download" size={24} color={colors.textMuted} />
          </TouchableOpacity>
          
          {/* Sign Out Button */}
          <TouchableOpacity 
            className="w-full h-12 border rounded-xl flex-row items-center justify-between px-5"
            style={{ 
              backgroundColor: isDark ? 'rgba(109, 59, 215, 0.1)' : 'rgba(109, 59, 215, 0.05)', 
              borderColor: isDark ? 'rgba(109, 59, 215, 0.3)' : 'rgba(109, 59, 215, 0.2)' 
            }}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            <Text className="text-body-lg font-body-lg font-bold" style={{ color: colors.primary }}>
              {loggingOut ? 'Signing Out...' : 'Log Out'}
            </Text>
            {loggingOut ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <MaterialIcons name="logout" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-full h-12 bg-error/10 border border-error/30 rounded-xl flex-row items-center justify-between px-5"
            onPress={() => setShowDeleteModal(true)}
          >
            <Text className="text-body-lg font-body-lg font-bold text-error">Delete Account</Text>
            <MaterialIcons name="delete-forever" size={24} color="#ffb4ab" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Delete Modal */}
      <ConfirmModal 
        visible={showDeleteModal}
        title="Delete Account?"
        message="This action is irreversible. All your data will be permanently deleted."
        onConfirm={() => setShowDeleteModal(false)}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </View>
  );
}
