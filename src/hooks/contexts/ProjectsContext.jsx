
import React, { createContext, useContext, useState } from 'react';
import { mockProjects, simulateDelay, generateId } from '../../data/mockData.js';

const ProjectsContext = createContext();

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState(mockProjects);
  const [loading, setLoading] = useState(false);

  const getProjects = async (filters = {}) => {
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
  };

  const getProjectById = async (id) => {
    await simulateDelay(200);
    return projects.find(p => p.id === id);
  };

  const createProject = async (projectData) => {
    setLoading(true);
    await simulateDelay();
    const newProject = { ...projectData, id: generateId() };
    setProjects(prev => [newProject, ...prev]);
    setLoading(false);
    return newProject;
  };

  const updateProject = async (id, updateData) => {
    setLoading(true);
    await simulateDelay();
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updateData } : p));
    setLoading(false);
  };

  const deleteProject = async (id) => {
    setLoading(true);
    await simulateDelay();
    setProjects(prev => prev.filter(p => p.id !== id));
    setLoading(false);
  };

  const value = {
    projects,
    loading,
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjectsContext = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider');
  }
  return context;
};
