import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: 'USER' | 'TRAINER' | 'ADMIN';
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  bio?: string;
  avatar?: string;
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
  logout: () => void;
  updateUserLocal: (updatedUser: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = 'http://localhost:3000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('fitsync_token');
    const storedUser = localStorage.getItem('fitsync_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const apiRequest = async (path: string, body?: any) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const storedToken = token || localStorage.getItem('fitsync_token');
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.message || 'Request failed',
        code: data?.code || null,
        email: data?.email || null,
      };
    }

    return data;
  };

  const login = async (email: string, password: string) => {
    const data = await apiRequest('/auth/login', { email, password });
    localStorage.setItem('fitsync_token', data.token);
    localStorage.setItem('fitsync_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (payload: any) => {
    return await apiRequest('/auth/register', payload);
  };

  const verifyEmail = async (email: string, code: string) => {
    return await apiRequest('/auth/verify', { email, code });
  };

  const sendVerificationCode = async (email: string) => {
    return await apiRequest('/auth/send-verification', { email });
  };

  const forgotPassword = async (email: string) => {
    return await apiRequest('/auth/forgot-password', { email });
  };

  const resetPassword = async (payload: any) => {
    return await apiRequest('/auth/reset-password', payload);
  };

  const logout = () => {
    if (user) {
      apiRequest('/auth/logout', { userId: user.id }).catch(() => null);
    }
    localStorage.removeItem('fitsync_token');
    localStorage.removeItem('fitsync_user');
    setToken(null);
    setUser(null);
  };

  const updateUserLocal = (updatedUser: UserProfile) => {
    localStorage.setItem('fitsync_user', JSON.stringify(updatedUser));
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
