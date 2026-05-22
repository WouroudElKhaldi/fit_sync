import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: 'USER' | 'TRAINER';
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  bio?: string;
  trainer?: {
    id: string;
    fullName: string;
    bio: string;
    role: string;
    trainerProfile?: {
      education?: string;
      certifications?: string[];
      specialties?: string[];
      rating?: number;
    };
  };
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (payload: any) => Promise<any>;
  verifyEmail: (email: string, code: string) => Promise<any>;
  sendVerificationCode: (email: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (payload: any) => Promise<any>;
  logout: () => Promise<void>;
  updateUserLocal: (updatedUser: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from AsyncStorage on app mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = await AsyncStorage.getItem('fitsync_token');
        const storedUser = await AsyncStorage.getItem('fitsync_user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to restore auth session:', error);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiService.post('/auth/login', { email, password });
    
    // Save to AsyncStorage
    await AsyncStorage.setItem('fitsync_token', data.token);
    await AsyncStorage.setItem('fitsync_user', JSON.stringify(data.user));
    
    setToken(data.token);
    setUser(data.user);
    
    return data;
  };

  const register = async (payload: any) => {
    // Send register payload to backend
    return await apiService.post('/auth/register', payload);
  };

  const verifyEmail = async (email: string, code: string) => {
    return await apiService.post('/auth/verify', { email, code });
  };

  const sendVerificationCode = async (email: string) => {
    return await apiService.post('/auth/send-verification', { email });
  };

  const forgotPassword = async (email: string) => {
    return await apiService.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (payload: any) => {
    return await apiService.post('/auth/reset-password', payload);
  };

  const logout = async () => {
    try {
      if (user) {
        await apiService.post('/auth/logout', { userId: user.id }).catch(() => null);
      }
    } finally {
      // Always clear local storage and reset states regardless of server response
      await AsyncStorage.removeItem('fitsync_token');
      await AsyncStorage.removeItem('fitsync_user');
      setToken(null);
      setUser(null);
    }
  };

  const updateUserLocal = async (updatedUser: UserProfile) => {
    await AsyncStorage.setItem('fitsync_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        verifyEmail,
        sendVerificationCode,
        forgotPassword,
        resetPassword,
        logout,
        updateUserLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
