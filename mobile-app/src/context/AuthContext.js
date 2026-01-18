// Adapted from web app for mobile
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { ROLES } from '../utils/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const savedToken = await storage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = await storage.getItem(STORAGE_KEYS.USER);

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      console.log('API Response:', response);

      // Backend returns flat structure: { _id, name, email, role, token, ... }
      const token = response.token;

      // Extract user data (everything except token)
      const { token: _, ...userData } = response;
      const user = userData;

      console.log('Extracted data:', { token: !!token, user: user?.role });

      if (!token || !user || !user.role) {
        throw new Error('Invalid response from server');
      }

      await storage.setItem(STORAGE_KEYS.TOKEN, token);
      await storage.setItem(STORAGE_KEYS.USER, user);

      setToken(token);
      setUser(user);

      return { token, user };
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);

      // Backend returns flat structure: { _id, name, email, role, token, ... }
      const token = response.token;
      const { token: _, ...user } = response;

      await storage.setItem(STORAGE_KEYS.TOKEN, token);
      await storage.setItem(STORAGE_KEYS.USER, user);

      setToken(token);
      setUser(user);

      return { token, user };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storage.removeItem(STORAGE_KEYS.TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER);

      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUser = async (userData) => {
    try {
      await storage.setItem(STORAGE_KEYS.USER, userData);
      setUser(userData);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Helper functions
  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === ROLES.ADMIN;
  const isTeacher = user?.role === ROLES.TEACHER;
  const isStudent = user?.role === ROLES.STUDENT;
  const isParent = user?.role === ROLES.PARENT;

  const value = {
    user,
    token,
    loading,
    isLoggingIn,
    setIsLoggingIn,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    isAdmin,
    isTeacher,
    isStudent,
    isParent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

