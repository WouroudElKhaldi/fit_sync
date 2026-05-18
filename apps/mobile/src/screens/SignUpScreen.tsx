import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BlurView } from 'expo-blur';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

export default function SignUpScreen({ navigation }: Props) {
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
    if (!password.trim() || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    // 2. Perform mock Sign Up
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      // Successfully created account - redirect to role selection
      navigation.replace('RoleSelection');
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface-dim relative"
    >
      {/* Ambient Background Glow */}
      <View className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <View className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-primary rounded-full opacity-10" style={{ transform: [{ scale: 1.5 }] }} />
        <View className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-tertiary rounded-full opacity-5" style={{ transform: [{ scale: 1.5 }] }} />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        className="z-10"
      >
        <View className="w-full max-w-[400px] align-self-center mx-auto flex flex-col gap-4">

          {/* Logo Header */}
          <View className="items-center flex flex-col gap-1">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
              <MaterialIcons name="person-add" size={20} color="#d0bcff" />
            </View>
            <Text className="font-bold text-[20px] tracking-tight text-primary uppercase">
              Create Account
            </Text>
            <Text className="text-[13px] text-on-surface-variant text-center">
              Join the performance community today.
            </Text>
          </View>

          {/* Error Message Alert */}
          {errorMessage ? (
            <View className="bg-error-container/30 border border-error/30 rounded-xl p-4 flex-row items-center gap-3">
              <MaterialIcons name="error-outline" size={20} color="#ffb4ab" />
              <Text className="text-error font-body-base flex-1">{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form Container */}
          <BlurView 
            intensity={70} 
            tint="dark" 
            className="rounded-xl overflow-hidden p-4 flex flex-col gap-3" 
            style={styles.glassSurface}
          >

            {/* Full Name */}
            <View className="flex flex-col gap-1">
              <Text className="font-label-caps text-[11px] text-on-surface-variant uppercase">
                Full Name
              </Text>
              <View className="relative justify-center">
                <MaterialIcons name="person" size={18} color="#cbc3d7" style={{ position: 'absolute', left: 16, zIndex: 1 }} />
                <TextInput
                  className="w-full h-[42px] rounded-lg pl-12 pr-4 text-[14px] text-on-surface border border-white/20"
                  placeholder="John Doe"
                  placeholderTextColor="rgba(203, 195, 215, 0.5)"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Username */}
            <View className="flex flex-col gap-1">
              <Text className="font-label-caps text-[11px] text-on-surface-variant uppercase">
                Username
              </Text>
              <View className="relative justify-center">
                <MaterialIcons name="alternate-email" size={18} color="#cbc3d7" style={{ position: 'absolute', left: 16, zIndex: 1 }} />
                <TextInput
                  className="w-full h-[42px] rounded-lg pl-12 pr-4 text-[14px] text-on-surface border border-white/20"
                  placeholder="johndoe"
                  placeholderTextColor="rgba(203, 195, 215, 0.5)"
                  value={username}
                  onChangeText={(val) => setUsername(val.toLowerCase().trim())}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Date of Birth Trigger */}
            <View className="flex flex-col gap-1">
              <Text className="font-label-caps text-[11px] text-on-surface-variant uppercase">
                Date of Birth
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View pointerEvents="none" className="relative justify-center">
                  <MaterialIcons name="calendar-today" size={18} color="#cbc3d7" style={{ position: 'absolute', left: 16, zIndex: 1 }} />
                  <TextInput
                    className="w-full h-[42px] rounded-lg pl-12 pr-4 text-[14px] text-on-surface border border-white/20"
                    placeholder="Select Date of Birth"
                    placeholderTextColor="rgba(203, 195, 215, 0.5)"
                    value={dob ? dob : ''}
                    editable={false}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Email Address */}
            <View className="flex flex-col gap-1">
              <Text className="font-label-caps text-[11px] text-on-surface-variant uppercase">
                Email Address
              </Text>
              <View className="relative justify-center">
                <MaterialIcons name="mail" size={18} color="#cbc3d7" style={{ position: 'absolute', left: 16, zIndex: 1 }} />
                <TextInput
                  className="w-full h-[42px] rounded-lg pl-12 pr-4 text-[14px] text-on-surface border border-white/20"
                  placeholder="athlete@fitsync.pro"
                  placeholderTextColor="rgba(203, 195, 215, 0.5)"
                  value={email}
                  onChangeText={(val) => setEmail(val.toLowerCase().trim())}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View className="flex flex-col gap-1">
              <Text className="font-label-caps text-[11px] text-on-surface-variant uppercase">
                Password
              </Text>
              <View className="relative justify-center">
                <MaterialIcons name="lock" size={18} color="#cbc3d7" style={{ position: 'absolute', left: 16, zIndex: 1 }} />
                <TextInput
                  className="w-full h-[42px] rounded-lg pl-12 pr-12 text-[14px] text-on-surface border border-white/20"
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
                  <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={18} color="#cbc3d7" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="bg-primary w-full h-[48px] rounded-xl mt-3 flex-row items-center justify-center gap-2"
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text className="text-[16px] text-on-primary font-semibold">
                {isLoading ? 'Creating...' : 'Create Account'}
              </Text>
              {!isLoading && <MaterialIcons name="arrow-forward" size={20} color="#3c0091" />}
            </TouchableOpacity>
          </BlurView>

          {/* Secondary Action */}
          <View className="items-center mt-stack-sm flex-row justify-center">
            <Text className="font-body-base text-body-base text-on-surface-variant">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-primary font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
      {/* Beautiful Custom Slide-up Date Picker Modal */}
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
            className="bg-[#16202e] border-t border-white/10 rounded-t-[32px] p-6 max-h-[70%] flex flex-col gap-6"
            style={styles.modalSurface}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center pb-2 border-b border-white/15">
              <Text className="text-[20px] font-bold text-white font-headline-md">
                Select Date of Birth
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <MaterialIcons name="close" size={24} color="#cbc3d7" />
              </TouchableOpacity>
            </View>

            {/* Picker Columns */}
            <View className="flex-row gap-4 h-[240px]">
              
              {/* Day Column */}
              <View className="flex-1 flex flex-col gap-2">
                <Text className="text-center font-label-caps text-label-caps text-on-surface-variant text-[12px] uppercase tracking-wider font-bold">
                  Day
                </Text>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  className="bg-white/5 rounded-xl border border-white/10"
                >
                  {Array.from({ length: getDaysInMonth(selMonth, selYear) }, (_, i) => i + 1).map((d) => (
                    <TouchableOpacity 
                      key={d} 
                      className={`py-3 items-center ${selDay === d ? 'bg-primary/25 border-y border-primary/30' : ''}`}
                      onPress={() => setSelDay(d)}
                    >
                      <Text className={`text-[16px] ${selDay === d ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Column */}
              <View className="flex-[1.5] flex flex-col gap-2">
                <Text className="text-center font-label-caps text-label-caps text-on-surface-variant text-[12px] uppercase tracking-wider font-bold">
                  Month
                </Text>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  className="bg-white/5 rounded-xl border border-white/10"
                >
                  {months.map((m, idx) => (
                    <TouchableOpacity 
                      key={m} 
                      className={`py-3 items-center ${selMonth === idx ? 'bg-primary/25 border-y border-primary/30' : ''}`}
                      onPress={() => {
                        setSelMonth(idx);
                        // Adjust day if selected day exceeds new month's length
                        const maxDays = getDaysInMonth(idx, selYear);
                        if (selDay > maxDays) {
                          setSelDay(maxDays);
                        }
                      }}
                    >
                      <Text className={`text-[16px] ${selMonth === idx ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Column */}
              <View className="flex-1 flex flex-col gap-2">
                <Text className="text-center font-label-caps text-label-caps text-on-surface-variant text-[12px] uppercase tracking-wider font-bold">
                  Year
                </Text>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  className="bg-white/5 rounded-xl border border-white/10"
                >
                  {years.map((y) => (
                    <TouchableOpacity 
                      key={y} 
                      className={`py-3 items-center ${selYear === y ? 'bg-primary/25 border-y border-primary/30' : ''}`}
                      onPress={() => {
                        setSelYear(y);
                        // Adjust day if selected day exceeds new year's month length (e.g. leap year Feb 29)
                        const maxDays = getDaysInMonth(selMonth, y);
                        if (selDay > maxDays) {
                          setSelDay(maxDays);
                        }
                      }}
                    >
                      <Text className={`text-[16px] ${selYear === y ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
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
                className="flex-1 h-[50px] border border-white/20 rounded-[12px] items-center justify-center"
                onPress={() => setShowDatePicker(false)}
              >
                <Text className="text-white font-bold text-[16px]">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 h-[50px] bg-primary rounded-[12px] items-center justify-center"
                onPress={() => {
                  const formattedDate = `${selYear}-${String(selMonth + 1).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`;
                  setDob(formattedDate);
                  setShowDatePicker(false);
                }}
              >
                <Text className="text-on-primary font-bold text-[16px]">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  glassSurface: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalSurface: {
    backgroundColor: '#16202e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  }
});
