// Mock API service that works with the mockdb.json structure
import mockData from '../../mockdb.json';

class MockApiService {
  constructor() {
    // Initialize with mock data - in a real app this would be loaded from storage
    this.data = { ...mockData };
  }

  async request(endpoint, options = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const method = options.method || 'GET';
    const resource = endpoint.split('/')[1];
    const id = endpoint.split('/')[2];

    try {
      switch (method) {
        case 'GET':
          if (id) {
            const item = this.data[resource]?.find(item => item.id === id || item.id === parseInt(id));
            if (!item) throw new Error(`${resource} with id ${id} not found`);
            return item;
          }
          return this.data[resource] || [];

        case 'POST':
          const newItem = JSON.parse(options.body);
          newItem.id = newItem.id || `${resource}-${Date.now()}`;
          if (!this.data[resource]) this.data[resource] = [];
          this.data[resource].push(newItem);
          return newItem;

        case 'PUT':
          const updateItem = JSON.parse(options.body);
          const index = this.data[resource]?.findIndex(item => item.id === id || item.id === parseInt(id));
          if (index === -1) throw new Error(`${resource} with id ${id} not found`);
          this.data[resource][index] = { ...this.data[resource][index], ...updateItem };
          return this.data[resource][index];

        case 'DELETE':
          const deleteIndex = this.data[resource]?.findIndex(item => item.id === id || item.id === parseInt(id));
          if (deleteIndex === -1) throw new Error(`${resource} with id ${id} not found`);
          const deleted = this.data[resource].splice(deleteIndex, 1);
          return deleted[0];

        default:
          throw new Error(`Method ${method} not supported`);
      }
    } catch (error) {
      console.error(`Mock API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Generic CRUD operations
  async get(resource, id = null, params = {}) {
    const endpoint = id ? `/${resource}/${id}` : `/${resource}`;
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

  async delete(resource, id) {
    return this.request(`/${resource}/${id}`, {
      method: 'DELETE',
    });
  }

  // Auth operations
  async login(email, password, role) {
    const users = this.data.users || [];
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
    const users = this.data.users || [];
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    const newUser = {
      id: Date.now(),
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
  async simulateDelay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiService = new MockApiService();
export default apiService;