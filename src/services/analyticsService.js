import apiService from './apiService';

class AnalyticsService {
  async getUserAnalytics(filters = {}) {
    try {
      let params = {};
      
      if (filters.period) {
        params.period = filters.period;
      }
      if (filters.start_date) {
        params.start_date = filters.start_date;
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
      }

      const response = await apiService.get('analytics/users', null, params);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  async getJobAnalytics(filters = {}) {
    try {
      let params = {};
      
      if (filters.period) {
        params.period = filters.period;
      }
      if (filters.start_date) {
        params.start_date = filters.start_date;
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
      }

      const response = await apiService.get('analytics/jobs', null, params);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error fetching job analytics:', error);
      throw error;
    }
  }

  async getApplicationAnalytics(filters = {}) {
    try {
      let params = {};
      
      if (filters.period) {
        params.period = filters.period;
      }
      if (filters.start_date) {
        params.start_date = filters.start_date;
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
      }

      const response = await apiService.get('analytics/applications', null, params);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error fetching application analytics:', error);
      throw error;
    }
  }

  async getPlatformMetrics(filters = {}) {
    try {
      let params = {};
      
      if (filters.period) {
        params.period = filters.period;
      }
      if (filters.start_date) {
        params.start_date = filters.start_date;
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
      }

      const response = await apiService.get('analytics/platform', null, params);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error fetching platform metrics:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
