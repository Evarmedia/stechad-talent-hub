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

  // Direct API call for login
  const login = async (email, password, role) => {
    setAuthLoading(true);
    try {
      const response = await apiService.post('auth/login', { email, password, role });
      if (!response) {
        throw new Error('Invalid credentials');
      }
      setUser(response.data.user);
      console.log('USER:',user)
      console.log("response", response)
      localStorage.setItem('stechad_user', JSON.stringify(response.data.user));
      return response;
    } catch (error) {
      console.log({"Login error": error});
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

      console.log("usrInfo:", userData)
      if (!response) {
        throw new Error('Error signing up');
      }
      setUser(response.data.user);
      localStorage.setItem('stechad_user', JSON.stringify(response.data.user));
      return response;
    } catch (error) {
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('stechad_user');
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    if (!user) throw new Error('No user logged in');

    setAuthLoading(true);
    try {
      const updatedUser = await apiService.put('users', user.user_id, profileData);
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
