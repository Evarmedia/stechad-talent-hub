
import React, { createContext, useContext, useState } from 'react';
import { mockJobs, simulateDelay, generateId } from '../../data/mockData.js';

const JobsContext = createContext();

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState(mockJobs);
  const [loading, setLoading] = useState(false);

  const getJobs = async (filters = {}) => {
    setLoading(true);
    await simulateDelay();
    let filteredJobs = [...jobs];
    
    if (filters.remote !== undefined) {
      filteredJobs = filteredJobs.filter(j => j.remote === filters.remote);
    }
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
    
    setLoading(false);
    return filteredJobs;
  };

  const getJobById = async (id) => {
    await simulateDelay(200);
    return jobs.find(j => j.id === id);
  };

  const createJob = async (jobData) => {
    setLoading(true);
    await simulateDelay();
    const newJob = { ...jobData, id: generateId(), applications: 0 };
    setJobs(prev => [newJob, ...prev]);
    setLoading(false);
    return newJob;
  };

  const updateJob = async (id, updateData) => {
    setLoading(true);
    await simulateDelay();
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updateData } : j));
    setLoading(false);
  };

  const deleteJob = async (id) => {
    setLoading(true);
    await simulateDelay();
    setJobs(prev => prev.filter(j => j.id !== id));
    setLoading(false);
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
