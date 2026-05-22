import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const { isDark, toggleTheme, colors } = useAppTheme();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in both email and password fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.toLowerCase().trim(), password);
      // Route verified session to the main dashboards
      navigation.replace('MainTabs');
    } catch (error: any) {
      console.log('Login failed with error:', error);
      
      // Auto routing unverified user to EmailVerification screen
      if (error.code === 'ACCOUNT_NOT_VERIFIED') {
        navigation.replace('EmailVerification', { 
          email: error.email || email.toLowerCase().trim() 
        });
      } else {
        setErrorMessage(error.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 relative items-center justify-center p-margin-mobile"
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

      <View className="w-full max-w-[400px] z-10 flex flex-col gap-stack-lg">
        {/* Logo Header */}
        <View className="items-center mb-2 flex flex-col gap-stack-sm">
          <MaterialIcons name="fitness-center" size={48} color={colors.primary} />
          <Text className="font-display-lg text-display-lg tracking-tighter font-black" style={{ color: colors.primary }}>
            FITSYNC PRO
          </Text>
          <Text className="font-body-base text-body-base font-bold" style={{ color: colors.textMuted }}>
            Elite Performance Tracking
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
            <Text className="font-body-base flex-1 font-bold" style={{ color: isDark ? '#ffb4ab' : '#93000a' }}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* Login Form Container (Glass surface in dark mode, clean white card in light mode) */}
        <BlurView 
          intensity={isDark ? 70 : 0} 
          tint={isDark ? "dark" : "light"} 
          className="rounded-xl overflow-hidden p-6 flex flex-col gap-stack-md border" 
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
            borderColor: colors.border
          }}
        >
          {/* Email Input */}
          <View className="flex flex-col gap-2">
            <Text className="font-label-caps text-label-caps uppercase" style={{ color: colors.textMuted }}>
              Email Address
            </Text>
            <View className="relative justify-center">
              <MaterialIcons name="mail" size={20} color={colors.textMuted} style={{ position: 'absolute', left: 16, zIndex: 1 }} />
              <TextInput
                className="w-full h-touch-target-min rounded-lg pl-12 pr-4 font-body-base text-body-base border"
                style={{ borderColor: colors.border, color: colors.text }}
                placeholder="athlete@fitsync.pro"
                placeholderTextColor={isDark ? 'rgba(203, 195, 215, 0.4)' : 'rgba(94, 96, 100, 0.5)'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="flex flex-col gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="font-label-caps text-label-caps uppercase" style={{ color: colors.textMuted }}>
                Password
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text className="font-label-caps text-label-caps font-bold" style={{ color: colors.primary }}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <View className="relative justify-center">
              <MaterialIcons name="lock" size={20} color={colors.textMuted} style={{ position: 'absolute', left: 16, zIndex: 1 }} />
              <TextInput
                className="w-full h-touch-target-min rounded-lg pl-12 pr-12 font-body-base text-body-base border"
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
                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="w-full h-[48px] rounded-xl mt-4 flex-row items-center justify-center gap-2"
            style={{ backgroundColor: colors.primary }}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-[16px] font-bold" style={{ color: colors.onPrimary }}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <MaterialIcons name="arrow-forward" size={20} color={colors.onPrimary} />
            )}
          </TouchableOpacity>
        </BlurView>

        {/* Secondary Action */}
        <View className="items-center mt-stack-sm flex-row justify-center">
          <Text className="font-body-base text-body-base" style={{ color: colors.textMuted }}>
            New to FitSync Pro?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text className="font-bold" style={{ color: colors.primary }}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
