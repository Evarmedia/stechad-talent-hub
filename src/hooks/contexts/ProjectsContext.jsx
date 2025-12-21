
import { createContext, useContext, useState } from 'react';
import apiService from '../../services/apiService.js';

const ProjectsContext = createContext();

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const getProjects = async (filters = {}) => {
    setLoading(true);
    try {
      let params = {
        page: filters.page || 1,
        limit: filters.limit || 50
      };
      
      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.priority && filters.priority !== 'all') {
        params.priority = filters.priority;
      }
      if (filters.project_manager_id || filters.projectManagerId) {
        params.project_manager_id = filters.project_manager_id || filters.projectManagerId;
      }
      if (filters.engineer_id || filters.engineerId) {
        params.engineer_id = filters.engineer_id || filters.engineerId;
      }
      
      const response = await apiService.get('projects', params);
      const projectsData = response.success && response.data ? 
        response.data.projects || response.data : [];
      
      setProjects(projectsData);
      return projectsData;
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getProjectById = async (id) => {
    try {
      const response = await apiService.get('projects', id);
      return response.success && response.data ? response.data.project || response.data : null;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  };

  const createProject = async (projectData) => {
    setLoading(true);
    try {
      const response = await apiService.post('projects', projectData);
      const createdProject = response.success && response.data ? 
        response.data.project || response.data : null;
      
      if (createdProject) {
        setProjects(prev => [createdProject, ...prev]);
      }
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
      const response = await apiService.request(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      const updatedProject = response.success && response.data ? 
        response.data.project || response.data : null;
      
      if (updatedProject) {
        setProjects(prev => prev.map(p => 
          (p.projects_id === id || p.id === id) ? updatedProject : p
        ));
      }
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
      await apiService.delete('projects', id);
      setProjects(prev => prev.filter(p => p.projects_id !== id && p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const projectStats = async () => {
    setLoading(true);
    try {
      
    } catch (error) {
      
    }
  };

  const resetProjectsState = () => {
    setProjects([]);
    setLoading(false);
  };

  const value = {
    projects,
    loading,
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    projectStats,
    deleteProject,
    resetProjectsState,
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
