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
    if (this.socket) return;
    const configuredUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      window.location.origin;
    const origin = new URL(configuredUrl, window.location.origin).origin;
    this.socket = io(origin, {
      auth: (callback) => callback({ token: apiService.getToken() }),
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      // Polling is retained as a fallback for proxies that do not support upgrades.
      transports: ["polling", "websocket"],
    });
    this.socket.onAny((event, payload) => this.notify(event, payload));
    this.socket.on("connect", () =>
      this.notify("connection_status", "connected"),
    );
    this.socket.on("disconnect", () =>
      this.notify("connection_status", "reconnecting"),
    );
    this.socket.on("connect_error", async (error) => {
      this.notify("connection_status", "reconnecting");
      if (error.message === "Authentication error" && !this.refreshingToken) {
        this.refreshingToken = true;
        const socket = this.socket;
        try {
          const token = await apiService.refreshAccessToken();
          if (token && this.socket === socket) socket.connect();
          else if (this.socket === socket && apiService.getRefreshToken()) {
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
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
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
    if (!this.socket?.connected) return false;
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
