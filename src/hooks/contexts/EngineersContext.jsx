
import React, { createContext, useContext, useState } from 'react';
import { mockEngineers, simulateDelay } from '../../data/mockData.js';

const EngineersContext = createContext();

export const EngineersProvider = ({ children }) => {
  const [engineers, setEngineers] = useState(mockEngineers);
  const [loading, setLoading] = useState(false);

  const getEngineers = async (filters = {}) => {
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
  };

  const getEngineerById = async (id) => {
    await simulateDelay(200);
    return engineers.find(e => e.id === id);
  };

  const updateEngineer = async (id, updateData) => {
    setLoading(true);
    await simulateDelay();
    setEngineers(prev => prev.map(e => e.id === id ? { ...e, ...updateData } : e));
    setLoading(false);
  };

  const deleteEngineer = async (id) => {
    setLoading(true);
    await simulateDelay();
    setEngineers(prev => prev.filter(e => e.id !== id));
    setLoading(false);
  };

  const value = {
    engineers,
    loading,
    getEngineers,
    getEngineerById,
    updateEngineer,
    deleteEngineer
  };

  return (
    <EngineersContext.Provider value={value}>
      {children}
    </EngineersContext.Provider>
  );
};

export const useEngineersContext = () => {
  const context = useContext(EngineersContext);
  if (!context) {
    throw new Error('useEngineersContext must be used within an EngineersProvider');
  }
  return context;
};
