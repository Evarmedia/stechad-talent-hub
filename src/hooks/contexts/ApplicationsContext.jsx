import { createContext, useContext, useState } from "react";
import apiService from "../../services/apiService.js";

const ApplicationsContext = createContext();

export const ApplicationsProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const getApplications = async (filters = {}) => {
    setLoading(true);
    try {
      let params = {
        page: filters.page || 1,
        limit: filters.limit || 10
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
      const applicationsData = response.success && response.data ? 
        response.data.applications || response.data : [];
      
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

  const getEngineersApplication = async (filters={}) => {
        setLoading(true);
    try {
      let params = {
        page: filters.page || 1,
        limit: filters.limit || 20
      };

      if (filters.job_id) {
        params.job_id = filters.job_id;
      }
      
      if (filters.status) {
        params.status = filters.status;
      }

      const response = await apiService.get("engineers/applications", params);
      const applicationsData = response.success && response.data ? 
        response.data.applications : [];
      
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

  const getApplicationsByJobId = async (jobId) => {
    setLoading(true);
    try {
      const response = await apiService.get(`jobs/${jobId}/applicants`);
      const applicationsData = response.success && response.data ? 
        response.data.applications || response.data : [];
      
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
      
      const createdApplication = response.success && response.data ? 
        response.data.application || response.data : null;
      
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
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      const updatedApplication = response.success && response.data ? 
        response.data.application || response.data : null;
      
      if (updatedApplication) {
        setApplications((prev) =>
          prev.map((a) => (a.applications_id === id || a.id === id ? updatedApplication : a))
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
      setApplications((prev) => prev.filter((a) => a.applications_id !== id && a.id !== id));
    } catch (error) {
      console.error("Error deleting application:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    applications,
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
