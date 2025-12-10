import { createContext, useContext, useEffect, useState } from "react";
import apiService from "../services/apiService.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Check for stored user session on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = apiService.getToken();
      // const storedUser = localStorage.getItem("stechad_user");
      const params = new URLSearchParams(window.location.search);
      const googleToken = params.get("token");

      if (googleToken) {
        apiService.setToken(googleToken);
        window.history.replaceState({}, "", window.location.pathname);
      }

      const finalToken = googleToken || token;

      if (finalToken) {
        try {
          // Verify token is still valid by fetching current user
          const response = await apiService.get("auth/me");
          if (response.success && response.data) {
            // Support both response shapes:
            // - { success: true, data: { user fields... } }
            // - { success: true, data: { user: {...}, token, ... } }
            const userObj = response.data.user || response.data;
            setUser(userObj);
            localStorage.setItem("stechad_user", JSON.stringify(userObj));
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          apiService.clearTokens();
          setUser(null);
          localStorage.removeItem("stechad_user");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // --------------------------
  // GOOGLE LOGIN (REDIRECT FLOW)
  // --------------------------
  const googleLogin = () => {
    // Redirect browser to backend
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  // Direct API call for login
  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const response = await apiService.post("auth/login", { email, password });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Invalid credentials");
      }

      const { token, refreshToken } = response.data;

      // Store tokens
      apiService.setToken(token);
      if (refreshToken) {
        apiService.setRefreshToken(refreshToken);
      }

      // Store user data
      setUser(response.data.user);
      localStorage.setItem("stechad_user", JSON.stringify(response.data.user));

      return response;
    } catch (error) {
      console.error("Login error:", error.message);
      // Enhanced error message for rate limiting
      if (error.status === 429) {
        throw new Error(
          "Too many login attempts. Please wait a moment and try again."
        );
      }
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Direct API call for signup
  const signup = async (userData) => {
    setAuthLoading(true);
    try {
      const response = await apiService.post("auth/signup", userData);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Error signing up");
      }

      const { user, token, refreshToken } = response.data;

      // Store tokens
      apiService.setToken(token);
      if (refreshToken) {
        apiService.setRefreshToken(refreshToken);
      }

      // Store user data
      setUser(response.data.user);
      localStorage.setItem("stechad_user", JSON.stringify(response.data.user));

      return response;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiService.post("auth/logout", {});
      console.clear();
      setUser(null);
      localStorage.clear();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      apiService.clearTokens();
      localStorage.removeItem("stechad_user");
    }
  };

  // Update profile function (role-specific)
  const updateProfile = async (profileData) => {
    if (!user) throw new Error("No user logged in");

    setAuthLoading(true);
    try {
      let endpoint;
      let isFormData = profileData instanceof FormData;

      // Route to correct endpoint based on role
      if (user.role === "engineer") {
        endpoint = "engineers/profile";
      } else if (user.role === "project_manager") {
        endpoint = "pm/profile";
      } else if (user.role === "admin") {
        endpoint = "admin/profile";
      } else {
        throw new Error("Invalid user role");
      }

      const response = await apiService.request(`/${endpoint}`, {
        method: "PUT",
        body: profileData,
      });

      if (response.success && response.data) {
        const updatedUser = response.data.user || response.data;
        setUser(updatedUser);
        localStorage.setItem("stechad_user", JSON.stringify(updatedUser));
        return response;
      }

      return response;
    } catch (error) {
      console.error("Profile update error:", error);
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
    hasRole,
    googleLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
