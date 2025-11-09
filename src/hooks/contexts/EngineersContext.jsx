
import { createContext, useContext, useState } from 'react';
import apiService from '../../services/apiService.js';

const EngineersContext = createContext();

export const EngineersProvider = ({ children }) => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getEngineers = async (filters = {}) => {
    setLoading(true);
    try {
      let params = {
        page: filters.page || 1,
        limit: filters.limit || 50
      };
      
      if (filters.country) {
        params.country = filters.country;
      }
      if (filters.is_vetted !== undefined || filters.isVetted !== undefined) {
        params.is_vetted = filters.is_vetted || filters.isVetted;
      }
      if (filters.is_onboarded !== undefined || filters.is_onboarded !== undefined) {
        params.is_onboarded = filters.is_onboarded || filters.is_onboarded;
      }
      if (filters.availability) {
        params.availability = filters.availability;
      }
      
      const response = await apiService.get('admin/engineers', null, params);
      const engineersData = response.success && response.data ? 
        response.data.engineers || response.data : [];
      
      setEngineers(engineersData);
      return engineersData;
    } catch (error) {
      console.error('Error fetching engineers:', error);
      setEngineers([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getEngineerById = async (id) => {
    try {
      const response = await apiService.get(`admin/engineers/${id}`);
      return response.success && response.data ? response.data.engineer || response.data : null;
    } catch (error) {
      console.error('Error fetching engineer:', error);
      throw error;
    }
  };

  const updateEngineer = async (id, updateData) => {
    setLoading(true);
    try {
      const response = await apiService.request(`/admin/engineers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      const updatedEngineer = response.success && response.data ? 
        response.data.engineer || response.data : null;
      
      if (updatedEngineer) {
        setEngineers(prev => prev.map(e => 
          (e.engineer_id === id || e.id === id) ? updatedEngineer : e
        ));
      }
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
      await apiService.delete(`admin/engineers`, id);
      setEngineers(prev => prev.filter(e => e.engineer_id !== id && e.id !== id));
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
