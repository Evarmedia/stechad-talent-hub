
import { createContext, useContext, useState } from 'react';
import apiService from '../../services/apiService.js';

const ProjectManagersContext = createContext();

export const ProjectManagersProvider = ({ children }) => {
  const [projectManagers, setProjectManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getProjectManagers = async (filters = {}) => {
    setLoading(true);
    try {
      let params = {
        page: filters.page || 1,
        limit: filters.limit || 50
      };
      
      if (filters.is_verified !== undefined) {
        params.is_verified = filters.is_verified;
      }
      
      const response = await apiService.get('admin/project-managers', null, params);
      const managersData = response.success && response.data ? 
        response.data.projectManagers || response.data : [];
      
      setProjectManagers(managersData);
      return managersData;
    } catch (error) {
      console.error('Error fetching project managers:', error);
      setProjectManagers([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    projectManagers,
    loading,
    getProjectManagers
  };

  return (
    <ProjectManagersContext.Provider value={value}>
      {children}
    </ProjectManagersContext.Provider>
  );
};

export const useProjectManagersContext = () => {
  const context = useContext(ProjectManagersContext);
  if (!context) {
    throw new Error('useProjectManagersContext must be used within a ProjectManagersProvider');
  }
  return context;
};
