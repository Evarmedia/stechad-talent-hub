
import React, { createContext, useContext, useState } from 'react';
import apiService from '../../services/apiService.js';

const JobsContext = createContext();

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const getJobs = async (filters = {}) => {
    setLoading(true);
    try {
      await apiService.simulateDelay();
      let params = {};
      
      if (filters.remote !== undefined) {
        params.remote = filters.remote;
      }
      
      let filteredJobs = await apiService.get('jobs', null, params);
      
      // Apply search and skill filtering on client side
      if (filters.search) {
        filteredJobs = filteredJobs.filter(j => 
          j.title.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      if (filters.skills) {
        filteredJobs = filteredJobs.filter(j => 
          j.skills.some(skill => filters.skills.includes(skill))
        );
      }
      
      setJobs(filteredJobs);
      return filteredJobs;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getJobById = async (id) => {
    try {
      await apiService.simulateDelay(200);
      return await apiService.get('jobs', id);
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  };

  const createJob = async (jobData) => {
    setLoading(true);
    try {
      await apiService.simulateDelay();
      const newJob = { ...jobData, applications: 0 };
      const createdJob = await apiService.post('jobs', newJob);
      setJobs(prev => [createdJob, ...prev]);
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
      await apiService.simulateDelay();
      const updatedJob = await apiService.patch('jobs', id, updateData);
      setJobs(prev => prev.map(j => j.id === id ? updatedJob : j));
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
      await apiService.simulateDelay();
      await apiService.delete('jobs', id);
      setJobs(prev => prev.filter(j => j.id !== id));
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
