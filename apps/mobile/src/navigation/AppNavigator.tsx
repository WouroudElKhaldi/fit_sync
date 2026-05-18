import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
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

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  RoleSelection: undefined;
  MainTabs: undefined;
  WorkoutLogger: { planId: string };
  WorkoutBuilder: undefined;
  ExerciseSelector: undefined;
  PostWorkoutSummary: undefined;
  ActiveChat: undefined;
  Settings: undefined;
  TrainerProfile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Log: undefined;
  Analytics: undefined;
  Market: undefined;
  Chat: undefined;
};

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

// 3. New React Navigation v7 Unified Dark Theme System
const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#d0bcff',          // primary color for links/actions
    background: '#091421',       // prevents "white flash" on screen transition
    card: '#16202e',             // surface container for navigation bars
    text: '#ffffff',             // default text colors
    border: 'transparent',       // borders between navigation elements
    notification: '#ffb4ab',
  },
};

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#16202e',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#d0bcff',
        tabBarInactiveTintColor: '#958ea0',
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
  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#091421' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
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