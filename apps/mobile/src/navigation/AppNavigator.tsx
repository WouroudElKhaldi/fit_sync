import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyResetCodeScreen from '../screens/VerifyResetCodeScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import WorkoutLoggerScreen from '../screens/WorkoutLoggerScreen';
import WorkoutBuilderScreen from '../screens/WorkoutBuilderScreen';
import WorkoutCalendarScreen from '../screens/WorkoutCalendarScreen';
import ActiveChatScreen from '../screens/ActiveChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AnalyticsDashboardScreen from '../screens/AnalyticsDashboardScreen';
import ChatInboxScreen from '../screens/ChatInboxScreen';
import ExerciseSelectorScreen from '../screens/ExerciseSelectorScreen';
import PostWorkoutSummaryScreen from '../screens/PostWorkoutSummaryScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import TrainerMarketplaceScreen from '../screens/TrainerMarketplaceScreen';
import TrainerProfileScreen from '../screens/TrainerProfileScreen';

import { RootStackParamList, MainTabParamList } from './types';

// 1. Declare Global Types for v7 useNavigation hooks
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 2. Map routes to strictly typed icons
const TAB_ICONS: Record<keyof MainTabParamList, keyof typeof MaterialIcons.glyphMap> = {
  Home: 'home',
  Log: 'fitness-center',
  Analytics: 'bar-chart',
  Market: 'storefront',
  Chat: 'chat-bubble',
};

// 3. Dynamic Light & Dark Theme Definitions
const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#d0bcff',          // primary lavender accent
    background: '#091421',       // deep space dark background
    card: '#16202e',             // elevated dark container surface
    text: '#ffffff',
    border: 'transparent',
    notification: '#ffb4ab',
  },
};

const AppLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6D3BD7',          // vibrant royal purple accent
    background: '#F4F5F7',       // elegant light-gray background
    card: '#FFFFFF',             // bright white elevated card surface
    text: '#1A1C1E',
    border: 'transparent',
    notification: '#ffb4ab',
  },
};

function MainTabNavigator() {
  const { isDark, colors } = useAppTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: isDark ? 0 : 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? '#958ea0' : '#8A8C90',
        tabBarIcon: ({ color, size }) => {
          const iconName = TAB_ICONS[route.name];
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Log" component={WorkoutCalendarScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsDashboardScreen} />
      <Tab.Screen name="Market" component={TrainerMarketplaceScreen} />
      <Tab.Screen name="Chat" component={ChatInboxScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isDark, colors } = useAppTheme();
  
  return (
    <NavigationContainer theme={isDark ? AppDarkTheme : AppLightTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyResetCode" component={VerifyResetCodeScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="WorkoutLogger" component={WorkoutLoggerScreen} />
        <Stack.Screen name="WorkoutBuilder" component={WorkoutBuilderScreen} />
        <Stack.Screen name="ExerciseSelector" component={ExerciseSelectorScreen} />
        <Stack.Screen name="PostWorkoutSummary" component={PostWorkoutSummaryScreen} />
        <Stack.Screen name="ActiveChat" component={ActiveChatScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="TrainerProfile" component={TrainerProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}