import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
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

// 1. Declare Global Types so useNavigation() is strictly typed across your entire app
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 2. Map routes to strictly typed icons to eliminate TS string warnings
const TAB_ICONS: Record<keyof MainTabParamList, keyof typeof MaterialIcons.glyphMap> = {
  Home: 'home',
  Log: 'fitness-center',
  Analytics: 'bar-chart',
  Market: 'storefront',
  Chat: 'chat-bubble',
};

// 3. Create a custom theme to match your NativeWind background and stop the "white flash"
const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#091421', 
  },
};

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#16202e', // surface-container
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#d0bcff', // primary
        tabBarInactiveTintColor: '#958ea0', // outline
        tabBarIcon: ({ color, size }) => {
          // Look up the exact icon safely from the map
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
          contentStyle: { backgroundColor: '#091421' }, // background
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
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