import apiService from './apiService';

class UploadService {
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await apiService.uploadFile('/upload/resume', formData);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await apiService.uploadFile('/upload/avatar', formData);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  async deleteFile(userId, fileName, folderName) {
    try {
      const response = await apiService.request('/upload/delete-file', {
        method: 'DELETE',
        body: JSON.stringify({
          user_id: userId,
          fileName,
          folderName
        })
      });
      return response;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

export const uploadService = new UploadService();
export default uploadService;
