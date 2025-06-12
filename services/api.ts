// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../constants/config';

const API = axios.create({
  baseURL: config.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  async (request) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userInfo');
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
      // You might want to trigger a logout action here
    }
    return Promise.reject(error);
  }
);

export default API;