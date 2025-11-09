import apiService from './apiService';

class ExportService {
  async exportEngineers(filters = {}) {
    try {
      let params = {
        format: filters.format || 'csv'
      };
      
      if (filters.fields) {
        params.fields = Array.isArray(filters.fields) ? filters.fields.join(',') : filters.fields;
      }
      if (filters.is_vetted !== undefined) {
        params.is_vetted = filters.is_vetted;
      }
      if (filters.availability) {
        params.availability = filters.availability;
      }
      if (filters.date_from) {
        params.date_from = filters.date_from;
      }
      if (filters.date_to) {
        params.date_to = filters.date_to;
      }

      const response = await apiService.get('export/engineers', null, params);
      
      // Handle file download
      if (response.success && response.data) {
        this.downloadFile(response.data.url || response.data.file, `engineers.${params.format}`);
      }
      
      return response;
    } catch (error) {
      console.error('Error exporting engineers:', error);
      throw error;
    }
  }

  async exportJobs(filters = {}) {
    try {
      let params = {
        format: filters.format || 'csv'
      };
      
      if (filters.fields) {
        params.fields = Array.isArray(filters.fields) ? filters.fields.join(',') : filters.fields;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.posted_by) {
        params.posted_by = filters.posted_by;
      }
      if (filters.date_from) {
        params.date_from = filters.date_from;
      }
      if (filters.date_to) {
        params.date_to = filters.date_to;
      }

      const response = await apiService.get('export/jobs', null, params);
      
      // Handle file download
      if (response.success && response.data) {
        this.downloadFile(response.data.url || response.data.file, `jobs.${params.format}`);
      }
      
      return response;
    } catch (error) {
      console.error('Error exporting jobs:', error);
      throw error;
    }
  }

  async exportApplications(filters = {}) {
    try {
      let params = {
        format: filters.format || 'csv'
      };
      
      if (filters.fields) {
        params.fields = Array.isArray(filters.fields) ? filters.fields.join(',') : filters.fields;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.job_id) {
        params.job_id = filters.job_id;
      }
      if (filters.engineer_id) {
        params.engineer_id = filters.engineer_id;
      }
      if (filters.date_from) {
        params.date_from = filters.date_from;
      }
      if (filters.date_to) {
        params.date_to = filters.date_to;
      }

      const response = await apiService.get('export/applications', null, params);
      
      // Handle file download
      if (response.success && response.data) {
        this.downloadFile(response.data.url || response.data.file, `applications.${params.format}`);
      }
      
      return response;
    } catch (error) {
      console.error('Error exporting applications:', error);
      throw error;
    }
  }

  downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const exportService = new ExportService();
export default exportService;
