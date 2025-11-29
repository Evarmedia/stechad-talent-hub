import { createContext, useContext, useState, useEffect } from "react";
import apiService from "../../services/apiService.js";
import { useAuthContext } from "../useAuthContext.jsx";

const ApplicationsContext = createContext();

export const ApplicationsProvider = ({ children }) => {
  const token = apiService.getToken();
  const { user } = useAuthContext();

  const [applications, setApplications] = useState([]);
  const [engrApplications, setEngrApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const getApplications = async (filters = {}) => {
    setLoading(true);
    try {
      let params = {
        page: filters.page || 1,
        limit: filters.limit || 10,
      };

      if (filters.job_id || filters.jobId) {
        params.job_id = filters.job_id || filters.jobId;
      }
      if (filters.engineer_id || filters.engineerId) {
        params.engineer_id = filters.engineer_id || filters.engineerId;
      }
      if (filters.status) {
        params.status = filters.status;
      }

      const response = await apiService.get("applications", params);
      const applicationsData =
        response.success && response.data
          ? response.data.applications || response.data
          : [];

      setApplications(applicationsData);
      return applicationsData;
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getEngineersApplication = async (filters = {}) => {
    setLoading(true);
    try {
      let params = {
        page: filters.page,
        limit: filters.limit,
      };

      if (filters.job_id) {
        params.job_id = filters.job_id;
      }

      if (filters.status) {
        params.status = filters.status;
      }

      const response = await apiService.get("engineers/applications", params);
      const applicationsData =
      response.success && response.data ? response.data.applications : [];

      setEngrApplications(applicationsData);
      // console.log("application list from application context", applicationsData)
      return applicationsData;
    } catch (error) {
      console.error("Error fetching applications:", error);
      setEngrApplications([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getApplicationsByJobId = async (jobId) => {
    setLoading(true);
    try {
      const response = await apiService.get(`jobs/${jobId}/applicants`);
      const applicationsData =
        response.success && response.data
          ? response.data.applications || response.data
          : [];

      setApplications(applicationsData);
      return applicationsData;
    } catch (error) {
      console.error("Error fetching applications by job ID:", error);
      setApplications([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (jobId, applicationData = {}) => {
    setLoading(true);
    try {
      const response = await apiService.post(
        `engineers/jobs/${jobId}/apply`,
        applicationData
      );

      const createdApplication =
        response.success && response.data
          ? response.data.application || response.data
          : null;

      if (createdApplication) {
        setApplications((prev) => [createdApplication, ...prev]);
      }
      return createdApplication;
    } catch (error) {
      console.error("Error creating application:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateApplication = async (id, updateData) => {
    setLoading(true);
    try {
      const response = await apiService.request(`/applications/${id}/status`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      const updatedApplication =
        response.success && response.data
          ? response.data.application || response.data
          : null;

      if (updatedApplication) {
        setApplications((prev) =>
          prev.map((a) =>
            a.applications_id === id || a.id === id ? updatedApplication : a
          )
        );
      }
      return updatedApplication;
    } catch (error) {
      console.error("Error updating application:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (id) => {
    setLoading(true);
    try {
      await apiService.delete("applications", id);
      setApplications((prev) =>
        prev.filter((a) => a.applications_id !== id && a.id !== id)
      );
    } catch (error) {
      console.error("Error deleting application:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user || initialized) return;

    const init = async () => {
      setLoading(true);

      try {
        if (user.role === "engineer") {
          // Engineers fetch their dashboard ONLY
          getEngineersApplication();
        }

        if (user.role === "admin" || user.role === "project_manager") {
          // Admins + PMs fetch engineer list ONLY
          await getApplications();
        }
      } catch (err) {
        console.error("Applications Context init error:", err);
      } finally {
        setInitialized(true);
        setLoading(false);
      }
    };

    init();
  }, [token, user]);

  const value = {
    applications,
    engrApplications,
    loading,
    getApplications,
    getEngineersApplication,
    getApplicationsByJobId,
    createApplication,
    updateApplication,
    deleteApplication,
  };

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
};

export const useApplicationsContext = () => {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error(
      "useApplicationsContext must be used within an ApplicationsProvider"
    );
  }
  return context;
};
