import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "/api";

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
    this.organizationRevision = 0;

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 🔰 Inject token before every request
    this.api.interceptors.request.use(
      async (config) => {
        if (config._organizationRevision === undefined) Object.assign(config, this.requestConfig(config.url));
        if (!config._globalIdentity && config._organizationRevision !== this.organizationRevision) {
          throw { code: "ORGANIZATION_CHANGED", message: "Organization changed. Previous request discarded.", config };
        }
        this.assertIdentity(config);
        const organizationId = config._organizationId;
        if (organizationId) config.headers["X-Organization-Id"] = organizationId;
        else delete config.headers["X-Organization-Id"];
        let token = this.getToken();

        // If no token, try refreshing
        if (!token) {
          token = await this.refreshAccessToken();
        }

        if (!config._globalIdentity && config._organizationRevision !== this.organizationRevision) {
          throw { code: "ORGANIZATION_CHANGED", message: "Organization changed. Previous request discarded.", config };
        }
        this.assertIdentity(config);
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
      (error) => Promise.reject(error),
    );

    // 🔰 Response Interceptor for errors & token expiry
    this.api.interceptors.response.use(
      (response) => {
        this.assertIdentity(response.config);
        if (!response.config._globalIdentity && response.config._organizationRevision !== this.organizationRevision) {
          return Promise.reject({ code: "ORGANIZATION_CHANGED", message: "Organization changed. Previous response discarded." });
        }
        return response.data;
      },
      async (error) => {
        if (["ORGANIZATION_CHANGED", "IDENTITY_CHANGED"].includes(error.code)) return Promise.reject(error);
        const originalRequest = error.config || {};
        this.assertIdentity(originalRequest);
        if (!originalRequest._globalIdentity && originalRequest._organizationRevision !== undefined && originalRequest._organizationRevision !== this.organizationRevision) {
          return Promise.reject({ code: "ORGANIZATION_CHANGED", message: "Organization changed. Previous response discarded." });
        }
        const code = error.response?.data?.code;
        if ([403, 409].includes(error.response?.status) && ["MEMBERSHIP_UNAVAILABLE", "ORGANIZATION_REQUIRED", "HR_PROFILE_REQUIRED"].includes(code)) {
          window.dispatchEvent(new CustomEvent("stechad:organization-unavailable", { detail: { code } }));
        }
        const url = `/${(originalRequest.url || "").replace(/^\/+/, "")}`;
        const isPublicAuthEndpoint = [
          "/auth/login",
          "/auth/signup",
          "/auth/send-otp",
          "/auth/reset-password",
          "/auth/accept-invite",
          "/auth/verify-otp",
          "/auth/verify-email",
          "/auth/oauth/exchange",
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
            if (this.getRefreshToken()) {
              return Promise.reject({
                message:
                  "Could not reconnect to your session. Check your connection and try again.",
              });
            }
          }

          this.clearTokens();
          if (window.location.pathname !== "/platform-admin.html") window.location.href = "/login";
          return Promise.reject({ status: 401, message: "Your session has expired. Sign in again." });
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
          code: error.response.data?.code,
          errors: error.response.data?.errors,
          blockers: error.response.data?.blockers,
          message:
            (error.response.data?.errors && Object.values(error.response.data.errors).join(". ")) ||
            error.response.data?.message ||
            error.response.data?.error ||
            "Request failed",
        });
      },
    );
  }

  // 🔥 Clean undefined, null, empty strings, empty arrays automatically
  cleanParams(params) {
    return Object.fromEntries(
      Object.entries(params).filter(([_, v]) => {
        if (v === undefined || v === null || v === "") return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
      }),
    );
  }

  identityRevision() { return localStorage.getItem("stechad_identity_revision") || "0"; }

  advanceIdentity() {
    localStorage.setItem("stechad_identity_revision", crypto.randomUUID());
  }

  assertIdentity(config) {
    if (config._identityRevision !== undefined && config._identityRevision !== this.identityRevision()) {
      throw { code: "IDENTITY_CHANGED", message: "Sign-in changed. Previous response discarded." };
    }
  }

  requestConfig(resource) {
    const path = String(resource || "").replace(/^\/+/, "");
    const global = path.startsWith("platform/") || (path.startsWith("auth/") && path !== "auth/me");
    return { ...this.organizationConfig(), _identityRevision: this.identityRevision(), _globalIdentity: global, _organizationId: global ? null : this.getOrganization() };
  }

  organizationConfig() {
    return { _identityRevision: this.identityRevision(), _organizationRevision: this.organizationRevision, _organizationId: this.getOrganization() };
  }

  getOrganization() {
    return sessionStorage.getItem("stechad_organization_id");
  }

  setOrganization(organizationId) {
    if (this.getOrganization() === (organizationId || null)) return;
    this.organizationRevision += 1;
    if (organizationId) sessionStorage.setItem("stechad_organization_id", organizationId);
    else sessionStorage.removeItem("stechad_organization_id");
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
    this.advanceIdentity();
  }

  setRefreshToken(token) {
    localStorage.setItem("stechad_refresh_token", token);
  }

  clearTokens() {
    this.setOrganization(null);
    localStorage.removeItem("stechad_token");
    localStorage.removeItem("stechad_refresh_token");
    localStorage.removeItem("stechad_user");
    this.advanceIdentity();
    window.dispatchEvent(new Event("stechad:signed-out"));
  }

  async endSession(all = false) {
    const token = this.getToken();
    const refresh = this.getRefreshToken();
    this.clearTokens();
    if (!token && !refresh) return;
    const revoke = (access) => axios.post(`${this.baseURL}/auth/${all ? "logout-all" : "logout"}`, {}, { headers: { Authorization: `Bearer ${access}` } });
    try { if (token) return await revoke(token); }
    catch (cause) { if (cause.response?.status !== 401 || !refresh) throw cause; }
    if (!refresh) return;
    // Revoke an idle device even when its access token expired. These private
    // credentials never enter storage, so this request cannot undo local logout.
    const response = await axios.post(`${this.baseURL}/auth/refresh-token`, { refresh_token: refresh });
    const payload = response.data?.data || response.data;
    const access = payload?.token || payload?.access_token;
    if (!access) throw new Error("Could not revoke this device session. Sign in again to manage your devices.");
    return revoke(access);
  }

  // Web Locks serializes same-origin tabs. The bounded conflict path also supports
  // browsers without locks and tabs whose winning response has not reached storage.
  async waitForRotation(previous, revision) {
    const until = Date.now() + 1800;
    while (Date.now() < until) {
      if (this.identityRevision() !== revision || !this.getRefreshToken()) return null;
      if (this.getRefreshToken() !== previous) return this.getToken();
      await new Promise((resolve) => {
        const done = () => { clearTimeout(timer); window.removeEventListener("storage", done); resolve(); };
        const timer = setTimeout(done, 60);
        window.addEventListener("storage", done);
      });
    }
    return null;
  }

  async refreshAccessToken() {
    const previous = this.getRefreshToken();
    const revision = this.identityRevision();
    if (!previous) return null;
    if (this.refreshRequest && this.refreshingFor === revision) return this.refreshRequest;
    this.refreshingFor = revision;
    const rotate = async () => {
      if (this.identityRevision() !== revision || !this.getRefreshToken()) return null;
      if (this.getRefreshToken() !== previous) return this.getToken();
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const res = await axios.post(`${this.baseURL}/auth/refresh-token`, { refresh_token: previous });
          if (this.identityRevision() !== revision) return null;
          if (this.getRefreshToken() !== previous) return this.getRefreshToken() ? this.getToken() : null;
          const payload = res.data?.data || res.data;
          const token = payload?.token || payload?.access_token;
          const refresh = payload?.refreshToken || payload?.refresh_token;
          if (!token || !refresh) return null;
          localStorage.setItem("stechad_token", token);
          localStorage.setItem("stechad_refresh_token", refresh);
          return token;
        } catch (err) {
          if (this.identityRevision() !== revision) return null;
          if (this.getRefreshToken() !== previous) return this.getRefreshToken() ? this.getToken() : null;
          if (err.response?.status === 409 && err.response.data?.code === "REFRESH_ALREADY_ROTATED") {
            const winner = await this.waitForRotation(previous, revision);
            if (winner) return winner;
            if (this.identityRevision() !== revision || !this.getRefreshToken()) return null;
            continue;
          }
          if (err.response?.status === 401) this.clearTokens();
          return null; // Network failures leave a valid refresh credential intact.
        }
      }
      return null;
    };
    const request = navigator.locks?.request
      ? navigator.locks.request("stechad:refresh-session", rotate)
      : rotate();
    this.refreshRequest = request;
    try { return await request; }
    finally {
      if (this.refreshRequest === request) { this.refreshRequest = null; this.refreshingFor = null; }
    }
  }

  // 🔧 Generic GET request with params
  async get(resource, params = {}, id = null) {
    const endpoint = id ? `/${resource}/${id}` : `/${resource}`;
    return this.api.get(endpoint, { params, ...this.requestConfig(resource) });
  }

  async post(resource, data, isFormData = false) {
    const config = {
      headers: {},
      ...this.requestConfig(resource),
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
      ...this.requestConfig(resource),
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
      ...this.requestConfig(resource),
    };

    // Don't manually set Content-Type for FormData; let axios handle it
    if (isFormData) {
      // axios will automatically set Content-Type: multipart/form-data with boundary
      // so we don't set it here
    }

    return this.api.put(`/${resource}`, data, config);
  }

  async patch(resource, id, data) {
    return this.api.patch(`/${resource}/${id}`, data, this.requestConfig(resource));
  }

  async delete(resource, id) {
    return this.api.delete(`/${resource}/${id}`, this.requestConfig(resource));
  }

  // File upload helper
  async uploadFile(endpoint, formData) {
    return this.api.post(endpoint, formData, {
      ...this.organizationConfig(),
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // Direct request (if needed)
  async request(endpoint, options = {}) {
    return this.api(endpoint, { ...options, ...this.requestConfig(endpoint) });
  }
}

export const apiService = new ApiService();
export default apiService;
