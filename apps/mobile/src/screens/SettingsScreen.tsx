import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ConfirmModal } from '../components/ui/Modal';
import { useAppTheme } from '../context/ThemeContext';
import { api } from '../../mocks/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: Props) {
  const { isDark, toggleTheme, colors } = useAppTheme();
  
  // Profile State
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Settings Controls
  const [isMetric, setIsMetric] = useState(true);
  const [height, setHeight] = useState('180');
  const [weight, setWeight] = useState('75.5');
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const userProfile = await api.getUserProfile();
        setProfile(userProfile);
      } catch (error) {
        console.error('Failed to load user profile in settings:', error);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadUserProfile();
  }, []);

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
        
        {/* Loading Spinner for Profile info */}
        {loadingProfile ? (
          <View className="py-8 justify-center items-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-2 text-sm" style={{ color: colors.textMuted }}>Loading personal profile...</Text>
          </View>
        ) : profile ? (
          <>
            {/* 👤 PERSONAL PROFILE CARD */}
            <View className="flex-col gap-3">
              <Text className="text-label-caps font-label-caps uppercase tracking-wider pl-2" style={{ color: colors.textMuted }}>
                Personal Profile
              </Text>
              
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
                      {profile.fullName ? profile.fullName.split(' ').map((n: string) => n[0]).join('') : 'WK'}
                    </Text>
                  </View>
                  
                  {/* Name Info */}
                  <View className="flex-1 justify-center">
                    <Text className="text-[20px] font-bold tracking-tight" style={{ color: colors.text }}>
                      {profile.fullName}
                    </Text>
                    <Text className="text-[14px] mt-0.5" style={{ color: colors.primary, fontWeight: 'bold' }}>
                      @{profile.username}
                    </Text>
                    <View className="flex-row items-center mt-1 gap-1">
                      <MaterialIcons name="verified" size={14} color="#00e676" />
                      <Text className="text-[11px] uppercase tracking-wider font-bold text-[#00e676]">
                        Verified Athlete
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
                      {profile.email}
                    </Text>
                  </View>

                  {/* Member Since */}
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <MaterialIcons name="date-range" size={18} color={colors.textMuted} />
                      <Text className="text-[14px]" style={{ color: colors.textMuted }}>Member Since</Text>
                    </View>
                    <Text className="text-[14px]" style={{ color: colors.text }}>
                      {formatDate(profile.createdAt)}
                    </Text>
                  </View>

                  {/* ID Reference */}
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <MaterialIcons name="tag" size={18} color={colors.textMuted} />
                      <Text className="text-[14px]" style={{ color: colors.textMuted }}>Athlete ID</Text>
                    </View>
                    <Text className="text-[12px] font-mono tracking-tight" style={{ color: colors.textMuted }}>
                      {profile.id}
                    </Text>
                  </View>
                </View>

                {/* Bio text box */}
                {profile.bio ? (
                  <>
                    <View className="h-px w-full" style={{ backgroundColor: colors.border }} />
                    <View className="gap-1.5">
                      <Text className="text-[11px] uppercase tracking-wider font-bold" style={{ color: colors.textMuted }}>
                        Bio / Goals
                      </Text>
                      <Text className="text-[13px] leading-5" style={{ color: colors.text }}>
                        "{profile.bio}"
                      </Text>
                    </View>
                  </>
                ) : null}
              </View>
            </View>

            {/* 🏋️ COACH INFO CARD (Alex Johnson) */}
            {profile.trainer ? (
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
                          {profile.trainer.fullName}
                        </Text>
                        <Text className="text-[12px]" style={{ color: colors.textMuted }}>
                          {profile.trainer.trainerProfile?.education}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Coach Rating */}
                    <View className="flex-row items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full">
                      <MaterialIcons name="star" size={14} color="#ffb020" />
                      <Text className="text-[12px] font-bold text-[#ffb020]">
                        {profile.trainer.trainerProfile?.rating}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-[13px] leading-5 italic" style={{ color: colors.textMuted }}>
                    "{profile.trainer.bio}"
                  </Text>

                  <View className="h-px w-full" style={{ backgroundColor: colors.border }} />

                  {/* Certifications & Specialties */}
                  <View className="flex flex-col gap-2">
                    {/* Certs */}
                    <View className="flex-row flex-wrap gap-1.5 items-center">
                      <Text className="text-[11px] uppercase tracking-wider font-bold mr-1" style={{ color: colors.textMuted }}>
                        Certs:
                      </Text>
                      {profile.trainer.trainerProfile?.certifications?.map((c: string) => (
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
                      {profile.trainer.trainerProfile?.specialties?.map((s: string) => (
                        <View key={s} className="bg-tertiary/10 px-2 py-0.5 rounded border border-tertiary/20">
                          <Text className="text-[10px] font-bold text-tertiary">{s}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ) : null}
          </>
        ) : null}
        
        {/* Biometrics */}
        <View className="flex-col gap-4">
          <Text className="text-label-caps font-label-caps uppercase tracking-wider pl-2" style={{ color: colors.textMuted }}>Biometrics</Text>
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
                onValueChange={setIsMetric}
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
