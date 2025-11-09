
import { createContext, useContext, useState } from 'react';
import apiService from '../../services/apiService.js';

const JobsContext = createContext();

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const getJobs = async (filters = {}) => {
    setLoading(true);
    try {
      let params = {
        page: filters.page || 1,
        limit: filters.limit || 10
      };
      
      if (filters.remote !== undefined) {
        params.remote = filters.remote;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.location) {
        params.location = filters.location;
      }
      if (filters.employment_type) {
        params.employment_type = filters.employment_type;
      }
      if (filters.experience_level) {
        params.experience_level = filters.experience_level;
      }
      if (filters.skills && Array.isArray(filters.skills)) {
        params.skills = filters.skills.join(',');
      }
      if (filters.search) {
        params.search = filters.search;
      }
      
      const response = await apiService.get('jobs', null, params);
      
      const jobsData = response.success && response.data ? response.data.jobs || response.data : [];
      setJobs(jobsData);
      return jobsData;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getJobById = async (id) => {
    try {
      const response = await apiService.get('jobs', id);
      return response.success && response.data ? response.data.job || response.data : null;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  };

  const createJob = async (jobData) => {
    setLoading(true);
    try {
      const response = await apiService.post('pm/jobs', jobData);
      const createdJob = response.success && response.data ? response.data.job || response.data : null;
      
      if (createdJob) {
        setJobs(prev => [createdJob, ...prev]);
      }
      return createdJob;
    } catch (error) {
      console.error('Error creating job:', error);
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
      
      const updatedJob = response.success && response.data ? response.data.job || response.data : null;
      
      if (updatedJob) {
        setJobs(prev => prev.map(j => (j.jobs_id === id || j.id === id) ? updatedJob : j));
      }
      return updatedJob;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id) => {
    setLoading(true);
    try {
      await apiService.delete('jobs', id);
      setJobs(prev => prev.filter(j => j.jobs_id !== id && j.id !== id));
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    jobs,
    loading,
    getJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob
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
    throw new Error('useJobsContext must be used within a JobsProvider');
  }
  return context;
};
