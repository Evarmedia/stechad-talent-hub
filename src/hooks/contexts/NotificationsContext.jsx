import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import apiService from "../../services/apiService.js";
import websocketService from "../../services/websocketService.js";
import { useAuthContext } from "../useAuthContext.jsx";

const NotificationsContext = createContext();
export const NotificationsProvider = ({ children }) => {
  const { user } = useAuthContext();
  const userId = user?.user_id;
  const isEligibleRole = [
    "admin",
    "super_admin",
    "project_manager",
    "staff",
    "talent",
  ].includes(user?.role);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const request = useRef(0);
  const session = useRef(userId);
  session.current = userId;
  const boundaries = useRef(new Map());
  const revoked = useRef(new Set());
  const visible = useCallback((notification) => {
    const id = notification.metadata?.chat_id;
    return (
      !revoked.current.has(id) &&
      (!id ||
        BigInt(notification.metadata?.message_sequence || 0) >
          BigInt(boundaries.current.get(id) || 0))
    );
  }, []);
  const getNotifications = useCallback(
    async (filters = {}) => {
      if (!userId || !isEligibleRole || !apiService.getToken()) return [];
      const version = ++request.current;
      setLoading(true);
      try {
        const response = await apiService.get("notifications", filters);
        const rows = (response.data?.notifications || []).filter(visible);
        if (session.current === userId && request.current === version) {
          setNotifications(rows);
          setUnreadCount(
            response.data?.unread_count ??
              rows.filter((n) => !n.is_read).length,
          );
        }
        return rows;
      } finally {
        if (session.current === userId && request.current === version)
          setLoading(false);
      }
    },
    [userId, isEligibleRole, visible],
  );
  const markAsRead = useCallback(
    async (id) => {
      const response = await apiService.request(`/notifications/${id}/read`, {
        method: "PUT",
      });
      if (session.current === userId) await getNotifications();
      return response;
    },
    [getNotifications, userId],
  );
  const markAllAsRead = useCallback(async () => {
    const response = await apiService.request("/notifications/read-all", {
      method: "PUT",
    });
    if (session.current === userId) await getNotifications();
    return response;
  }, [getNotifications, userId]);
  const resetNotificationState = useCallback(() => {
    ++request.current;
    setNotifications([]);
    setUnreadCount(0);
    setLoading(false);
  }, []);
  useEffect(() => {
    resetNotificationState();
    boundaries.current.clear();
    revoked.current.clear();
    if (!userId || !isEligibleRole) return;
    const refresh = () => {
      void getNotifications().catch(() => {});
    };
    const removeChat = (chatId, sequence) => {
      ++request.current;
      if (sequence !== undefined) {
        if (BigInt(sequence) > BigInt(boundaries.current.get(chatId) || 0))
          boundaries.current.set(chatId, sequence);
      } else revoked.current.add(chatId);
      setNotifications((previous) => previous.filter(visible));
      refresh();
    };
    const off = [
      websocketService.on("notification_created", refresh),
      websocketService.on("notifications_changed", refresh),
      websocketService.on(
        "history_cleared",
        ({ chat_id, cleared_through_sequence }) =>
          removeChat(chat_id, cleared_through_sequence),
      ),
      websocketService.on("membership_revoked", ({ chat_id }) =>
        removeChat(chat_id),
      ),
      websocketService.on("group_updated", ({ chat_id }) => {
        revoked.current.delete(chat_id);
        refresh();
      }),
      websocketService.on("message_deleted", refresh),
      websocketService.on("connection_status", (status) => {
        if (status === "connected") refresh();
      }),
    ];
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      ++request.current;
      off.forEach((unsubscribe) => unsubscribe());
      window.removeEventListener("focus", refresh);
    };
  }, [
    userId,
    isEligibleRole,
    getNotifications,
    resetNotificationState,
    visible,
  ]);
  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        isEligibleRole,
        getNotifications,
        markAsRead,
        markAllAsRead,
        resetNotificationState,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (!context)
    throw new Error(
      "useNotificationsContext must be used within a NotificationsProvider",
    );
  return context;
};
