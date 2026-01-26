import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 🔰 Inject token before every request
    this.api.interceptors.request.use(
      async (config) => {
        let token = this.getToken();

        // If no token, try refreshing
        if (!token) {
          token = await this.refreshAccessToken();
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Handle FormData: don't set Content-Type, let axios handle it
        if (config.data instanceof FormData) {
          delete config.headers["Content-Type"];
        }

        // Clean params BEFORE making the request
        if (config.params) {
          config.params = this.cleanParams(config.params);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // 🔰 Response Interceptor for errors & token expiry
    this.api.interceptors.response.use(
      (response) => response.data,
      async (error) => {
        const originalRequest = error.config || {};
        const url = originalRequest.url || "";
        const isPublicAuthEndpoint = [
          "/auth/login",
          "/auth/signup",
          "/auth/send-otp",
          "/auth/reset-password",
          "/auth/accept-invite",
          "/auth/verify-otp",
        ].some((path) => url.startsWith(path));

        // Token expired → refresh (skip for public auth endpoints)
        if (error.response?.status === 401 && !isPublicAuthEndpoint) {
          if (!originalRequest._retry) {
            originalRequest._retry = true;

            const newToken = await this.refreshAccessToken();
            if (newToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
          }

          this.clearTokens();
          window.location.href = "/login";
          return;
        }

        // Too many requests
        if (error.response?.status === 429) {
          return Promise.reject({
            status: 429,
            message: "Too many requests. Please try again later.",
          });
        }

        // Non-JSON error fallback
        if (!error.response) {
          return Promise.reject({
            message: "Network error. Check your connection.",
          });
        }

        return Promise.reject({
          status: error.response.status,
          message:
            error.response.data?.message ||
            error.response.data?.error ||
            "Request failed",
        });
      }
    );
  }

  // 🔥 Clean undefined, null, empty strings, empty arrays automatically
  cleanParams(params) {
    return Object.fromEntries(
      Object.entries(params).filter(([_, v]) => {
        if (v === undefined || v === null || v === "") return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
      })
    );
  }

  // 🔐 TOKEN HANDLING
  getToken() {
    return localStorage.getItem("stechad_token");
  }

  getRefreshToken() {
    return localStorage.getItem("stechad_refresh_token");
  }

  setToken(token) {
    localStorage.setItem("stechad_token", token);
  }

  setRefreshToken(token) {
    localStorage.setItem("stechad_refresh_token", token);
  }

  clearTokens() {
    localStorage.removeItem("stechad_token");
    localStorage.removeItem("stechad_refresh_token");
    localStorage.removeItem("stechad_user");
  }

  // 🔁 Auto Refresh Token
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await axios.post(`${this.baseURL}/auth/refresh-token`, {
        refresh_token: refreshToken,
      });

      const newToken = res.data?.access_token;
      if (newToken) {
        this.setToken(newToken);
        return newToken;
      }

      return null;
    } catch (err) {
      console.error("Error refreshing token:", err);
      this.clearTokens();
      return null;
    }
  }

  // 🔧 Generic GET request with params
  async get(resource, params = {}, id = null) {
    const endpoint = id ? `/${resource}/${id}` : `/${resource}`;
    return this.api.get(endpoint, { params });
  }

  async post(resource, data, isFormData = false) {
    const config = {
      headers: {},
    };

    // Don't manually set Content-Type for FormData; let axios handle it
    if (isFormData) {
      // axios will automatically set Content-Type: multipart/form-data with boundary
    }

    return this.api.post(`/${resource}`, data, config);
  }

  async put(resource, id, data, isFormData = false) {
    const config = {
      headers: {},
    };

    // Don't manually set Content-Type for FormData; let axios handle it
    if (isFormData) {
      // axios will automatically set Content-Type: multipart/form-data with boundary
    }

    return this.api.put(`/${resource}/${id}`, data, config);
  }

  async putNoId(resource, data, isFormData = false) {
    const config = {
      headers: {},
    };

    // Don't manually set Content-Type for FormData; let axios handle it
    if (isFormData) {
      // axios will automatically set Content-Type: multipart/form-data with boundary
      // so we don't set it here
    }

    return this.api.put(`/${resource}`, data, config);
  }

  async patch(resource, id, data) {
    return this.api.patch(`/${resource}/${id}`, data);
  }

  async delete(resource, id) {
    return this.api.delete(`/${resource}/${id}`);
  }

  // File upload helper
  async uploadFile(endpoint, formData) {
    return this.api.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // Direct request (if needed)
  async request(endpoint, options = {}) {
    return this.api(endpoint, options);
  }
}

export const apiService = new ApiService();
export default apiService;
