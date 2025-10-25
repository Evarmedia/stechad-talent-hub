
const BASE_URL = 'http://localhost:5000';

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
      if (!response.ok) {
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

  // Auth operations
  async login(email, password, role) {
    const users = await this.get('users');
    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      profileData: user.profileData
    };
  }

  async signup(userData) {
    const users = await this.get('users');
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    const newUser = {
      email: userData.email,
      password: userData.password,
      role: userData.role || 'engineer',
      name: userData.name,
      profileData: { 
        ...userData.profileData, 
        isOnboarded: false
      }
    };
    return this.post('users', newUser);
  }

  async updateProfile(userId, profileData) {
    const user = await this.get('users', userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const updatedUser = { 
      ...user, 
      ...profileData,
      profileData: { 
        ...user.profileData, 
        ...profileData.profileData 
      }
    };
    
    return this.put('users', userId, updatedUser);
  }

  // Helper method to simulate delay for smooth transitions
  async simulateDelay(ms = 1500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiService = new ApiService();
export default apiService;
