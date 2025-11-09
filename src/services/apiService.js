const BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
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

  async post(resource, data) {
    return this.request(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(resource, id, data) {
    return this.request(`/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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
}

export const apiService = new ApiService();
export default apiService;
