const BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  getToken() {
    return localStorage.getItem('stechad_token');
  }

  getRefreshToken() {
    return localStorage.getItem('stechad_refresh_token');
  }

  setToken(token) {
    localStorage.setItem('stechad_token', token);
  }

  setRefreshToken(refreshToken) {
    localStorage.setItem('stechad_refresh_token', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('stechad_token');
    localStorage.removeItem('stechad_refresh_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    // Handle FormData - remove Content-Type to let browser set it with boundary
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/signup') {
        this.clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Request failed',
          errors: data.errors || [],
          error: data.error
        };
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Generic CRUD operations
  async get(resource, id = null, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = id
      ? `/${resource}/${id}${queryString ? `?${queryString}` : ''}`
      : `/${resource}${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async post(resource, data, isFormData = false) {
    const options = {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    };
    return this.request(`/${resource}`, options);
  }

  async put(resource, id, data, isFormData = false) {
    const options = {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    };
    return this.request(`/${resource}/${id}`, options);
  }

  async patch(resource, id, data) {
    return this.request(`/${resource}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(resource, id) {
    return this.request(`/${resource}/${id}`, {
      method: 'DELETE',
    });
  }

  // File upload helper
  async uploadFile(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

export const apiService = new ApiService();
export default apiService;
