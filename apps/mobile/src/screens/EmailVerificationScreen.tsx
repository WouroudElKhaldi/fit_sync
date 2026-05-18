import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../context/ThemeContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EmailVerification'>;
  route: RouteProp<RootStackParamList, 'EmailVerification'>;
};

export default function EmailVerificationScreen({ navigation, route }: Props) {
  const { isDark, toggleTheme, colors } = useAppTheme();
  const { email } = route.params;

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Timer for resending code
  const [countdown, setCountdown] = useState(30);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleVerifyEmail = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!code.trim() || code.length !== 6) {
      setErrorMessage('Please enter your 6-digit email verification code');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate verification API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      // Show verified modal
      setShowSuccessModal(true);
    } catch (e) {
      setErrorMessage('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // Simulate API resend email code
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('A new verification code has been dispatched.');
      setCountdown(30);
    } catch (e) {
      setErrorMessage('Failed to send code. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalConfirm = () => {
    setShowSuccessModal(false);
    // Proceed to Role Selection step in Sign-up Flow
    navigation.replace('RoleSelection');
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
            Verification
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
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 60, paddingTop: 40 }}
        showsVerticalScrollIndicator={false}
        className="z-10"
      >
        <View className="w-full max-w-[400px] align-self-center mx-auto flex flex-col gap-4">
          
          {/* Header Icon & Title */}
          <View className="items-center flex flex-col gap-1">
            <View 
              className="w-12 h-12 rounded-full items-center justify-center border"
              style={{ backgroundColor: isDark ? 'rgba(208, 188, 255, 0.1)' : 'rgba(109, 59, 215, 0.1)', borderColor: colors.border }}
            >
              <MaterialIcons name="mark-email-read" size={26} color={colors.primary} />
            </View>
            <Text className="font-bold text-[20px] tracking-tight uppercase mt-2" style={{ color: colors.primary }}>
              Verify Your Email
            </Text>
            <Text className="text-[13px] text-center px-4" style={{ color: colors.textMuted }}>
              We sent a 6-digit email confirmation code to: {'\n'}
              <Text className="font-bold text-center" style={{ color: colors.text }}>{email}</Text>
            </Text>
          </View>

          {/* Success messages */}
          {successMessage ? (
            <View 
              className="border rounded-xl p-4 flex-row items-center gap-3"
              style={{ 
                backgroundColor: isDark ? 'rgba(208,188,255,0.1)' : 'rgba(109,59,215,0.1)', 
                borderColor: colors.border
              }}
            >
              <MaterialIcons name="check-circle-outline" size={20} color={colors.primary} />
              <Text className="font-body-base flex-1 font-bold" style={{ color: colors.primary }}>{successMessage}</Text>
            </View>
          ) : null}

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
            {/* Input Field */}
            <View className="flex flex-col gap-2">
              <Text className="font-label-caps text-label-caps uppercase" style={{ color: colors.textMuted }}>
                Verification Code
              </Text>
              <View className="relative justify-center">
                <MaterialIcons name="security" size={20} color={colors.textMuted} style={{ position: 'absolute', left: 16, zIndex: 1 }} />
                <TextInput
                  className="w-full h-touch-target-min rounded-lg pl-12 pr-4 font-body-base text-body-base border text-center font-bold tracking-[8px] text-[18px]"
                  style={{ borderColor: colors.border, color: colors.text }}
                  placeholder="123456"
                  placeholderTextColor={isDark ? 'rgba(203, 195, 215, 0.25)' : 'rgba(94, 96, 100, 0.3)'}
                  value={code}
                  onChangeText={(val) => setCode(val.replace(/[^0-9]/g, '').slice(0, 6))}
                  keyboardType="numeric"
                  maxLength={6}
                  autoFocus={true}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="w-full h-[48px] rounded-xl mt-2 flex-row items-center justify-center gap-2"
              style={{ backgroundColor: colors.primary }}
              onPress={handleVerifyEmail}
              disabled={isLoading}
            >
              <Text className="text-[16px] font-bold" style={{ color: colors.onPrimary }}>
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Text>
              {!isLoading && <MaterialIcons name="check" size={18} color={colors.onPrimary} />}
            </TouchableOpacity>
          </BlurView>

          {/* Resend Code Section */}
          <View className="items-center mt-2 flex-row justify-center gap-1">
            <Text style={{ color: colors.textMuted }} className="font-body-base">
              Didn't receive the code?
            </Text>
            <TouchableOpacity 
              onPress={handleResendCode}
              disabled={countdown > 0 || isLoading}
            >
              <Text className="font-bold" style={{ color: countdown > 0 ? colors.textMuted : colors.primary }}>
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back to Sign Up */}
          <TouchableOpacity 
            className="items-center mt-1 flex-row justify-center"
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="edit" size={16} color={colors.primary} style={{ marginRight: 4 }} />
            <Text className="font-bold text-[14px]" style={{ color: colors.primary }}>Change Registration Email</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Premium Verification Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalConfirm}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <BlurView
            intensity={isDark ? 80 : 0}
            tint={isDark ? "dark" : "light"}
            style={{
              width: '100%',
              maxWidth: 340,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: isDark ? 'rgba(22, 32, 46, 0.95)' : '#FFFFFF',
              overflow: 'hidden',
              padding: 28,
              alignItems: 'center',
              elevation: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 15
            }}
          >
            {/* Glowing Success Ring */}
            <View 
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: isDark ? 'rgba(208, 188, 255, 0.1)' : 'rgba(109, 59, 215, 0.1)',
                borderColor: colors.primary,
                borderWidth: 2,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20
              }}
            >
              <MaterialIcons name="verified" size={40} color={colors.primary} />
            </View>

            {/* Title */}
            <Text 
              style={{ 
                color: colors.text, 
                fontSize: 22, 
                fontWeight: 'bold', 
                textAlign: 'center',
                marginBottom: 10,
                letterSpacing: -0.5
              }}
            >
              Email Verified!
            </Text>

            {/* Subtitle */}
            <Text 
              style={{ 
                color: colors.textMuted, 
                fontSize: 14, 
                textAlign: 'center', 
                lineHeight: 20,
                marginBottom: 24 
              }}
            >
              Congratulations! Your email has been verified. Let's finish setting up your account so you can start tracking.
            </Text>

            {/* Action Button */}
            <TouchableOpacity
              style={{
                width: '100%',
                height: 48,
                borderRadius: 12,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                gap: 8,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4
              }}
              onPress={handleModalConfirm}
            >
              <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: 'bold' }}>
                Continue Setup
              </Text>
              <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
