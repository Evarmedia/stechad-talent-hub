
import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  mockEngineers, 
  mockJobs, 
  mockApplications, 
  mockProjects, 
  mockProjectManagers,
  simulateDelay,
  generateId
} from '../data/mockData.js';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [engineers, setEngineers] = useState(mockEngineers);
  const [jobs, setJobs] = useState(mockJobs);
  const [applications, setApplications] = useState(mockApplications);
  const [projects, setProjects] = useState(mockProjects);
  const [projectManagers, setProjectManagers] = useState(mockProjectManagers);
  const [loading, setLoading] = useState(false);

  // Engineers CRUD operations
  const getEngineers = useCallback(async (filters = {}) => {
    setLoading(true);
    await simulateDelay();
    let filteredEngineers = [...engineers];
    
    if (filters.country) {
      filteredEngineers = filteredEngineers.filter(e => e.country === filters.country);
    }
    if (filters.skills) {
      filteredEngineers = filteredEngineers.filter(e => 
        e.skills.some(skill => filters.skills.includes(skill))
      );
    }
    if (filters.isVetted !== undefined) {
      filteredEngineers = filteredEngineers.filter(e => e.isVetted === filters.isVetted);
    }
    
    setLoading(false);
    return filteredEngineers;
  }, [engineers]);

  const getEngineerById = useCallback(async (id) => {
    await simulateDelay(200);
    return engineers.find(e => e.id === id);
  }, [engineers]);

  const updateEngineer = useCallback(async (id, updateData) => {
    setLoading(true);
    await simulateDelay();
    setEngineers(prev => prev.map(e => e.id === id ? { ...e, ...updateData } : e));
    setLoading(false);
  }, []);

  const deleteEngineer = useCallback(async (id) => {
    setLoading(true);
    await simulateDelay();
    setEngineers(prev => prev.filter(e => e.id !== id));
    setLoading(false);
  }, []);

  // Jobs CRUD operations
  const getJobs = useCallback(async (filters = {}) => {
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
  }, [jobs]);

  const getJobById = useCallback(async (id) => {
    await simulateDelay(200);
    return jobs.find(j => j.id === id);
  }, [jobs]);

  const createJob = useCallback(async (jobData) => {
    setLoading(true);
    await simulateDelay();
    const newJob = { ...jobData, id: generateId(), applications: 0 };
    setJobs(prev => [newJob, ...prev]);
    setLoading(false);
    return newJob;
  }, []);

  const updateJob = useCallback(async (id, updateData) => {
    setLoading(true);
    await simulateDelay();
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updateData } : j));
    setLoading(false);
  }, []);

  const deleteJob = useCallback(async (id) => {
    setLoading(true);
    await simulateDelay();
    setJobs(prev => prev.filter(j => j.id !== id));
    setLoading(false);
  }, []);

  // Applications CRUD operations
  const getApplications = useCallback(async (filters = {}) => {
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
  }, [applications]);

  const createApplication = useCallback(async (applicationData) => {
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
  }, []);

  const updateApplication = useCallback(async (id, updateData) => {
    setLoading(true);
    await simulateDelay();
    setApplications(prev => prev.map(a => a.id === id ? { ...a, ...updateData } : a));
    setLoading(false);
  }, []);

  const deleteApplication = useCallback(async (id) => {
    setLoading(true);
    await simulateDelay();
    setApplications(prev => prev.filter(a => a.id !== id));
    setLoading(false);
  }, []);

  // Projects CRUD operations
  const getProjects = useCallback(async (filters = {}) => {
    setLoading(true);
    await simulateDelay();
    let filteredProjects = [...projects];
    
    if (filters.status && filters.status !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.priority === filters.priority);
    }
    
    // Sort projects
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'deadline':
          filteredProjects.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
          break;
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          filteredProjects.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
          break;
        case 'progress':
          filteredProjects.sort((a, b) => b.progress - a.progress);
          break;
        default:
          filteredProjects.sort((a, b) => b.id - a.id);
      }
    }
    
    setLoading(false);
    return filteredProjects;
  }, [projects]);

  const getProjectById = useCallback(async (id) => {
    await simulateDelay(200);
    return projects.find(p => p.id === id);
  }, [projects]);

  const createProject = useCallback(async (projectData) => {
    setLoading(true);
    await simulateDelay();
    const newProject = { ...projectData, id: generateId() };
    setProjects(prev => [newProject, ...prev]);
    setLoading(false);
    return newProject;
  }, []);

  const updateProject = useCallback(async (id, updateData) => {
    setLoading(true);
    await simulateDelay();
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updateData } : p));
    setLoading(false);
  }, []);

  const deleteProject = useCallback(async (id) => {
    setLoading(true);
    await simulateDelay();
    setProjects(prev => prev.filter(p => p.id !== id));
    setLoading(false);
  }, []);

  // Project Managers CRUD operations
  const getProjectManagers = useCallback(async () => {
    setLoading(true);
    await simulateDelay();
    setLoading(false);
    return projectManagers;
  }, [projectManagers]);

  const value = {
    // State
    engineers,
    jobs,
    applications,
    projects,
    projectManagers,
    loading,
    
    // Engineers
    getEngineers,
    getEngineerById,
    updateEngineer,
    deleteEngineer,
    
    // Jobs
    getJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    
    // Applications
    getApplications,
    createApplication,
    updateApplication,
    deleteApplication,
    
    // Projects
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    
    // Project Managers
    getProjectManagers
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
