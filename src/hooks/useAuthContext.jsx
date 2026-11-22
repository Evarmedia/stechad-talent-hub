import websocketService from "../services/websocketService";
import { toast } from "@/hooks/use-toast";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import apiService from "../services/apiService.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  const [organizations, setOrganizations] = useState(null);
  const [activeOrganizationId, setActiveOrganizationId] = useState(null);
  const [organizationLoading, setOrganizationLoading] = useState(false);
  const [organizationError, setOrganizationError] = useState("");
  const [tenantVersion, setTenantVersion] = useState(0);
  const sessionRequest = useRef(0);

  const applySession = useCallback((data) => {
    const next = data.user || data;
    if (Array.isArray(data.organizations)) {
      setOrganizations(data.organizations);
      setActiveOrganizationId(data.active_organization_id || null);
      apiService.setOrganization(data.active_organization_id || null);
    }
    setUser(next);
    // Cross-tab storage signals identity changes only; HR authority stays in memory.
    localStorage.setItem("stechad_user", JSON.stringify({ user_id: next.user_id }));
  }, []);

  const selectOrganization = useCallback(async (organizationId) => {
    const request = ++sessionRequest.current;
    setOrganizationLoading(true);
    setOrganizationError("");
    websocketService.disconnect();
    apiService.setOrganization(organizationId);
    setActiveOrganizationId(null);
    setTenantVersion((version) => version + 1);
    try {
      const response = await apiService.get("auth/me");
      if (request === sessionRequest.current) { applySession(response.data); return response; }
    } catch (error) {
      if (request === sessionRequest.current) {
        apiService.setOrganization(null);
        setUser((current) => current && ({ ...current, role: null, role_details: null, effective_permissions: [] }));
        setOrganizationError(error.message || "Could not load this organization. Try again.");
      }
    } finally {
      if (request === sessionRequest.current) setOrganizationLoading(false);
    }
  }, [applySession]);

  useEffect(() => {
    const unavailable = () => { void selectOrganization(null); };
    window.addEventListener("stechad:organization-unavailable", unavailable);
    return () => window.removeEventListener("stechad:organization-unavailable", unavailable);
  }, [selectOrganization]);

  // Check for stored user session on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = apiService.getToken();
      // const storedUser = localStorage.getItem("stechad_user");
      const params = new URLSearchParams(window.location.search);
      const queryToken = params.get("token");
      const isInvitePath = window.location.pathname.startsWith("/accept-invite");

      // Treat ?token as an auth token for OAuth redirects (e.g., Google), but not on invite acceptance
      if (queryToken && !isInvitePath) {
        apiService.setToken(queryToken);
        window.history.replaceState({}, "", window.location.pathname);
      }

      const finalToken = isInvitePath ? token : (queryToken || token);

      if (finalToken) {
        try {
          // Verify token is still valid by fetching current user
          const response = await apiService.get("auth/me");
          if (response.success && response.data) {
            // Support both response shapes:
            // - { success: true, data: { user fields... } }
            // - { success: true, data: { user: {...}, token, ... } }
            applySession(response.data);
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          if (error.status === 401) apiService.clearTokens();
          setUser(null);
          setOrganizationError(error.message || "Could not reconnect. Try again.");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [applySession]);

  // --------------------------
  // GOOGLE LOGIN (REDIRECT FLOW)
  // --------------------------
  const googleLogin = () => {
    // Redirect browser to backend
    // window.location.href = "http://localhost:5000/api/auth/google";
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
  };

  const updateUser = useCallback((updatedUser) => {
    setUser((current) => {
      const next = current?.user_id === updatedUser.user_id ? { ...current, ...updatedUser } : updatedUser;
      localStorage.setItem("stechad_user", JSON.stringify({ user_id: next.user_id }));
      return next;
    });
  }, []);
  const sessionUser = useRef(user?.user_id);
  sessionUser.current = user?.user_id;
  useEffect(() => {
    if (!user?.user_id) return;
    const id = user.user_id;
    let alive = true;
    const refresh = async () => {
      if (!apiService.getToken()) return;
      const request = sessionRequest.current;
      try {
        const response = await apiService.get("auth/me");
        if (alive && sessionUser.current === id && request === sessionRequest.current) {
          const active = response.data.active_organization_id;
          if (organizations !== null && active !== apiService.getOrganization()) {
            websocketService.disconnect();
            setTenantVersion((version) => version + 1);
          }
          applySession(response.data);
        }
      } catch { /* The API interceptor handles revoked sessions; network errors preserve state. */ }
    };
    const off = [websocketService.on("account_updated", refresh), websocketService.on("connection_status", (status) => { if (status === "connected") void refresh(); })];
    const sync = (event) => { if (event.key === "stechad_user") void refresh(); };
    window.addEventListener("focus", refresh); window.addEventListener("storage", sync);
    return () => { alive = false; off.forEach((unsubscribe) => unsubscribe()); window.removeEventListener("focus", refresh); window.removeEventListener("storage", sync); };
  }, [user?.user_id, applySession, organizations !== null]);

  // Direct API call for login
  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      if (apiService.setOrganization) apiService.setOrganization(null);
      const response = await apiService.post("auth/login", { email: email.trim().toLowerCase(), password });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Invalid credentials");
      }

      const { token, refreshToken } = response.data;

      // Store tokens
      apiService.setToken(token);
      if (refreshToken) {
        apiService.setRefreshToken(refreshToken);
      }

      // Store the selected membership projection independently of global identity.
      applySession(response.data);

      return response;
    } catch (error) {
      console.error("Login error:", error.message);
      // Enhanced error message for rate limiting
      if (error.status === 429) {
        throw new Error(
          "Too many login attempts. Please wait a moment and try again.",
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
      const response = await apiService.post("auth/signup", { ...userData, email: userData.email.trim().toLowerCase() });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Error signing up");
      }

      const { user, token, refreshToken } = response.data;

      // Store tokens
      apiService.setToken(token);
      if (refreshToken) {
        apiService.setRefreshToken(refreshToken);
      }

      // Store the selected membership projection independently of global identity.
      applySession(response.data);

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
    sessionRequest.current += 1;
    websocketService.disconnect();
    setOrganizations(null);
    setOrganizationLoading(false);
    setActiveOrganizationId(null);
    setTenantVersion((version) => version + 1);
    try {
      await apiService.post("auth/logout", {});
      console.clear();
      setUser(null);
      apiService.clearTokens();
      localStorage.removeItem("stechad_user");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      apiService.clearTokens();
      localStorage.removeItem("stechad_user");
    }
  };

  const sendOtp = async (email, purpose = "password_reset") => {
    // password_reset or email_verification
    try {
      await apiService.post("auth/send-otp", { email: email.trim().toLowerCase(), purpose });
      toast({
        title: "Verification Code Sent",
        description: "A 6-digit verification code has been sent to your email.",
      });
      return true;
    } catch (error) {
      // console.log("Send OTP error:", error);
      toast({
        title: "Error sending OTP",
        description: error?.message || "Error sending OTP",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resetPassword = async (payload) => {
    const response = await apiService.post("auth/reset-password", payload);
    if (!response.success) throw new Error(response.message || "Password reset failed");
    toast({ title: "Success", description: "Password reset successful! Please log in." });
    return response;
  };

  // Update profile function (role-specific)
  const updateProfile = async (profileData) => {
    if (!user) throw new Error("No user logged in");

    setAuthLoading(true);
    try {
      let endpoint;
      let isFormData = profileData instanceof FormData;

      // Route to correct endpoint based on role
      if (user.role === "talent") {
        endpoint = "talents/profile";
      } else if (user.role === "project_manager") {
        endpoint = "pm/profile";
      } else if (user.role === "staff") {
        endpoint = "staff/profile";
      } else if (user.role === "admin" || user.role === "super_admin") {
        endpoint = "admin/profile";
      } else {
        throw new Error("Invalid user role");
      }

      // console.log("🔄 [updateProfile] Sending profile update to:", endpoint);
      // console.log("🔄 [updateProfile] Is FormData:", isFormData);

      const response = await apiService.request(`/${endpoint}`, {
        method: "PUT",
        data: profileData,
      });

      // console.log("✅ [updateProfile] Response received:", response);

      if (response.success && response.data) {
        const updatedUser = response.data.user;
        // console.log("✅ [updateProfile] Updated user object:", updatedUser);

        // Update auth context
        updateUser(updatedUser);

        // Update tokens if they were returned
        // if (response.data.token) {
        //   localStorage.setItem("stechad_token", response.data.token);
        //   console.log("✅ [updateProfile] Token updated");
        // }
        // if (response.data.refreshToken) {
        //   localStorage.setItem("stechad_refresh_token", response.data.refreshToken);
        // }

        return response;
      }

      return response;
    } catch (error) {
      console.error("❌ [updateProfile] Error:", error);
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

  const isOnboarded = () => {
    return user?.talent?.is_onboarded === true;
  };

  const acceptInvites = async (token, payload) => {
    const response = await apiService.post(`auth/accept-invite/${token}`, payload);
    if (!response.success) throw new Error(response.message || "Failed to accept invitation");
    return response;
  };

  const value = {
    user,
    organizations,
    activeOrganizationId,
    organizationLoading,
    organizationError,
    tenantVersion,
    selectOrganization,
    updateUser,
    loading,
    authLoading,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated,
    hasRole,
    isOnboarded,
    googleLogin,
    sendOtp,
    resetPassword,
    acceptInvites,
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
