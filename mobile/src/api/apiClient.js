import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// In Expo/React Native development, localhost on Android emulator is 10.0.2.2 or machine IP.
// On Web/iOS simulator it's localhost or 127.0.0.1
const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:5001/api' 
  : 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor to attach Authorization Bearer token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error fetching token from storage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
