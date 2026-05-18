import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeColors = {
  background: string;
  card: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  onPrimary: string;
};

export const DarkThemeColors: ThemeColors = {
  background: '#091421',
  card: '#16202e',
  surfaceContainer: '#16202e',
  surfaceContainerHigh: '#212b39',
  text: '#d9e3f6',
  textMuted: '#cbc3d7',
  border: 'rgba(255, 255, 255, 0.1)',
  primary: '#d0bcff',
  onPrimary: '#3c0091',
};

export const LightThemeColors: ThemeColors = {
  background: '#F4F5F7',
  card: '#FFFFFF',
  surfaceContainer: '#FFFFFF',
  surfaceContainerHigh: '#E9EBF0',
  text: '#1A1C1E',
  textMuted: '#5E6064',
  border: 'rgba(0, 0, 0, 0.08)',
  primary: '#6D3BD7',
  onPrimary: '#FFFFFF',
};

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  colors: DarkThemeColors,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme(); // 'dark' or 'light'
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  useEffect(() => {
    // Load theme from AsyncStorage on initial mount
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme_preference');
        if (storedTheme !== null) {
          setIsDark(storedTheme === 'dark');
        } else {
          // Default to system scheme if no custom preference is saved yet
          setIsDark(systemScheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };
    loadTheme();
  }, [systemScheme]);

  const toggleTheme = async () => {
    try {
      const nextDark = !isDark;
      setIsDark(nextDark);
      await AsyncStorage.setItem('theme_preference', nextDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const colors = isDark ? DarkThemeColors : LightThemeColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
