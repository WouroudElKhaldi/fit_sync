import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// In React Native / Expo:
// - If running on a physical device via Expo Go, we need the development machine's local IP address.
// - Android Emulator maps host's localhost to 10.0.2.2
// - iOS Simulator connects directly to localhost
const getBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.100:8081"
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

const BASE_URL = getBaseUrl();

export const apiService = {
  /**
   * Helper to perform POST HTTP requests to NestJS Auth backend.
   */
  post: async (path: string, body?: any) => {
    return apiRequest('POST', path, body);
  },

  get: async (path: string) => {
    return apiRequest('GET', path);
  },

  put: async (path: string, body?: any) => {
    return apiRequest('PUT', path, body);
  },

  patch: async (path: string, body?: any) => {
    return apiRequest('PATCH', path, body);
  },

  delete: async (path: string, body?: any) => {
    return apiRequest('DELETE', path, body);
  },
};

// Generic request helper
async function apiRequest(method: string, path: string, body?: any) {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    // Auto-inject JWT token if stored
    const token = await AsyncStorage.getItem('fitsync_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Pass structured backend error payload
      throw {
        status: response.status,
        message: data?.message || 'Network request failed',
        code: data?.code || null,
        email: data?.email || null,
        errors: data?.errors || null,
      };
    }

    return data;
  } catch (error: any) {
    if (error.status) {
      throw error;
    }
    throw {
      message: error.message || 'Unable to connect to the server',
    };
  }
}
