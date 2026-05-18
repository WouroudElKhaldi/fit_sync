import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../context/ThemeContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
  route: RouteProp<RootStackParamList, 'ResetPassword'>;
};

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { isDark, toggleTheme, colors } = useAppTheme();
  const { email, code } = route.params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleResetPassword = async () => {
    setErrorMessage('');

    if (!password.trim() || !confirmPassword.trim()) {
      setErrorMessage('Please fill in both password fields');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call for saving the new password
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Show success popup modal
      setShowSuccessModal(true);
    } catch (e) {
      setErrorMessage('Failed to save new password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    // Replace current screens in the stack navigator with Login
    navigation.replace('Login');
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
            New Password
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
              <MaterialIcons name="vpn-key" size={26} color={colors.primary} />
            </View>
            <Text className="font-bold text-[20px] tracking-tight uppercase mt-2" style={{ color: colors.primary }}>
              Create Password
            </Text>
            <Text className="text-[13px] text-center px-4" style={{ color: colors.textMuted }}>
              Set your new password for account: {'\n'}
              <Text className="font-bold" style={{ color: colors.text }}>{email}</Text>
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
            {/* New Password */}
            <View className="flex flex-col gap-2">
              <Text className="font-label-caps text-label-caps uppercase" style={{ color: colors.textMuted }}>
                New Password
              </Text>
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
                  autoFocus={true}
                />
                <TouchableOpacity 
                  className="absolute right-4 z-10" 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm New Password */}
            <View className="flex flex-col gap-2">
              <Text className="font-label-caps text-label-caps uppercase" style={{ color: colors.textMuted }}>
                Confirm New Password
              </Text>
              <View className="relative justify-center">
                <MaterialIcons name="lock" size={20} color={colors.textMuted} style={{ position: 'absolute', left: 16, zIndex: 1 }} />
                <TextInput
                  className="w-full h-touch-target-min rounded-lg pl-12 pr-12 font-body-base text-body-base border"
                  style={{ borderColor: colors.border, color: colors.text }}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? 'rgba(203, 195, 215, 0.4)' : 'rgba(94, 96, 100, 0.5)'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  className="absolute right-4 z-10" 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialIcons name={showConfirmPassword ? "visibility" : "visibility-off"} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="w-full h-[48px] rounded-xl mt-2 flex-row items-center justify-center gap-2"
              style={{ backgroundColor: colors.primary }}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Text className="text-[16px] font-bold" style={{ color: colors.onPrimary }}>
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Text>
              {!isLoading && <MaterialIcons name="save" size={18} color={colors.onPrimary} />}
            </TouchableOpacity>
          </BlurView>
        </View>
      </ScrollView>

      {/* Premium Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessConfirm}
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
              <MaterialIcons name="check-circle" size={40} color={colors.primary} />
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
              Success!
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
              Your security password has been changed successfully. You can now use your new password to sign into your account.
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
              onPress={handleSuccessConfirm}
            >
              <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: 'bold' }}>
                Sign In Now
              </Text>
              <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
