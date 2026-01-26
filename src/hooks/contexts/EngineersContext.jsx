import { createContext, useContext, useEffect, useState } from "react";
import apiService from "../../services/apiService.js";
import { useAuthContext } from "../useAuthContext.jsx";

const EngineersContext = createContext();

export const EngineersProvider = ({ children }) => {
  const token = apiService.getToken(); // ensures only fetch when logged in
  const { user } = useAuthContext();

  const [engineers, setEngineers] = useState([]);
  const [engrDashboardData, setEngrDashboardData] = useState(null);
  const [engrProjects, setEngrProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false); // prevents double fetching

  // ---------------------------
  // FETCH DASHBOARD
  // ---------------------------
  const getEngrDashboard = async () => {
    try {
      const response = await apiService.get(`engineers/dashboard`);
      setEngrDashboardData(response.data);
      // console.log('Engr Data from context', response.data);
      return response.data;
    } catch (error) {
      console.error("Engineer dashboard fetch error:", error);
      throw error;
    }
  };

  // ---------------------------
  // FETCH ENGINEERS
  // ---------------------------
  const getEngineers = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.country && { country: filters.country }),
        ...(filters.is_vetted !== undefined && {
          is_vetted: filters.is_vetted,
        }),
        ...(filters.is_onboarded !== undefined && {
          is_onboarded: filters.is_onboarded,
        }),
        ...(filters.availability && { availability: filters.availability }),
      };

      const response = await apiService.get("engineers/all", params);
      const engineersList = response.data?.engineers || response.data || [];
      setEngineers(engineersList);
      setLoading(false);
      // console.log("Engineers fetched", engineersList);
      return engineersList;
    } catch (error) {
      console.error("Error fetching engineers:", error);
      setEngineers([]);
    } finally {
      setLoading(false);
    }
  };

  const getEngrProjects = async () => {
    try {
      const response = await apiService.get(`engineers/projects`);
      setEngrProjects(response.data?.projects);
      return response.data.projects || [];
    } catch (error) {
      console.log("Error Fetching Engr Projects", error);
      throw error;
    }
  };

  // ---------------------------
  // FETCH ALL DATA ONCE
  // ---------------------------
  useEffect(() => {
    if (!token || !user || initialized) return;

    const init = async () => {
      setLoading(true);

      try {
        if (user.role === "engineer") {
          // Engineers fetch their dashboard ONLY
          await getEngrDashboard();
          await getEngrProjects();
        }

        if (user.role === "admin" || user.role === "project_manager") {
          // Admins + PMs fetch engineer list ONLY
          await getEngineers();
        }
      } catch (err) {
        console.error("EngineersContext init error:", err);
      } finally {
        setInitialized(true);
        setLoading(false);
      }
    };

    init();
  }, [token, user]);

  // ---------------------------
  // OTHER ACTIONS
  // ---------------------------
  const getEngineerById = async (id) => {
    try {
      const response = await apiService.get(`admin/engineers/${id}`);
      return response.data?.engineer || response.data;
    } catch (error) {
      console.error("Single engineer fetch error:", error);
    }
  };

  const updateEngineer = async (updateData) => {
    try {
      const response = await apiService.putNoId(
        `admin/engineers/toggle-vet`,
        updateData,
      );

      const updated = response.data?.engineer || response.data;
      if (updated) {
        setEngineers((prev) =>
          prev.map((e) =>
            e.engineer_id === updateData.engineer_id ? updated : e
          )
        );
      }
      // console.log("Updated Response", updated)
      return updated;
    } catch (error) {
      console.error("Update engineer error:", error);
    }
  };

  const deleteEngineer = async (id) => {
    try {
      await apiService.delete(`admin/engineers`, id);
      setEngineers((prev) =>
        prev.filter((e) => e.id !== id && e.engineer_id !== id)
      );
    } catch (error) {
      console.error("Delete engineer error:", error);
    }
  };

  const resetEngineerState = () => {
    setEngineers([]);
    setEngrProjects([]);
    setEngrDashboardData(null);
    setInitialized(false);
    setLoading(false);
  };

  // ---------------------------
  // CONTEXT VALUE
  // ---------------------------
  const value = {
    engineers,
    engrDashboardData,
    engrProjects,
    loading,
    getEngineers,
    getEngineerById,
    getEngrProjects,
    updateEngineer,
    deleteEngineer,
    resetEngineerState,
    refreshAll: async () => {
      setInitialized(false); // allow re-run
    },
  };

  return (
    <EngineersContext.Provider value={value}>
      {children}
    </EngineersContext.Provider>
  );
};

export const useEngineersContext = () => useContext(EngineersContext);
