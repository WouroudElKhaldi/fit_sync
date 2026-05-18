import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ActiveChat'>;
};

export default function ActiveChatScreen({ navigation }: Props) {
  const [message, setMessage] = useState('');

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      {/* Top App Bar */}
      <View className="w-full bg-surface/80 border-b border-white/10 pt-12 z-50">
        <View className="flex-row items-center justify-between px-margin-mobile py-4">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color="#d0bcff" />
            </TouchableOpacity>
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-surface-container-high border border-white/10 overflow-hidden">
                <View className="w-full h-full bg-surface-container items-center justify-center">
                  <MaterialIcons name="person" size={24} color="#cbc3d7" />
                </View>
              </View>
              <View>
                <Text className="font-headline-md text-[18px] text-primary tracking-tighter font-bold">Marcus Vance</Text>
                <Text className="font-label-caps text-label-caps text-tertiary uppercase">Elite Strength Coach</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity>
            <MaterialIcons name="more-vert" size={24} color="#d0bcff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Canvas */}
      <ScrollView className="flex-1 px-margin-mobile" contentContainerStyle={{ paddingTop: 16, paddingBottom: 24, gap: 16 }}>
        
        {/* Date Header */}
        <View className="items-center my-2">
          <View className="bg-surface-container/60 border border-white/5 px-4 py-1 rounded-full">
            <Text className="font-label-caps text-label-caps text-on-surface-variant">TODAY</Text>
          </View>
        </View>

        {/* Trainer Message */}
        <View className="flex-row gap-3 max-w-[85%] self-start">
          <View className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 mt-1 items-center justify-center">
             <MaterialIcons name="person" size={20} color="#cbc3d7" />
          </View>
          <View className="flex-col gap-1">
            <View className="bg-surface-container-high px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5">
              <Text className="text-body-base text-on-surface">
                Morning! How are the legs feeling after yesterday's heavy squats?
              </Text>
            </View>
            <Text className="text-[10px] text-on-surface-variant ml-1">08:42 AM</Text>
          </View>
        </View>

        {/* User Message */}
        <View className="flex-row gap-3 max-w-[85%] self-end">
          <View className="flex-col gap-1 items-end">
            <View className="bg-primary px-4 py-3 rounded-2xl rounded-tr-sm">
              <Text className="text-body-base text-on-primary">
                Definitely sore, but it's that good kind of sore. I made sure to stretch and hydrate last night.
              </Text>
            </View>
            <Text className="text-[10px] text-on-surface-variant mr-1">09:15 AM</Text>
          </View>
        </View>

        {/* User Message */}
        <View className="flex-row gap-3 max-w-[85%] self-end -mt-2">
          <View className="flex-col gap-1 items-end">
            <View className="bg-primary px-4 py-3 rounded-2xl rounded-r-sm">
              <Text className="text-body-base text-on-primary">
                Thinking about doing some light cardio today for active recovery. Good idea?
              </Text>
            </View>
            <View className="flex-row items-center gap-1 mr-1">
              <Text className="text-[10px] text-on-surface-variant">09:16 AM</Text>
              <MaterialIcons name="done-all" size={14} color="#d0bcff" />
            </View>
          </View>
        </View>

        {/* Trainer Message */}
        <View className="flex-row gap-3 max-w-[85%] self-start mt-2">
          <View className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 mt-1 items-center justify-center">
             <MaterialIcons name="person" size={20} color="#cbc3d7" />
          </View>
          <View className="flex-col gap-1">
            <View className="bg-surface-container-high px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5">
              <Text className="text-body-base text-on-surface">
                Perfect. 20-30 mins on the assault bike or a brisk walk. Keep HR below 130bpm. Don't push it.
              </Text>
            </View>
            <Text className="text-[10px] text-on-surface-variant ml-1">09:20 AM</Text>
          </View>
        </View>

      </ScrollView>

      {/* Input Area */}
      <View className="bg-surface-container-highest/90 border-t border-white/10 px-margin-mobile py-4 pb-8 flex-row items-center gap-3">
        <TouchableOpacity>
          <MaterialIcons name="add-circle-outline" size={28} color="#958ea0" />
        </TouchableOpacity>
        <View className="flex-1 relative justify-center">
          <TextInput 
            className="w-full h-12 bg-surface text-on-surface border border-white/20 rounded-full pl-4 pr-12 font-body-base"
            placeholder="Message Marcus..."
            placeholderTextColor="#494454"
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity className="absolute right-2 w-8 h-8 bg-primary rounded-full items-center justify-center">
            <MaterialIcons name="send" size={16} color="#3c0091" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
