
import React, { createContext, useContext, useState } from 'react';
import { mockApplications, simulateDelay, generateId } from '../../data/mockData.js';

const ApplicationsContext = createContext();

export const ApplicationsProvider = ({ children }) => {
  const [applications, setApplications] = useState(mockApplications);
  const [loading, setLoading] = useState(false);

  const getApplications = async (filters = {}) => {
    setLoading(true);
    await simulateDelay();
    let filteredApplications = [...applications];
    
    if (filters.jobId) {
      filteredApplications = filteredApplications.filter(a => a.jobId === filters.jobId);
    }
    if (filters.engineerId) {
      filteredApplications = filteredApplications.filter(a => a.engineerId === filters.engineerId);
    }
    if (filters.status) {
      filteredApplications = filteredApplications.filter(a => a.status === filters.status);
    }
    
    setLoading(false);
    return filteredApplications;
  };

  const createApplication = async (applicationData) => {
    setLoading(true);
    await simulateDelay();
    const newApplication = { 
      ...applicationData, 
      id: generateId(), 
      appliedDate: new Date().toISOString().split('T')[0]
    };
    setApplications(prev => [newApplication, ...prev]);
    setLoading(false);
    return newApplication;
  };

  const updateApplication = async (id, updateData) => {
    setLoading(true);
    await simulateDelay();
    setApplications(prev => prev.map(a => a.id === id ? { ...a, ...updateData } : a));
    setLoading(false);
  };

  const deleteApplication = async (id) => {
    setLoading(true);
    await simulateDelay();
    setApplications(prev => prev.filter(a => a.id !== id));
    setLoading(false);
  };

  const value = {
    applications,
    loading,
    getApplications,
    createApplication,
    updateApplication,
    deleteApplication
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
    throw new Error('useApplicationsContext must be used within an ApplicationsProvider');
  }
  return context;
};
