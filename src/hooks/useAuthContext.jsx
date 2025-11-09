import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Check for stored user session on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = apiService.getToken();
      const storedUser = localStorage.getItem('stechad_user');
      
      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching current user
          const response = await apiService.get('auth/me');
          if (response.success && response.data) {
            setUser(response.data.user);
            localStorage.setItem('stechad_user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          apiService.clearTokens();
          localStorage.removeItem('stechad_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Direct API call for login
  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const response = await apiService.post('auth/login', { email, password });
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Invalid credentials');
      }

      const { user, token, refreshToken } = response.data;
      
      // Store tokens
      apiService.setToken(token);
      if (refreshToken) {
        apiService.setRefreshToken(refreshToken);
      }
      
      // Store user data
      setUser(user);
      localStorage.setItem('stechad_user', JSON.stringify(user));
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Direct API call for signup
  const signup = async (userData) => {
    setAuthLoading(true);
    try {
      const response = await apiService.post('auth/signup', userData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error signing up');
      }

      const { user, token, refreshToken } = response.data;
      
      // Store tokens
      apiService.setToken(token);
      if (refreshToken) {
        apiService.setRefreshToken(refreshToken);
      }
      
      // Store user data
      setUser(user);
      localStorage.setItem('stechad_user', JSON.stringify(user));
      
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiService.post('auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      apiService.clearTokens();
      localStorage.removeItem('stechad_user');
    }
  };

  // Update profile function (role-specific)
  const updateProfile = async (profileData) => {
    if (!user) throw new Error('No user logged in');

    setAuthLoading(true);
    try {
      let endpoint;
      let isFormData = profileData instanceof FormData;
      
      // Route to correct endpoint based on role
      if (user.role === 'engineer') {
        endpoint = 'engineers/profile';
      } else if (user.role === 'project_manager') {
        endpoint = 'pm/profile';
      } else if (user.role === 'admin') {
        endpoint = 'admin/profile';
      } else {
        throw new Error('Invalid user role');
      }

      const response = await apiService.request(`/${endpoint}`, {
        method: 'PUT',
        body: profileData,
      });

      if (response.success && response.data) {
        const updatedUser = response.data.user || response.data;
        setUser(updatedUser);
        localStorage.setItem('stechad_user', JSON.stringify(updatedUser));
        return response;
      }
      
      return response;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const value = {
    user,
    loading,
    authLoading,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
