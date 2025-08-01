
import React, { createContext, useContext, useState } from 'react';
import apiService from '../../services/apiService.js';

const ProjectManagersContext = createContext();

export const ProjectManagersProvider = ({ children }) => {
  const [projectManagers, setProjectManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getProjectManagers = async () => {
    setLoading(true);
    try {
      await apiService.simulateDelay();
      const managers = await apiService.get('projectManagers');
      setProjectManagers(managers);
      return managers;
    } catch (error) {
      console.error('Error fetching project managers:', error);
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
