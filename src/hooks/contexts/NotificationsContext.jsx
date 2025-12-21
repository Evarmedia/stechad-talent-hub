import { createContext, useContext, useState, useEffect } from "react";
import apiService from "../../services/apiService.js";
import { useAuthContext } from "../useAuthContext.jsx";

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false); // prevents double fetching

  const token = apiService.getToken(); // ensures only fetch when logged in
  const { user } = useAuthContext();

  const getNotifications = async (filters = {}) => {
    setLoading(true);
    try {
      let params = {
        // page: filters.page || 1,
        // limit: filters.limit || 50,
      };

      if (filters.is_read !== undefined) {
        params.is_read = filters.is_read;
      }
      if (filters.type) {
        params.type = filters.type;
      }

      const response = await apiService.get("notifications",);
      const notificationsData =
        response.success && response.data
          ? response.data.notifications || response.data
          : [];

      setNotifications(notificationsData);

      // Calculate unread count
      // const unread = notificationsData.filter((n) => !n.is_read).length;
      setUnreadCount(response.data.unread_count);

      return notificationsData;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await apiService.request(
        `/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );

      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notifications_id === notificationId || n.id === notificationId
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      return response;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiService.request("/notifications/read-all", {
        method: "PUT",
      });

      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            is_read: true,
            read_at: new Date().toISOString(),
          }))
        );
        setUnreadCount(0);
      }

      return response;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (!token || !user || initialized) return;

    const init = async () => {
      setLoading(true);
      try {
        await getNotifications();
        setInitialized(true);
        setLoading(false);
      } catch (err) {
        console.error("NotificationsContext init error:", err);
      } finally {
        setInitialized(true);
        setLoading(false);
      }
    };

    init();
  }, [token, user]);

  const resetNotificationState = () => {
    setNotifications([]);
    setUnreadCount(0);
    setLoading(false);
    setInitialized(false);
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    getNotifications,
    markAsRead,
    markAllAsRead,
    resetNotificationState,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotificationsContext must be used within a NotificationsProvider"
    );
  }
  return context;
};
