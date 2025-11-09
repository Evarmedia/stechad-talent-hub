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
    localStorage.removeItem('stechad_user');
  }

  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      const { access_token } = data;
      if (access_token) {
        this.setToken(access_token);
        return access_token;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      window.location.href = '/login';
    }

    return null;
  }

async request(endpoint, options = {}) {
  const url = `${this.baseURL}${endpoint}`;
  let token = this.getToken();

  // If no token is available, attempt to refresh
  if (!token) {
    token = await this.refreshAccessToken();
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Handle FormData - remove Content-Type to let the browser set it with boundary
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);

    // Handle 429 Too Many Requests specifically
    if (response.status === 429) {
      const errorText = await response.text();
      throw {
        status: response.status,
        message: errorText || 'Too many requests. Please try again later.',
        isRateLimit: true
      };
    }

    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/signup') {
      this.clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    // Try to parse as JSON, but fall back to text if it fails
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      // If it's not JSON but we have a successful response, return the text
      if (response.ok) {
        return text;
      }
      // If it's an error and not JSON, throw with the text
      throw {
        status: response.status,
        message: text || 'Request failed',
        isNonJsonError: true
      };
    }

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
    
    // Enhance the error with more context for rate limiting
    if (error.status === 429) {
      error.message = 'Too many login attempts. Please wait a moment and try again.';
    }
    
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
