// services/auth.ts
import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  avatar?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await API.post('/api/auth/login', credentials);
      const { user, token } = response.data;
      
      // Store token and user info
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await API.post('/api/auth/register', credentials);
      const { user, token } = response.data;
      
      // Store token and user info
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      // Clear local storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');
      
      // Optionally call logout endpoint
      try {
        await API.post('/api/auth/logout');
      } catch (error) {
        // Handle logout endpoint error if needed
        console.warn('Logout endpoint error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return null;
      
      // First try to get user from storage
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        
        // Verify token is still valid by calling API
        try {
          const response = await API.get('/api/auth/me');
          return response.data.user || user;
        } catch (error) {
          // If API call fails, clear storage and return null
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('userInfo');
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      console.error('Check authentication error:', error);
      return false;
    }
  },

  // Google OAuth integration
  async googleAuth(googleToken: string): Promise<AuthResponse> {
    try {
      const response = await API.post('/api/auth/google', {
        token: googleToken,
      });
      const { user, token } = response.data;
      
      // Store token and user info
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  },
};