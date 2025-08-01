
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Check for stored user session on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('stechad_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('stechad_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    setAuthLoading(true);
    try {
      await apiService.simulateDelay(800);
      const userData = await apiService.login(email, password, role);
      setUser(userData);
      localStorage.setItem('stechad_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (userData) => {
    setAuthLoading(true);
    try {
      await apiService.simulateDelay(1000);
      const newUser = await apiService.signup(userData);
      const userResponse = {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        profileData: newUser.profileData
      };
      setUser(userResponse);
      localStorage.setItem('stechad_user', JSON.stringify(userResponse));
      return userResponse;
    } catch (error) {
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stechad_user');
  };

  const updateProfile = async (profileData) => {
    if (!user) throw new Error('No user logged in');
    
    setAuthLoading(true);
    try {
      await apiService.simulateDelay(500);
      const updatedUser = await apiService.updateProfile(user.id, profileData);
      const userResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        profileData: updatedUser.profileData
      };
      setUser(userResponse);
      localStorage.setItem('stechad_user', JSON.stringify(userResponse));
      return userResponse;
    } catch (error) {
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
