
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../data/mockData.js';

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
      const userData = await authAPI.login(email, password, role);
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
      const newUser = await authAPI.signup(userData);
      setUser(newUser);
      localStorage.setItem('stechad_user', JSON.stringify(newUser));
      return newUser;
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
      const updatedUser = await authAPI.updateProfile(user.id, profileData);
      const updatedUserData = {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        profileData: updatedUser.profileData
      };
      setUser(updatedUserData);
      localStorage.setItem('stechad_user', JSON.stringify(updatedUserData));
      return updatedUserData;
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
