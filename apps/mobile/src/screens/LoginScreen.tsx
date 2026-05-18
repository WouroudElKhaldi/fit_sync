import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { api } from '../../mocks/api';
import { BlurView } from 'expo-blur';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const userProfile = await api.getUserProfile();
      // Simulate login success
      navigation.replace('MainTabs');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface-dim relative items-center justify-center p-margin-mobile"
    >
      {/* Ambient Background Glow */}
      <View className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <View className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-primary rounded-full opacity-10" style={{ transform: [{ scale: 1.5 }] }} />
        <View className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-tertiary rounded-full opacity-5" style={{ transform: [{ scale: 1.5 }] }} />
      </View>

      <View className="w-full max-w-[400px] z-10 flex flex-col gap-stack-lg">
        {/* Logo Header */}
        <View className="items-center mb-stack-lg flex flex-col gap-stack-sm">
          <MaterialIcons name="fitness-center" size={48} color="#d0bcff" />
          <Text className="font-display-lg text-display-lg tracking-tighter text-primary">
            FITSYNC PRO
          </Text>
          <Text className="font-body-base text-body-base text-on-surface-variant">
            Elite Performance Tracking
          </Text>
        </View>

        {/* Login Form Container */}
        <BlurView 
          intensity={70} 
          tint="dark" 
          className="rounded-xl overflow-hidden p-6 flex flex-col gap-stack-md" 
          style={styles.glassSurface}
        >
          {/* Email Input */}
          <View className="flex flex-col gap-2">
            <Text className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Email Address
            </Text>
            <View className="relative justify-center">
              <MaterialIcons name="mail" size={20} color="#cbc3d7" style={{ position: 'absolute', left: 16, zIndex: 1 }} />
              <TextInput
                className="w-full h-touch-target-min rounded-lg pl-12 pr-4 font-body-base text-body-base text-on-surface border border-white/20"
                placeholder="athlete@fitsync.pro"
                placeholderTextColor="rgba(203, 195, 215, 0.5)"
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
              <Text className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Password
              </Text>
              <TouchableOpacity>
                <Text className="font-label-caps text-label-caps text-primary">Forgot?</Text>
              </TouchableOpacity>
            </View>
            <View className="relative justify-center">
              <MaterialIcons name="lock" size={20} color="#cbc3d7" style={{ position: 'absolute', left: 16, zIndex: 1 }} />
              <TextInput
                className="w-full h-touch-target-min rounded-lg pl-12 pr-12 font-body-base text-body-base text-on-surface border border-white/20"
                placeholder="••••••••"
                placeholderTextColor="rgba(203, 195, 215, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                className="absolute right-4 z-1" 
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#cbc3d7" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
          className="bg-primary w-full h-[48px] rounded-xl mt-4 flex-row items-center justify-center gap-2"
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text className="text-[16px] text-on-primary font-semibold">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Text>
          {!isLoading && <MaterialIcons name="arrow-forward" size={20} color="#3c0091" />}
        </TouchableOpacity>
        </BlurView>

        {/* Secondary Action */}
        <View className="items-center mt-stack-sm flex-row justify-center">
          <Text className="font-body-base text-body-base text-on-surface-variant">
            New to FitSync Pro?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text className="text-primary font-bold">Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  glassSurface: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  }
});
