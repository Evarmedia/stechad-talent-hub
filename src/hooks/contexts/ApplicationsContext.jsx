import { createContext, useContext, useState } from "react";
import apiService from "../../services/apiService.js";

const ApplicationsContext = createContext();

export const ApplicationsProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const getApplications = async (filters = {}) => {
    setLoading(true);
    try {
      
      let params = {};

      if (filters.jobId) {
        params.jobId = filters.jobId;
      }
      if (filters.engineerId) {
        params.engineerId = filters.engineerId;
      }
      if (filters.status) {
        params.status = filters.status;
      }

      const filteredApplications = await apiService.get(
        "applications",
        null,
        params
      );
      setApplications(filteredApplications);
      return filteredApplications;
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getApplicationsByJobId = async (jobId) => {
    setLoading(true);
    try {
      
      const applications = await apiService.get("applications", null, {
        jobId,
      });
      setApplications(applications);
      return applications;
    } catch (error) {
      console.error("Error fetching applications by job ID:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (applicationData) => {
    setLoading(true);
    try {
      
      const newApplication = {
        ...applicationData,
        appliedDate: new Date().toISOString().split("T")[0],
      };
      const createdApplication = await apiService.post(
        "applications",
        newApplication
      );
      setApplications((prev) => [createdApplication, ...prev]);
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
      
      const updatedApplication = await apiService.patch(
        "applications",
        id,
        updateData
      );
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? updatedApplication : a))
      );
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
      setApplications((prev) => prev.filter((a) => a.id !== id));
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
