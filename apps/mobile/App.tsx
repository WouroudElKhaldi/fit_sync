import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#091421', padding: 24, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#ffb4ab', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Something went wrong.</Text>
          <ScrollView style={{ maxHeight: 300, width: '100%', backgroundColor: '#16202e', borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <Text style={{ color: '#d9e3f6', fontFamily: 'monospace', fontSize: 12 }}>
              {this.state.error?.toString()}
            </Text>
            <Text style={{ color: '#cbc3d7', fontFamily: 'monospace', fontSize: 10, marginTop: 8 }}>
              {this.state.errorInfo?.componentStack}
            </Text>
          </ScrollView>
          <TouchableOpacity 
            onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{ backgroundColor: '#d0bcff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
          >
            <Text style={{ color: '#3c0091', fontWeight: 'bold' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

function MainAppContent() {
  const { isDark } = useAppTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ErrorBoundary>
        <AppNavigator />
      </ErrorBoundary>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}