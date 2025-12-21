import { createContext, useContext, useState, useEffect } from "react";
import apiService from "../../services/apiService.js";

import { useAuthContext } from "../useAuthContext.jsx";

const ProjectManagersContext = createContext();

export const ProjectManagersProvider = ({ children }) => {
  const token = apiService.getToken(); // ensures only fetch when logged in
  const { user } = useAuthContext();
  const [projectManagers, setProjectManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pmDashboardData, setPmDashboardData] = useState(null);

  const [initialized, setInitialized] = useState(false); // prevents double fetching

  // ---------------------------
  // FETCH DASHBOARD
  // ---------------------------
  const getPmDashboard = async () => {
    try {
      const response = await apiService.get(`pm/dashboard`);
      setPmDashboardData(response.data);
      setLoading(false);
      // console.log("PM Data from context", response.data);
      return response.data;
    } catch (error) {
      console.error("Project Manager dashboard fetch error:", error);
      setLoading(false);
    }
  };

  const getProjectManagers = async (filters = {}) => {
    setLoading(true);
    try {
      let params = {
        page: filters.page || 1,
        limit: filters.limit || 50,
      };

      if (filters.is_verified !== undefined) {
        params.is_verified = filters.is_verified;
      }

      const response = await apiService.get(
        "admin/project-managers",
        null,
        params
      );
      const managersData =
        response.success && response.data
          ? response.data.projectManagers || response.data
          : [];

      setProjectManagers(managersData);
      return managersData;
    } catch (error) {
      console.error("Error fetching project managers:", error);
      setProjectManagers([]);
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
      setLoading(true);

      try {
        // if (user.role === "engineer") {
        //   // Engineers fetch their dashboard ONLY
        // }
        if (user.role === "project_manager") {
          // PMs fetch Dashboard
          await getPmDashboard();
          setInitialized(true);
          setLoading(false);
        }

        if (user.role === "admin") {
          // Admins fetch pm list ONLY
          await getProjectManagers();
          setInitialized(true);
          setLoading(false);
        }
      } catch (err) {
        console.error("PMContext init error:", err);
      } finally {
        setInitialized(true);
        setLoading(false);
      }
    };

    init();
  }, [token, user, initialized]);

  const value = {
    projectManagers,
    loading,
    pmDashboardData,
    getPmDashboard,
  };

  return (
    <ProjectManagersContext.Provider value={value}>
      {children}
    </ProjectManagersContext.Provider>
  );
};

export const useProjectManagersContext = () => {
  const context = useContext(ProjectManagersContext);
  if (!context) {
    throw new Error(
      "useProjectManagersContext must be used within a ProjectManagersProvider"
    );
  }
  return context;
};
