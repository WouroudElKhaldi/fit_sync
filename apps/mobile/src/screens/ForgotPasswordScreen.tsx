import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { isDark, toggleTheme, colors } = useAppTheme();
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRequestCode = async () => {
    setErrorMessage('');
    
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email.toLowerCase().trim());
      navigation.navigate('VerifyResetCode', { email: email.toLowerCase().trim() });
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
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

      {/* Header Bar */}
      <View className="w-full pt-12 z-40 border-b" style={{ backgroundColor: colors.card, borderBottomColor: colors.border }}>
        <View className="flex-row items-center justify-between px-margin-mobile py-4">
          <TouchableOpacity 
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.surfaceContainerHigh }}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text className="font-headline-md text-headline-md tracking-tighter font-black" style={{ color: colors.primary }}>
            Reset Password
          </Text>
          <View className="w-8 h-8" />
        </View>
      </View>

      {/* Ambient Background Glow (Only in Dark Mode) */}
      {isDark && (
        <View className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <View className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-primary rounded-full opacity-10" style={{ transform: [{ scale: 1.5 }] }} />
        </View>
      )}

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        className="z-10"
      >
        <View className="w-full max-w-[400px] align-self-center mx-auto flex flex-col gap-4">
          
          {/* Logo / Icon Header */}
          <View className="items-center flex flex-col gap-1">
            <View 
              className="w-12 h-12 rounded-full items-center justify-center border"
              style={{ backgroundColor: isDark ? 'rgba(208, 188, 255, 0.1)' : 'rgba(109, 59, 215, 0.1)', borderColor: colors.border }}
            >
              <MaterialIcons name="lock-reset" size={26} color={colors.primary} />
            </View>
            <Text className="font-bold text-[20px] tracking-tight uppercase mt-2" style={{ color: colors.primary }}>
              Forgot Password
            </Text>
            <Text className="text-[13px] text-center" style={{ color: colors.textMuted }}>
              Enter your email address below to request a security reset code.
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

          {/* Form Card */}
          <BlurView 
            intensity={isDark ? 70 : 0} 
            tint={isDark ? "dark" : "light"} 
            className="rounded-xl overflow-hidden p-6 flex flex-col gap-4 border" 
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
              borderColor: colors.border
            }}
          >
            {/* Email Field */}
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
                  autoFocus={true}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="w-full h-[48px] rounded-xl mt-2 flex-row items-center justify-center gap-2"
              style={{ backgroundColor: colors.primary }}
              onPress={handleRequestCode}
              disabled={isLoading}
            >
              <Text className="text-[16px] font-bold" style={{ color: colors.onPrimary }}>
                {isLoading ? 'Sending Reset Code...' : 'Send Reset Code'}
              </Text>
              {!isLoading && <MaterialIcons name="send" size={18} color={colors.onPrimary} />}
            </TouchableOpacity>
          </BlurView>

          {/* Bottom Back To Login link */}
          <TouchableOpacity 
            className="items-center mt-2 flex-row justify-center"
            onPress={() => navigation.navigate('Login')}
          >
            <MaterialIcons name="chevron-left" size={20} color={colors.primary} />
            <Text className="font-bold" style={{ color: colors.primary }}>Back to Sign In</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
