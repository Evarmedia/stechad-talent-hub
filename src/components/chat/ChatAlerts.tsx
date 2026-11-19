import apiService from "@/services/apiService";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useChatContext } from "@/hooks/contexts/ChatContext";
import websocketService from "@/services/websocketService";
import {
  claimMessageAlert,
  hasFocusedChat,
  isChatFocused,
  publishChatView,
} from "@/services/chatActivity";

import { ChatSoundContext } from "@/hooks/contexts/ChatSoundContext";
export default function ChatAlerts({ children }: { children: ReactNode }) {
  const { user, updateUser } = useAuthContext();
  const { activeChatId, markAsRead } = useChatContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [popupEnabled, setPopupEnabled] = useState(true);
  const effectiveSoundEnabled = user?.notification_sound_enabled ?? soundEnabled;
  const audio = useRef<AudioContext | null>(null);
  const current = useRef({
    activeChatId,
    soundEnabled: effectiveSoundEnabled,
    popupEnabled,
    userId: user?.user_id,
  });
  current.current = {
    activeChatId,
    soundEnabled: effectiveSoundEnabled,
    popupEnabled,
    userId: user?.user_id,
  };
  const soundKey = `stechad-chat-sound:${user?.user_id}`;
  const popupKey = `stechad-chat-popup:${user?.user_id}`;
  const importedSound = useRef(new Set<string>());
  const savingSound = useRef(false);
  useEffect(() => {
    if (!user?.user_id) return;
    if (user.notification_sound_enabled !== null && user.notification_sound_enabled !== undefined) {
      setSoundEnabled(user.notification_sound_enabled !== false);
      return;
    }
    let legacy = true;
    try { legacy = localStorage.getItem(soundKey) !== "off"; } catch { /* Use the default when storage is unavailable. */ }
    setSoundEnabled(legacy);
    if (importedSound.current.has(user.user_id)) return;
    importedSound.current.add(user.user_id);
    void apiService.putNoId("auth/preferences", { notification_sound_enabled: legacy, import_sound_preference: true })
      .then((response) => updateUser(response.data.user)).catch(() => {});
  }, [soundKey, user?.user_id, user?.notification_sound_enabled, updateUser]);
  useEffect(() => {
    try {
      setPopupEnabled(localStorage.getItem(popupKey) !== "off");
    } catch {
      setPopupEnabled(true);
    }
    const sync = (event: StorageEvent) => {
      if (event.key === popupKey) setPopupEnabled(event.newValue !== "off");
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [popupKey]);
  useEffect(() => {
    if (!user?.user_id) return;
    const publish = () =>
      publishChatView(user.user_id, current.current.activeChatId);
    publish();
    window.addEventListener("focus", publish);
    window.addEventListener("blur", publish);
    document.addEventListener("visibilitychange", publish);
    const interval = window.setInterval(publish, 4000);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", publish);
      window.removeEventListener("blur", publish);
      document.removeEventListener("visibilitychange", publish);
      publishChatView(user.user_id, null);
    };
  }, [activeChatId, location.pathname, user?.user_id]);
  useEffect(() => {
    const unlock = () => {
      try {
        audio.current ||= new AudioContext();
        if (audio.current.state === "suspended")
          void audio.current.resume().catch(() => {});
      } catch {
        /* Visual alerts work when browser audio is unavailable. */
      }
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      void audio.current?.close().catch(() => {});
      audio.current = null;
    };
  }, []);
  useEffect(() => {
    if (!user?.user_id) return;
    let cancelled = false;
    const boundary = new Map<string, string>();
    const blocked = new Set<string>();
    const alerts = new Map<string, string | number>();
    const dismiss = (chatId: string) => {
      for (const [id, toastId] of alerts)
        if (id.startsWith(chatId + ":")) {
          toast.dismiss(toastId);
          alerts.delete(id);
        }
    };
    const playSound = () => {
      const context = audio.current;
      if (!current.current.soundEnabled || !context || context.state !== "running") return;
      try {
        const oscillator = context.createOscillator(); const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(660, context.currentTime);
        oscillator.frequency.setValueAtTime(880, context.currentTime + 0.12);
        gain.gain.setValueAtTime(0, context.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, context.currentTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.32);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(); oscillator.stop(context.currentTime + 0.34);
      } catch { /* Visual delivery remains available when audio is blocked. */ }
    };
    const off = [
      websocketService.on(
        "history_cleared",
        ({ chat_id, cleared_through_sequence }) => {
          if (
            BigInt(cleared_through_sequence) >
            BigInt(boundary.get(chat_id) || 0)
          )
            boundary.set(chat_id, cleared_through_sequence);
          dismiss(chat_id);
        },
      ),
      websocketService.on(
        "chat_deleted",
        ({ chat_id, cleared_through_sequence }) => {
          if (
            BigInt(cleared_through_sequence) >
            BigInt(boundary.get(chat_id) || 0)
          )
            boundary.set(chat_id, cleared_through_sequence);
          dismiss(chat_id);
        },
      ),
      websocketService.on("membership_revoked", ({ chat_id }) => {
        blocked.add(chat_id);
        dismiss(chat_id);
      }),
      websocketService.on("group_left", ({ chat }) => {
        blocked.add(chat.chats_id);
        dismiss(chat.chats_id);
      }),
      websocketService.on("chat_purged", ({ chat_id }) => {
        blocked.add(chat_id);
        dismiss(chat_id);
      }),
      websocketService.on("group_updated", ({ chat_id }) =>
        blocked.delete(chat_id),
      ),
      websocketService.on(
        "notification_created",
        async ({ notification: n }) => {
          if (!n || n.is_read) return;
          const chatId = n.metadata?.chat_id;
          if (!chatId) {
            if (!await claimMessageAlert(user.user_id, n.notifications_id) || cancelled || current.current.userId !== user.user_id) return;
            const safeAction = typeof n.action_url === "string" && n.action_url.startsWith("/") && !n.action_url.startsWith("//");
            toast(n.title || "Notification", { description: n.message, duration: 7000, ...(safeAction ? { action: { label: "View", onClick: () => navigate(n.action_url) } } : {}) });
            playSound();
            return;
          }
          if (
            !chatId ||
            n.is_read ||
            blocked.has(chatId) ||
            BigInt(n.metadata?.message_sequence || 0) <=
              BigInt(boundary.get(chatId) || 0)
          )
            return;
          const focused =
            isChatFocused(chatId, current.current.activeChatId) ||
            hasFocusedChat(user.user_id, chatId);
          const claimed = await claimMessageAlert(
            user.user_id,
            n.notifications_id,
          );
          if (
            cancelled ||
            current.current.userId !== user.user_id ||
            blocked.has(chatId) ||
            BigInt(n.metadata?.message_sequence || 0) <=
              BigInt(boundary.get(chatId) || 0)
          )
            return;
          if (
            focused ||
            isChatFocused(chatId, current.current.activeChatId) ||
            hasFocusedChat(user.user_id, chatId)
          ) {
            if (isChatFocused(chatId, current.current.activeChatId))
              void markAsRead(chatId).catch(() => {});
            return;
          }
          if (!claimed) return;
          if (current.current.popupEnabled) {
            const id = toast(n.title || "New message", {
              description: n.message,
              duration: 7000,
              classNames: {
                toast: "!border-slate-200 !bg-white !text-slate-950 shadow-xl",
                title: "!text-slate-950",
                description: "!text-slate-600",
                actionButton: "!bg-primary !text-white hover:!bg-primary/90",
                closeButton: "!border-slate-200 !bg-white !text-slate-700",
              },
              action: {
                label: "Open chat",
                onClick: () => navigate(n.action_url),
              },
            });
            alerts.set(`${chatId}:${n.notifications_id}`, id);
          }
          playSound();
        },
      ),
    ];
    return () => {
      cancelled = true;
      off.forEach((unsubscribe) => unsubscribe());
      for (const id of alerts.values()) toast.dismiss(id);
    };
  }, [user?.user_id, markAsRead, navigate]);
  const toggleSound = async () => {
    if (savingSound.current) return;
    savingSound.current = true;
    try {
      const response = await apiService.putNoId("auth/preferences", { notification_sound_enabled: !current.current.soundEnabled });
      updateUser(response.data.user);
      setSoundEnabled(response.data.user.notification_sound_enabled !== false);
    } catch { toast.error("Could not save the sound preference"); }
    finally { savingSound.current = false; }
  };
  const togglePopup = () =>
    setPopupEnabled((previous) => {
      try {
        localStorage.setItem(popupKey, previous ? "off" : "on");
      } catch {
        /* Keep this session's preference when storage is blocked. */
      }
      return !previous;
    });
  return (
    <ChatSoundContext.Provider
      value={{ soundEnabled: effectiveSoundEnabled, toggleSound, popupEnabled, togglePopup }}
    >
      {children}
    </ChatSoundContext.Provider>
  );
}
