import { createContext, useContext, useEffect, useState } from "react";
import apiService from "../../services/apiService.js";
import { useAuthContext } from "../useAuthContext.jsx";

const TalentsContext = createContext();

export const TalentsProvider = ({ children }) => {
  const token = apiService.getToken(); // ensures only fetch when logged in
  const { user } = useAuthContext();

  const [talents, setTalents] = useState([]);
  const [talentDashboardData, setTalentDashboardData] = useState(null);
  const [talentProjects, setTalentProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false); // prevents double fetching

  // ---------------------------
  // FETCH DASHBOARD
  // ---------------------------
  const getTalentDashboard = async () => {
    try {
      const response = await apiService.get(`talents/dashboard`);
      setTalentDashboardData(response.data);
      // console.log('Talent data from context', response.data);
      return response.data;
    } catch (error) {
      console.error("Talent dashboard fetch error:", error);
      throw error;
    }
  };

  // ---------------------------
  // FETCH TALENTS
  // ---------------------------
  const getTalents = async (filters = {}) => {
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

      const response = await apiService.get("talents/all", params);
      const talentsList = response.data?.talents || response.data || [];
      setTalents(talentsList);
      setLoading(false);
      // console.log("Talents fetched", talentsList);
      return talentsList;
    } catch (error) {
      console.error("Error fetching talents:", error);
      setTalents([]);
    } finally {
      setLoading(false);
    }
  };

  const getTalentProjects = async () => {
    try {
      const response = await apiService.get(`talents/projects`);
      setTalentProjects(response.data?.projects);
      return response.data.projects || [];
    } catch (error) {
      console.log("Error Fetching Talent projects", error);
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
        if (user.role === "talent") {
          // Talents fetch their dashboard ONLY
          await getTalentDashboard();
          await getTalentProjects();
        }

        if (user.role === "admin" || user.role === "project_manager") {
          // Admins + PMs fetch talent list ONLY
          await getTalents();
        }
      } catch (err) {
        console.error("TalentsContext init error:", err);
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
  const getTalentById = async (id) => {
    try {
      const response = await apiService.get(`admin/talents/${id}`);
      return response.data?.talent || response.data;
    } catch (error) {
      console.error("Single talent fetch error:", error);
    }
  };

  const updateTalent = async (updateData) => {
    try {
      const response = await apiService.putNoId(
        `admin/talents/toggle-vet`,
        updateData,
      );

      const updated = response.data?.talent || response.data;
      if (updated) {
        setTalents((prev) =>
          prev.map((e) =>
            e.talent_id === updateData.talent_id ? updated : e
          )
        );
      }
      // console.log("Updated Response", updated)
      return updated;
    } catch (error) {
      console.error("Update talent error:", error);
    }
  };

  const deleteTalent = async (id) => {
    try {
      await apiService.delete(`admin/talents`, id);
      setTalents((prev) =>
        prev.filter((e) => e.id !== id && e.talent_id !== id)
      );
    } catch (error) {
      console.error("Delete talent error:", error);
    }
  };

  const resetTalentState = () => {
    setTalents([]);
    setTalentProjects([]);
    setTalentDashboardData(null);
    setInitialized(false);
    setLoading(false);
  };

  // ---------------------------
  // CONTEXT VALUE
  // ---------------------------
  const value = {
    talents,
    talentDashboardData,
    talentProjects,
    loading,
    getTalents,
    getTalentById,
    getTalentProjects,
    updateTalent,
    deleteTalent,
    resetTalentState,
    refreshAll: async () => {
      setInitialized(false); // allow re-run
    },
  };

  return (
    <TalentsContext.Provider value={value}>
      {children}
    </TalentsContext.Provider>
  );
};

export const useTalentsContext = () => useContext(TalentsContext);
