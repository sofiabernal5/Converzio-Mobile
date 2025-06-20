// app/config/api.ts - Updated with proper IP address
import { Platform } from 'react-native';

// Get the computer's IP address for physical device testing
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine
      // For physical Android devices, use your computer's IP
      return 'http://10.134.171.18:3001';
    } else {
      // iOS simulator can use localhost, but physical devices need IP
      // Using IP address works for both simulator and physical device
      return 'http://10.134.171.18:3001';
    }
  } else {
    // Production mode - replace with your production API URL
    return 'https://your-production-api.com';
  }
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to test connectivity
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      //timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

// Export for debugging
export const getDebugInfo = () => ({
  platform: Platform.OS,
  apiUrl: API_BASE_URL,
  isDev: __DEV__,
});