import { createContext, useContext, useEffect, useState } from "react";
import apiService from "../../services/apiService.js";
import { useAuthContext } from "../useAuthContext.jsx";

const ApplicationsContext = createContext();

export const ApplicationsProvider = ({ children }) => {
  const token = apiService.getToken();
  const { user } = useAuthContext();

  const [applications, setApplications] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [engrApplications, setEngrApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const getApplications = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {};

      if (filters.job_id || filters.jobId) {
        params.job_id = filters.job_id || filters.jobId;
      }
      if (filters.engineer_id || filters.engineerId) {
        params.engineer_id = filters.engineer_id || filters.engineerId;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.page) {
        params.page = filters.page;
      }
      if (filters.limit) {
        params.limit = filters.limit;
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
      const params = {};

      if (filters.job_id) {
        params.job_id = filters.job_id;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.page) {
        params.page = filters.page;
      }
      if (filters.limit) {
        params.limit = filters.limit;
      }

      const response = await apiService.get("engineers/applications", params);
      const applicationsData =
      response.success && response.data ? response.data.applications : [];

      setEngrApplications(applicationsData);
      return applicationsData;
    } catch (error) {
      console.error("Error fetching applications:", error);
      setEngrApplications([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getApplicationsByJobId = async (jobId, filters = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.page) {
        params.page = filters.page;
      }
      if (filters.limit) {
        params.limit = filters.limit;
      }

      const response = await apiService.get(`jobs/${jobId}/applicants`, params);
      const applicationsData =
        response.success && response.data
          ? response.data.applications || response.data
          : [];

      setJobApplications(applicationsData);
      return applicationsData;
    } catch (error) {
      console.error("Error fetching applications by job ID:", error);
      setJobApplications([]);
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
      const response = await apiService.api.put(`/applications/${id}/status`, updateData);

      // The backend returns { success: true, data: { ... } }
      if (response.data && response.data.success) {
        // Update both applications and jobApplications with the new status
        const updatedData = { status: updateData.status };
        
        // Update applications state - preserve all existing data
        setApplications((prev) =>
          prev.map((a) =>
            a.applications_id === id ? { ...a, ...updatedData } : a
          )
        );
        
        // Also update jobApplications state - preserve all existing data
        setJobApplications((prev) =>
          prev.map((a) =>
            a.applications_id === id ? { ...a, ...updatedData } : a
          )
        );
        
        return updatedData;
      }
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
    jobApplications,
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
