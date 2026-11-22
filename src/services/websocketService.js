import { io } from "socket.io-client";
import apiService from "./apiService";

class WebSocketService {
  socket = null;
  listeners = new Map();
  refreshingToken = false;
  reconnectTimer = null;

  notify(event, payload) {
    this.listeners.get(event)?.forEach((callback) => callback(payload));
  }

  connect() {
    const organizationId = apiService.getOrganization();
    if (this.socket && this.organizationId === organizationId) return;
    this.disconnect();
    if (!organizationId) return;
    this.organizationId = organizationId;
    const configuredUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      window.location.origin;
    const origin = new URL(configuredUrl, window.location.origin).origin;
    this.socket = io(origin, {
      auth: (callback) => callback({ token: apiService.getToken(), organization_id: organizationId }),
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      // Polling is retained as a fallback for proxies that do not support upgrades.
      transports: ["polling", "websocket"],
    });
    const socket = this.socket;
    this.socket.onAny((event, payload) => {
      if (this.socket !== socket || apiService.getOrganization() !== organizationId) return;
      if (event !== "account_updated" && payload?.organization_id !== organizationId) return;
      this.notify(event, event === "online_users" ? payload.users : payload);
    });
    this.socket.on("connect", () =>
      this.notify("connection_status", "connected"),
    );
    this.socket.on("disconnect", (reason) => {
      if (this.socket !== socket || apiService.getOrganization() !== organizationId) return;
      this.notify("connection_status", "reconnecting");
      if (reason === "io server disconnect") {
        window.dispatchEvent(new CustomEvent("stechad:organization-unavailable"));
      }
    });
    this.socket.on("connect_error", async (error) => {
      if (this.socket !== socket || apiService.getOrganization() !== organizationId) return;
      this.notify("connection_status", "reconnecting");
      if (error.message === "Authentication error" && !this.refreshingToken) {
        this.refreshingToken = true;
        const socket = this.socket;
        try {
          // Revalidate membership as well as the global token before reconnecting.
          const response = await apiService.get("auth/me");
          if (this.socket !== socket) return;
          if (response?.data?.active_organization_id !== organizationId) {
            window.dispatchEvent(new CustomEvent("stechad:organization-unavailable"));
          } else socket.connect();
        } catch {
          if (this.socket === socket && apiService.getToken()) {
            this.reconnectTimer = window.setTimeout(() => {
              if (this.socket === socket) socket.connect();
            }, 3000);
          }
        } finally {
          this.refreshingToken = false;
        }
      }
    });
    this.notify("connection_status", "connecting");
  }

  disconnect() {
    window.clearTimeout(this.reconnectTimer);
    this.socket?.offAny();
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.organizationId = null;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
    if (!this.listeners.get(event)?.size) this.listeners.delete(event);
  }

  emit(event, payload) {
    if (!this.socket?.connected || this.organizationId !== apiService.getOrganization()) return false;
    this.socket.emit(event, payload);
    return true;
  }

  joinChat(chatId) {
    this.emit("join_chat", chatId);
  }
  leaveChat(chatId) {
    this.emit("leave_chat", chatId);
  }
  typingStart(chatId) {
    this.emit("typing_start", { chat_id: chatId });
  }
  typingStop(chatId) {
    this.emit("typing_stop", { chat_id: chatId });
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
