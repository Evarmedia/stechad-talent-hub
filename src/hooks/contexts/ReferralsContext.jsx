import { createContext, useContext, useState } from 'react';
import apiService from '../../services/apiService.js';

const ReferralsContext = createContext();

export const ReferralsProvider = ({ children }) => {
  const [referralData, setReferralData] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);

  const getReferralDashboard = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('referrals/dashboard');
      const data = response.success && response.data ? response.data : null;
      
      setReferralData(data);
      return data;
    } catch (error) {
      console.error('Error fetching referral dashboard:', error);
      setReferralData(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRewards = async (filters = {}) => {
    setLoading(true);
    try {
      let params = {
        page: filters.page || 1,
        limit: filters.limit || 50
      };

      if (filters.status) {
        params.status = filters.status;
      }

      const response = await apiService.get('referrals/rewards', null, params);
      const rewardsData = response.success && response.data ? 
        response.data.rewards || response.data : [];
      
      setRewards(rewardsData);
      return rewardsData;
    } catch (error) {
      console.error('Error fetching rewards:', error);
      setRewards([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const claimRewards = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('referrals/rewards/claim');
      
      if (response.success) {
        // Refresh dashboard data after claiming
        await getReferralDashboard();
        await getRewards();
      }
      
      return response;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getLeaderboard = async (filters = {}) => {
    try {
      let params = {
        page: filters.page || 1,
        limit: filters.limit || 10
      };

      if (filters.period) {
        params.period = filters.period;
      }

      const response = await apiService.get('referrals/leaderboard', null, params);
      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  };

  const value = {
    referralData,
    rewards,
    loading,
    getReferralDashboard,
    getRewards,
    claimRewards,
    getLeaderboard
  };

  return (
    <ReferralsContext.Provider value={value}>
      {children}
    </ReferralsContext.Provider>
  );
};

export const useReferralsContext = () => {
  const context = useContext(ReferralsContext);
  if (!context) {
    throw new Error('useReferralsContext must be used within a ReferralsProvider');
  }
  return context;
};
