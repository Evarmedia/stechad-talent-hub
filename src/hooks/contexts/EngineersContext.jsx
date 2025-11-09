
import { createContext, useContext, useState } from 'react';
import apiService from '../../services/apiService.js';

const EngineersContext = createContext();

export const EngineersProvider = ({ children }) => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getEngineers = async (filters = {}) => {
    setLoading(true);
    try {
      
      let params = {};
      
      if (filters.country) {
        params.country = filters.country;
      }
      if (filters.isVetted !== undefined) {
        params.isVetted = filters.isVetted;
      }
      
      let filteredEngineers = await apiService.get('engineers', null, params);
      
      // Apply skill filtering on client side since JSON server has limited query capabilities
      if (filters.skills) {
        filteredEngineers = filteredEngineers.filter(e => 
          e.skills.some(skill => filters.skills.includes(skill))
        );
      }
      
      setEngineers(filteredEngineers);
      return filteredEngineers;
    } catch (error) {
      console.error('Error fetching engineers:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getEngineerById = async (id) => {
    try {
      await apiService.simulateDelay(200);
      return await apiService.get('engineers', id);
    } catch (error) {
      console.error('Error fetching engineer:', error);
      throw error;
    }
  };

  const updateEngineer = async (id, updateData) => {
    setLoading(true);
    try {
      
      const updatedEngineer = await apiService.patch('engineers', id, updateData);
      setEngineers(prev => prev.map(e => e.id === id ? updatedEngineer : e));
      return updatedEngineer;
    } catch (error) {
      console.error('Error updating engineer:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteEngineer = async (id) => {
    setLoading(true);
    try {
      
      await apiService.delete('engineers', id);
      setEngineers(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting engineer:', error);
      throw error;
    } finally {
      setLoading(false);
    }
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
