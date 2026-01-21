import { toast } from "@/hooks/use-toast";
import { createContext, useContext, useEffect, useState } from "react";
import apiService from "../../services/apiService.js";
import { useAuthContext } from "../useAuthContext.jsx";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const token = apiService.getToken(); // ensures only fetch when logged in
  const { user } = useAuthContext();

  const [adminDashboardData, setAdminDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false); // prevents double fetching

  // ---------------------------
  // FETCH DASHBOARD
  // ---------------------------
  const getAdminDashboard = async () => {
    try {
      const response = await apiService.get(`admin/dashboard`);
      setAdminDashboardData(response.data);
      // console.log('Admin Data from context', response.data);
      return response.data;
    } catch (error) {
      console.error("Admin dashboard fetch error:", error);
      throw error;
    }
  };

  // INVITE PM //
  const inviteProjectManager = async (pmData) => {
    setLoading(true);
    // console.log("Inviting PM with data:", pmData);
    try {
      const response = await apiService.post(
        "admin/project-managers/invite",
        pmData,
      );

      // console.log("Response From PM Invitation", response.message);

      toast({
        title: "Success",
        description:
          response?.message || "Project Manager invited successfully oo",
      });

      return response;
    } catch (error) {
      console.error("Error inviting project manager:", error.message);

      toast({
        title: "Info",
        description:
          error.message ||
          "Failed to invite Project Manager. Please try again.",
      });

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // FETCH ALL DATA ONCE
  // ---------------------------
  useEffect(() => {
    if (!token || !user || initialized) return;

    const init = async () => {
      if (user && user.role == "admin") {
        try {
        setLoading(true);
          // Admin fetch their dashboard ONLY
          await getAdminDashboard();
        } catch (err) {
          console.error("AdminContext init error:", err);
        } finally {
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    init();
  }, [token, user]);

  const resetAdminDashboardState = () => {
    setAdminDashboardData(null);
    setInitialized(false);
    setLoading(false);
  };

  // ---------------------------
  // CONTEXT VALUE
  // ---------------------------
  const value = {
    adminDashboardData,
    loading,
    resetAdminDashboardState,
    refreshAll: async () => {
      setInitialized(false); // allow re-run
    },
    inviteProjectManager,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export const useAdminContext = () => useContext(AdminContext);
