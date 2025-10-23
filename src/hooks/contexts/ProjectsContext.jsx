
import React, { createContext, useContext, useState } from 'react';
import apiService from '../../services/apiService.js';

const ProjectsContext = createContext();

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const getProjects = async (filters = {}) => {
    // setLoading(true);
    try {
      await apiService.simulateDelay();
      let filteredProjects = await apiService.get('projects');
      
      // Apply filters on client side
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
      
      setProjects(filteredProjects);
      return filteredProjects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getProjectById = async (id) => {
    try {
      await apiService.simulateDelay(200);
      return await apiService.get('projects', id);
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  };

  const createProject = async (projectData) => {
    setLoading(true);
    try {
      await apiService.simulateDelay();
      const createdProject = await apiService.post('projects', projectData);
      setProjects(prev => [createdProject, ...prev]);
      return createdProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id, updateData) => {
    setLoading(true);
    try {
      await apiService.simulateDelay();
      const updatedProject = await apiService.patch('projects', id, updateData);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    setLoading(true);
    try {
      await apiService.simulateDelay();
      await apiService.delete('projects', id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    } finally {
      setLoading(false);
    }
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
