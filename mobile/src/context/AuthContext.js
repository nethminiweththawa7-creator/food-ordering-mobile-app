import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('user_token');
      const storedUser = await AsyncStorage.getItem('user_data');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data.success) {
        const userData = res.data.data;
        const userToken = userData.token;
        setUser(userData);
        setToken(userToken);
        await AsyncStorage.setItem('user_token', userToken);
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, message: res.data.message || 'Login failed' };
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      const res = await apiClient.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        const userData = res.data.data;
        const userToken = userData.token;
        setUser(userData);
        setToken(userToken);
        await AsyncStorage.setItem('user_token', userToken);
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, message: res.data.message || 'Registration failed' };
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('user_token');
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
