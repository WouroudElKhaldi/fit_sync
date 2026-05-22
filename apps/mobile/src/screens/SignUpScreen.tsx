import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

export default function SignUpScreen({ navigation }: Props) {
  const { isDark, toggleTheme, colors } = useAppTheme();
  const { register } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Custom Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selDay, setSelDay] = useState(15);
  const [selMonth, setSelMonth] = useState(5); // June (0-indexed)
  const [selYear, setSelYear] = useState(2000);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from(
    { length: 100 },
    (_, i) => new Date().getFullYear() - 13 - i // limit to 13+ years old for sign up
  );

  const getDaysInMonth = (m: number, y: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const handleSignUp = async () => {
    setErrorMessage('');

    // 1. Validation
    if (!fullName.trim()) {
      setErrorMessage('Full name is required');
      return;
    }
    if (!username.trim()) {
      setErrorMessage('Username is required');
      return;
    }
    if (!dob.trim()) {
      setErrorMessage('Date of birth is required');
      return;
    }
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dob)) {
      setErrorMessage('Please enter Date of Birth in YYYY-MM-DD format');
      return;
    }
    const parts = dob.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dobDate = new Date(year, month, day);
    const today = new Date();
    
    if (
      dobDate.getFullYear() !== year ||
      dobDate.getMonth() !== month ||
      dobDate.getDate() !== day ||
      dobDate > today ||
      year < today.getFullYear() - 120
    ) {
      setErrorMessage('Please enter a valid Date of Birth');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (!password.trim() || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }

    // 2. Perform real Sign Up
    setIsLoading(true);
    try {
      await register({
        email: email.toLowerCase().trim(),
        username: username.toLowerCase().trim(),
        password,
        fullName: fullName.trim(),
        role: 'USER',
      });
      navigation.replace('EmailVerification', { email: email.toLowerCase().trim() });
    } catch (error: any) {
      setErrorMessage(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 relative"
      style={{ backgroundColor: colors.background }}
    >
      {/* Dynamic Floating Theme Toggle Button */}
      <TouchableOpacity 
        style={{ 
          position: 'absolute', 
          top: 56, 
          right: 24, 
          zIndex: 50, 
          width: 44, 
          height: 44, 
          borderRadius: 22, 
          backgroundColor: colors.surfaceContainerHigh, 
          alignItems: 'center', 
          justifyContent: 'center', 
          borderColor: colors.border, 
          borderWidth: 1,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4
        }}
        onPress={toggleTheme}
      >
        <MaterialIcons name={isDark ? "wb-sunny" : "nights-stay"} size={22} color={colors.primary} />
      </TouchableOpacity>

      {/* Ambient Background Glow (Only in Dark Mode for aesthetic depth) */}
      {isDark && (
        <View className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <View className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-primary rounded-full opacity-10" style={{ transform: [{ scale: 1.5 }] }} />
          <View className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-tertiary rounded-full opacity-5" style={{ transform: [{ scale: 1.5 }] }} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingTop: 80, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        className="z-10"
      >
        <View className="w-full max-w-[400px] align-self-center mx-auto flex flex-col gap-4">

          {/* Logo Header */}
          <View className="items-center flex flex-col gap-1">
            <View 
              className="w-10 h-10 rounded-full items-center justify-center border"
              style={{ backgroundColor: isDark ? 'rgba(208, 188, 255, 0.1)' : 'rgba(109, 59, 215, 0.1)', borderColor: colors.border }}
            >
              <MaterialIcons name="person-add" size={20} color={colors.primary} />
            </View>
            <Text className="font-bold text-[20px] tracking-tight uppercase" style={{ color: colors.primary }}>
              Create Account
            </Text>
            <Text className="text-[13px] text-center" style={{ color: colors.textMuted }}>
              Join the performance community today.
            </Text>
          </View>

          {/* Error Message Alert */}
          {errorMessage ? (
            <View 
              className="border rounded-xl p-4 flex-row items-center gap-3"
              style={{ 
                backgroundColor: isDark ? 'rgba(147, 0, 10, 0.2)' : 'rgba(255, 180, 171, 0.2)', 
                borderColor: isDark ? 'rgba(147, 0, 10, 0.4)' : 'rgba(255, 180, 171, 0.4)' 
              }}
            >
              <MaterialIcons name="error-outline" size={20} color="#ffb4ab" />
              <Text className="font-body-base flex-1 font-bold" style={{ color: isDark ? '#ffb4ab' : '#93000a' }}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form Container (Glass panel in dark mode, pure white card in light mode) */}
          <BlurView 
            intensity={isDark ? 70 : 0} 
            tint={isDark ? "dark" : "light"} 
            className="rounded-xl overflow-hidden p-4 flex flex-col gap-3 border" 
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
              borderColor: colors.border
            }}
          >

            {/* Full Name */}
            <View className="flex flex-col gap-1">
              <Text className="font-label-caps text-[11px] uppercase" style={{ color: colors.textMuted }}>
                Full Name
              </Text>
              <View className="relative justify-center">
                <MaterialIcons name="person" size={18} color={colors.textMuted} style={{ position: 'absolute', left: 16, zIndex: 1 }} />
                <TextInput
                  className="w-full h-[42px] rounded-lg pl-12 pr-4 text-[14px] border"
                  style={{ borderColor: colors.border, color: colors.text }}
                  placeholder="John Doe"
                  placeholderTextColor={isDark ? 'rgba(203, 195, 215, 0.4)' : 'rgba(94, 96, 100, 0.5)'}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Username */}
            <View className="flex flex-col gap-1">
              <Text className="font-label-caps text-[11px] uppercase" style={{ color: colors.textMuted }}>
                Username
              </Text>
              <View className="relative justify-center">
                <MaterialIcons name="alternate-email" size={18} color={colors.textMuted} style={{ position: 'absolute', left: 16, zIndex: 1 }} />
                <TextInput
                  className="w-full h-[42px] rounded-lg pl-12 pr-4 text-[14px] border"
                  style={{ borderColor: colors.border, color: colors.text }}
                  placeholder="johndoe"
                  placeholderTextColor={isDark ? 'rgba(203, 195, 215, 0.4)' : 'rgba(94, 96, 100, 0.5)'}
                  value={username}
                  onChangeText={(val) => setUsername(val.toLowerCase().trim())}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Date of Birth Trigger */}
            <View className="flex flex-col gap-1">
              <Text className="font-label-caps text-[11px] uppercase" style={{ color: colors.textMuted }}>
                Date of Birth
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View pointerEvents="none" className="relative justify-center">
                  <MaterialIcons name="calendar-today" size={18} color={colors.textMuted} style={{ position: 'absolute', left: 16, zIndex: 1 }} />
                  <TextInput
                    className="w-full h-[42px] rounded-lg pl-12 pr-4 text-[14px] border"
                    style={{ borderColor: colors.border, color: colors.text }}
                    placeholder="Select Date of Birth"
                    placeholderTextColor={isDark ? 'rgba(203, 195, 215, 0.4)' : 'rgba(94, 96, 100, 0.5)'}
                    value={dob ? dob : ''}
                    editable={false}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Email Address */}
            <View className="flex flex-col gap-1">
              <Text className="font-label-caps text-[11px] uppercase" style={{ color: colors.textMuted }}>
                Email Address
              </Text>
              <View className="relative justify-center">
                <MaterialIcons name="mail" size={18} color={colors.textMuted} style={{ position: 'absolute', left: 16, zIndex: 1 }} />
                <TextInput
                  className="w-full h-[42px] rounded-lg pl-12 pr-4 text-[14px] border"
                  style={{ borderColor: colors.border, color: colors.text }}
                  placeholder="athlete@fitsync.pro"
                  placeholderTextColor={isDark ? 'rgba(203, 195, 215, 0.4)' : 'rgba(94, 96, 100, 0.5)'}
                  value={email}
                  onChangeText={(val) => setEmail(val.toLowerCase().trim())}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View className="flex flex-col gap-1">
              <Text className="font-label-caps text-[11px] uppercase" style={{ color: colors.textMuted }}>
                Password
              </Text>
              <View className="relative justify-center">
                <MaterialIcons name="lock" size={18} color={colors.textMuted} style={{ position: 'absolute', left: 16, zIndex: 1 }} />
                <TextInput
                  className="w-full h-[42px] rounded-lg pl-12 pr-12 text-[14px] border"
                  style={{ borderColor: colors.border, color: colors.text }}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? 'rgba(203, 195, 215, 0.4)' : 'rgba(94, 96, 100, 0.5)'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  className="absolute right-4 z-10"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="w-full h-[48px] rounded-xl mt-3 flex-row items-center justify-center gap-2"
              style={{ backgroundColor: colors.primary }}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text className="text-[16px] font-bold" style={{ color: colors.onPrimary }}>
                {isLoading ? 'Creating...' : 'Create Account'}
              </Text>
              {!isLoading && <MaterialIcons name="arrow-forward" size={20} color={colors.onPrimary} />}
            </TouchableOpacity>
          </BlurView>

          {/* Secondary Action */}
          <View className="items-center mt-stack-sm flex-row justify-center">
            <Text className="font-body-base text-body-base" style={{ color: colors.textMuted }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="font-bold" style={{ color: colors.primary }}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* Slide-up Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/60 justify-end"
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View 
            className="border-t rounded-t-[32px] p-6 max-h-[70%] flex flex-col gap-6"
            style={{ 
              backgroundColor: colors.card, 
              borderTopColor: colors.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 20
            }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center pb-2 border-b" style={{ borderBottomColor: colors.border }}>
              <Text className="text-[20px] font-bold font-headline-md" style={{ color: colors.text }}>
                Select Date of Birth
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <MaterialIcons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Picker Columns */}
            <View className="flex-row gap-4 h-[240px]">
              
              {/* Day Column */}
              <View className="flex-1 flex flex-col gap-2">
                <Text className="text-center font-label-caps text-label-caps text-[12px] uppercase tracking-wider font-bold" style={{ color: colors.textMuted }}>
                  Day
                </Text>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  className="rounded-xl border"
                  style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', borderColor: colors.border }}
                >
                  {Array.from({ length: getDaysInMonth(selMonth, selYear) }, (_, i) => i + 1).map((d) => (
                    <TouchableOpacity 
                      key={d} 
                      className="py-3 items-center"
                      style={{ 
                        backgroundColor: selDay === d ? (isDark ? 'rgba(208, 188, 255, 0.25)' : 'rgba(109, 59, 215, 0.15)') : 'transparent',
                        borderVerticalColor: selDay === d ? colors.primary : 'transparent',
                        borderVerticalWidth: selDay === d ? 1 : 0
                      }}
                      onPress={() => setSelDay(d)}
                    >
                      <Text className="text-[16px]" style={{ color: selDay === d ? colors.primary : colors.textMuted, fontWeight: selDay === d ? 'bold' : 'normal' }}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Column */}
              <View className="flex-[1.5] flex flex-col gap-2">
                <Text className="text-center font-label-caps text-label-caps text-[12px] uppercase tracking-wider font-bold" style={{ color: colors.textMuted }}>
                  Month
                </Text>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  className="rounded-xl border"
                  style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', borderColor: colors.border }}
                >
                  {months.map((m, idx) => (
                    <TouchableOpacity 
                      key={m} 
                      className="py-3 items-center"
                      style={{ 
                        backgroundColor: selMonth === idx ? (isDark ? 'rgba(208, 188, 255, 0.25)' : 'rgba(109, 59, 215, 0.15)') : 'transparent',
                        borderVerticalColor: selMonth === idx ? colors.primary : 'transparent',
                        borderVerticalWidth: selMonth === idx ? 1 : 0
                      }}
                      onPress={() => {
                        setSelMonth(idx);
                        const maxDays = getDaysInMonth(idx, selYear);
                        if (selDay > maxDays) {
                          setSelDay(maxDays);
                        }
                      }}
                    >
                      <Text className="text-[16px]" style={{ color: selMonth === idx ? colors.primary : colors.textMuted, fontWeight: selMonth === idx ? 'bold' : 'normal' }}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Column */}
              <View className="flex-1 flex flex-col gap-2">
                <Text className="text-center font-label-caps text-label-caps text-[12px] uppercase tracking-wider font-bold" style={{ color: colors.textMuted }}>
                  Year
                </Text>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  className="rounded-xl border"
                  style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', borderColor: colors.border }}
                >
                  {years.map((y) => (
                    <TouchableOpacity 
                      key={y} 
                      className="py-3 items-center"
                      style={{ 
                        backgroundColor: selYear === y ? (isDark ? 'rgba(208, 188, 255, 0.25)' : 'rgba(109, 59, 215, 0.15)') : 'transparent',
                        borderVerticalColor: selYear === y ? colors.primary : 'transparent',
                        borderVerticalWidth: selYear === y ? 1 : 0
                      }}
                      onPress={() => {
                        setSelYear(y);
                        const maxDays = getDaysInMonth(selMonth, y);
                        if (selDay > maxDays) {
                          setSelDay(maxDays);
                        }
                      }}
                    >
                      <Text className="text-[16px]" style={{ color: selYear === y ? colors.primary : colors.textMuted, fontWeight: selYear === y ? 'bold' : 'normal' }}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row gap-4 mt-2">
              <TouchableOpacity 
                className="flex-1 h-[50px] border rounded-[12px] items-center justify-center"
                style={{ borderColor: colors.border }}
                onPress={() => setShowDatePicker(false)}
              >
                <Text className="font-bold text-[16px]" style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 h-[50px] rounded-[12px] items-center justify-center"
                style={{ backgroundColor: colors.primary }}
                onPress={() => {
                  const formattedDate = `${selYear}-${String(selMonth + 1).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`;
                  setDob(formattedDate);
                  setShowDatePicker(false);
                }}
              >
                <Text className="font-bold text-[16px]" style={{ color: colors.onPrimary }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}
