
import React, { createContext, useContext, useState } from 'react';
import { mockProjectManagers, simulateDelay } from '../../data/mockData.js';

const ProjectManagersContext = createContext();

export const ProjectManagersProvider = ({ children }) => {
  const [projectManagers, setProjectManagers] = useState(mockProjectManagers);
  const [loading, setLoading] = useState(false);

  const getProjectManagers = async () => {
    setLoading(true);
    await simulateDelay();
    setLoading(false);
    return projectManagers;
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
