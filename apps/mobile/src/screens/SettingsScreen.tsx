import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ConfirmModal } from '../components/ui/Modal';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: Props) {
  const [isMetric, setIsMetric] = useState(true);
  const [height, setHeight] = useState('180');
  const [weight, setWeight] = useState('75.5');
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <View className="flex-1 bg-background">
      {/* Top App Bar */}
      <View className="w-full bg-surface/80 border-b border-white/10 pt-12 z-50">
        <View className="flex-row items-center justify-between px-margin-mobile py-4">
          <TouchableOpacity 
            className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={20} color="#d0bcff" />
          </TouchableOpacity>
          <Text className="font-headline-md text-headline-md tracking-tighter text-primary font-black">
            Settings
          </Text>
          <View className="w-8 h-8 rounded-full bg-surface-container overflow-hidden border border-white/20 items-center justify-center">
            <MaterialIcons name="person" size={20} color="#cbc3d7" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-stack-lg" contentContainerStyle={{ paddingBottom: 100, gap: 24 }}>
        
        {/* Biometrics */}
        <View className="flex-col gap-4">
          <Text className="text-label-caps font-label-caps text-secondary uppercase tracking-wider pl-2">Biometrics</Text>
          <View className="bg-surface-container/30 border border-white/10 rounded-xl p-5 gap-6">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-body-lg font-body-lg text-on-surface">System of Measurement</Text>
                <Text className="text-body-base font-body-base text-on-surface-variant">Imperial (lbs, ft) vs Metric (kg, cm)</Text>
              </View>
              <Switch 
                value={isMetric}
                onValueChange={setIsMetric}
                trackColor={{ false: '#494454', true: '#a078ff' }}
                thumbColor={isMetric ? '#d0bcff' : '#ffffff'}
              />
            </View>
            <View className="h-px bg-white/10 w-full" />
            <View className="gap-2">
              <Text className="text-body-base font-body-base text-on-surface">Height</Text>
              <View className="relative justify-center">
                <TextInput 
                  className="w-full h-12 bg-transparent border border-white/20 rounded-lg pl-4 pr-12 text-numeric-data font-numeric-data text-white"
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
                <Text className="absolute right-4 text-body-base font-body-base text-on-surface-variant">cm</Text>
              </View>
            </View>
            <View className="gap-2">
              <Text className="text-body-base font-body-base text-on-surface">Weight</Text>
              <View className="relative justify-center">
                <TextInput 
                  className="w-full h-12 bg-transparent border border-white/20 rounded-lg pl-4 pr-12 text-numeric-data font-numeric-data text-white"
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
                <Text className="absolute right-4 text-body-base font-body-base text-on-surface-variant">kg</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View className="flex-col gap-4">
          <Text className="text-label-caps font-label-caps text-secondary uppercase tracking-wider pl-2">Preferences</Text>
          <View className="bg-surface-container/30 border border-white/10 rounded-xl p-5 gap-6">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-body-lg font-body-lg text-on-surface">Haptic Feedback</Text>
                <Text className="text-body-base font-body-base text-on-surface-variant">Vibrate on set completion</Text>
              </View>
              <Switch 
                value={hapticEnabled}
                onValueChange={setHapticEnabled}
                trackColor={{ false: '#494454', true: '#a078ff' }}
                thumbColor={hapticEnabled ? '#d0bcff' : '#ffffff'}
              />
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View className="flex-col gap-4 pt-4">
          <TouchableOpacity className="w-full h-12 bg-surface-container-high border border-white/10 rounded-xl flex-row items-center justify-between px-5">
            <Text className="text-body-lg font-body-lg text-on-surface">Export Data</Text>
            <MaterialIcons name="download" size={24} color="#cbc3d7" />
          </TouchableOpacity>
          <TouchableOpacity 
            className="w-full h-12 bg-error/10 border border-error/30 rounded-xl flex-row items-center justify-between px-5"
            onPress={() => setShowDeleteModal(true)}
          >
            <Text className="text-body-lg font-body-lg text-error">Delete Account</Text>
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
