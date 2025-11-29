import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../../services/apiService.js';

const JobsContext = createContext();

export const JobsProvider = ({ children }) => {
  const token = apiService.getToken(); // ensures only fetch when logged in

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false); // prevents double fetching

  // -----------------------------------------------------
  // FETCH JOBS
  // -----------------------------------------------------
  const getJobs = async (filters = {}) => {
    setLoading(true);
    try {
      let params = {
        page: filters.page,
        limit: filters.limit
      };

      if (filters.remote !== undefined) params.remote = filters.remote;
      if (filters.status) params.status = filters.status;
      if (filters.location) params.location = filters.location;
      if (filters.employment_type) params.employment_type = filters.employment_type;
      if (filters.experience_level) params.experience_level = filters.experience_level;
      if (filters.search) params.search = filters.search;

      if (filters.skills && Array.isArray(filters.skills)) {
        params.skills = filters.skills.join(",");
      }

      const response = await apiService.get('jobs', params );

      const jobsData = response.data.jobs || [];
      setJobs(jobsData);

      return jobsData;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // FETCH ALL JOB DATA ONCE
  // -----------------------------------------------------
  useEffect(() => {
    if (!token || initialized) return;

    const init = async () => {
      setLoading(true);

      const list = await getJobs();
      // console.log("Initialized Jobs:", list);

      setInitialized(true);
      setLoading(false);
    };

    init();
  }, [token]);

  // -----------------------------------------------------
  // OTHER ACTIONS
  // -----------------------------------------------------
  const getJobById = async (id) => {
    try {
      const response = await apiService.get('jobs', id);
      return response.data?.job || response.data;
    } catch (error) {
      console.error("Error fetching job:", error);
      throw error;
    }
  };

  const createJob = async (jobData) => {
    setLoading(true);
    try {
      const response = await apiService.post('pm/jobs', jobData);

      const createdJob = response.data?.job || response.data;

      if (createdJob) {
        setJobs(prev => [createdJob, ...prev]);
      }

      return createdJob;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (id, updateData) => {
    setLoading(true);
    try {
      const response = await apiService.request(`/jobs/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const updatedJob = response.data?.job || response.data;

      if (updatedJob) {
        setJobs(prev =>
          prev.map(j =>
            j.jobs_id === id || j.id === id ? updatedJob : j
          )
        );
      }

      return updatedJob;
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id) => {
    setLoading(true);
    try {
      await apiService.delete('jobs', id);

      setJobs(prev =>
        prev.filter(j => j.jobs_id !== id && j.id !== id)
      );
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // CONTEXT VALUE
  // -----------------------------------------------------
  const value = {
    jobs,
    loading,
    getJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,

    /** re-fetch everything manually if needed */
    refreshAll: async () => {
      setInitialized(false);
    }
  };

  return (
    <JobsContext.Provider value={value}>
      {children}
    </JobsContext.Provider>
  );
};

export const useJobsContext = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error("useJobsContext must be used within a JobsProvider");
  }
  return context;
};
