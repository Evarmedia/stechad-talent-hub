import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuthContext } from "../useAuthContext";
import { chatService } from "@/services/chatService";
import websocketService from "@/services/websocketService";
import type { ChatMessage, ChatUser, Conversation } from "@/types/chat";

type TypingUser = { user_id: string; user_name: string; expires: number };
type ConnectionStatus = "connecting" | "connected" | "reconnecting";
const mergeMessages = (messages: ChatMessage[], additions: ChatMessage[]) => {
  const merged = new Map<string, ChatMessage>();
  for (const message of [...messages, ...additions]) {
    const previous = merged.get(message.messages_id);
    merged.set(message.messages_id, {
      ...message,
      read_by: { ...previous?.read_by, ...message.read_by },
    });
  }
  return [...merged.values()].sort(
    (a, b) =>
      Date.parse(a.timestamp) - Date.parse(b.timestamp) ||
      a.messages_id.localeCompare(b.messages_id),
  );
};
const sortChats = (chats: Conversation[]) =>
  [...chats].sort(
    (a, b) =>
      Date.parse(b.last_message_timestamp || b.updated_at) -
      Date.parse(a.last_message_timestamp || a.updated_at),
  );

function useChatState() {
  const { user } = useAuthContext();
  const userId: string = user?.user_id;
  const [chats, setChats] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingUser[]>>(
    {},
  );
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [chatsLoading, setChatsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [chatsError, setChatsError] = useState("");
  const [messagesError, setMessagesError] = useState("");
  const activeId = useRef(activeChatId);
  const sessionId = useRef(userId);
  const currentUser = useRef(user);
  const currentMessages = useRef(messages);
  const inboxRequest = useRef(0);
  const historyRequest = useRef(0);
  const outbox = useRef(new Map<string, ChatMessage>());
  // Refs keep asynchronous responses and socket handlers scoped to the current session.
  activeId.current = activeChatId;
  sessionId.current = userId;
  currentUser.current = user;
  currentMessages.current = messages;

  const refreshChats = useCallback(async () => {
    const session = sessionId.current;
    if (!session) return;
    const request = ++inboxRequest.current;
    setChatsLoading(true);
    setChatsError("");
    try {
      const result = await chatService.chats();
      if (sessionId.current === session && inboxRequest.current === request)
        setChats(sortChats(result.chats));
    } catch (error) {
      if (sessionId.current === session)
        setChatsError(error.message || "Could not load conversations");
    } finally {
      if (sessionId.current === session && inboxRequest.current === request)
        setChatsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (chatId: string, ids: string[] = []) => {
    const session = sessionId.current;
    const receipt = await chatService.read(chatId, ids);
    if (sessionId.current === session)
      setChats((previous) =>
        previous.map((chat) =>
          chat.chats_id === chatId
            ? { ...chat, unread_count: receipt.unread_count }
            : chat,
        ),
      );
  }, []);

  const loadMessages = useCallback(
    async (chatId: string, reset = true) => {
      const session = sessionId.current;
      const request = ++historyRequest.current;
      if (reset) {
        setMessagesLoading(true);
        setMessagesError("");
      }
      try {
        const result = await chatService.messages(chatId);
        if (
          sessionId.current !== session ||
          activeId.current !== chatId ||
          historyRequest.current !== request
        )
          return;
        result.messages.forEach((message) =>
          outbox.current.delete(message.messages_id),
        );
        const pending = [...outbox.current.values()].filter(
          (message) => message.chat_id === chatId,
        );
        setMessages((previous) =>
          mergeMessages(reset ? [] : previous, [
            ...pending,
            ...result.messages,
          ]),
        );
        if (reset)
          setHasOlderMessages(
            result.pagination.totalItems > result.messages.length,
          );
        if (document.visibilityState === "visible")
          void markAsRead(chatId).catch(() => {});
      } catch (error) {
        if (sessionId.current === session && activeId.current === chatId)
          setMessagesError(error.message || "Could not load messages");
      } finally {
        if (
          sessionId.current === session &&
          activeId.current === chatId &&
          historyRequest.current === request
        )
          setMessagesLoading(false);
      }
    },
    [markAsRead],
  );

  const selectChat = useCallback((chatId: string | null) => {
    if (activeId.current === chatId) return;
    activeId.current = chatId;
    setActiveChatId(chatId);
    setMessages([]);
    setMessagesError("");
    setHasOlderMessages(false);
    setLoadingOlder(false);
  }, []);

  useEffect(() => {
    if (activeChatId && userId) {
      websocketService.joinChat(activeChatId);
      void loadMessages(activeChatId);
      return () => {
        websocketService.typingStop(activeChatId);
        websocketService.leaveChat(activeChatId);
      };
    }
  }, [activeChatId, userId, loadMessages]);

  const loadOlder = useCallback(async () => {
    const chatId = activeId.current;
    const oldest = currentMessages.current.find((message) => !message.delivery);
    const session = sessionId.current;
    if (!chatId || !oldest) return;
    setLoadingOlder(true);
    try {
      const result = await chatService.messages(chatId, {
        before_timestamp: oldest.timestamp,
        before_id: oldest.messages_id,
      });
      if (sessionId.current === session && activeId.current === chatId) {
        setMessages((previous) => mergeMessages(result.messages, previous));
        setHasOlderMessages(
          result.pagination.totalItems > result.messages.length,
        );
      }
    } finally {
      if (sessionId.current === session && activeId.current === chatId)
        setLoadingOlder(false);
    }
  }, []);

  const deliver = useCallback(async (pending: ChatMessage) => {
    const session = sessionId.current;
    try {
      const result = await chatService.send(
        pending.chat_id,
        pending.content,
        pending.reply_to,
        pending.messages_id,
      );
      if (sessionId.current !== session) return;
      outbox.current.delete(pending.messages_id);
      if (activeId.current === pending.chat_id)
        setMessages((previous) =>
          mergeMessages(
            previous.filter(
              (message) => message.messages_id !== pending.messages_id,
            ),
            [result],
          ),
        );
      setChats((previous) =>
        sortChats(
          previous.map((chat) =>
            chat.chats_id === result.chat_id
              ? {
                  ...chat,
                  last_message_id: result.messages_id,
                  last_message_content: result.content,
                  last_message_sender_id: result.sender_id,
                  last_message_timestamp: result.timestamp,
                }
              : chat,
          ),
        ),
      );
    } catch (error) {
      if (
        sessionId.current !== session ||
        !outbox.current.has(pending.messages_id)
      )
        return;
      outbox.current.set(pending.messages_id, {
        ...pending,
        delivery: "failed",
      });
      if (sessionId.current === session && activeId.current === pending.chat_id)
        setMessages((previous) =>
          previous.map((message) =>
            message.messages_id === pending.messages_id
              ? { ...message, delivery: "failed" }
              : message,
          ),
        );
      throw error;
    }
  }, []);

  const sendMessage = useCallback(
    async (chatId: string, content: string, reply?: ChatMessage) => {
      const pending: ChatMessage = {
        messages_id: crypto.randomUUID(),
        chat_id: chatId,
        sender_id: sessionId.current,
        sender: currentUser.current,
        content,
        timestamp: new Date().toISOString(),
        reply_to: reply?.messages_id,
        replyToMessage: reply,
        read_by: {},
        delivery: "sending",
      };
      outbox.current.set(pending.messages_id, pending);
      if (activeId.current === chatId)
        setMessages((previous) => [...previous, pending]);
      await deliver(pending);
    },
    [deliver],
  );
  const retryMessage = useCallback(
    async (message: ChatMessage) => {
      outbox.current.set(message.messages_id, {
        ...message,
        delivery: "sending",
      });
      setMessages((previous) =>
        previous.map((item) =>
          item.messages_id === message.messages_id
            ? { ...item, delivery: "sending" }
            : item,
        ),
      );
      await deliver(message);
    },
    [deliver],
  );

  const createChat = useCallback(
    async (ids: string[], type = "direct", name?: string) => {
      const session = sessionId.current;
      const result = await chatService.create(ids, type, name);
      if (sessionId.current === session) {
        setChats((previous) =>
          sortChats([
            result,
            ...previous.filter((chat) => chat.chats_id !== result.chats_id),
          ]),
        );
        selectChat(result.chats_id);
      }
      return result;
    },
    [selectChat],
  );

  const applyMutation = useCallback(
    (message: ChatMessage) => {
      if (activeId.current === message.chat_id)
        setMessages((previous) =>
          previous.map((item) =>
            item.messages_id === message.messages_id
              ? message
              : item.reply_to === message.messages_id
                ? { ...item, replyToMessage: message }
                : item,
          ),
        );
      void refreshChats();
    },
    [refreshChats],
  );
  const editMessage = useCallback(
    async (id: string, content: string) => {
      const session = sessionId.current;
      const message = await chatService.edit(id, content);
      if (sessionId.current === session) applyMutation(message);
    },
    [applyMutation],
  );
  const deleteMessage = useCallback(
    async (id: string) => {
      const session = sessionId.current;
      const message = await chatService.remove(id);
      if (sessionId.current === session) applyMutation(message);
    },
    [applyMutation],
  );

  useEffect(() => {
    outbox.current.clear();
    setChats([]);
    setMessages([]);
    setActiveChatId(null);
    activeId.current = null;
    setOnlineUsers([]);
    setTypingUsers({});
    setChatsError("");
    setMessagesError("");
    if (!userId) return;
    const unsubscribers = [
      websocketService.on("connection_status", (status: ConnectionStatus) => {
        setConnectionStatus(status);
        if (status === "connected") {
          void refreshChats();
          if (activeId.current) {
            websocketService.joinChat(activeId.current);
            void loadMessages(activeId.current, false);
          }
        }
      }),
      websocketService.on(
        "new_message",
        ({ message }: { message: ChatMessage }) => {
          const chatId = message.chat_id;
          outbox.current.delete(message.messages_id);
          if (activeId.current === chatId) {
            // Stable IDs reconcile HTTP responses, realtime events and explicit retries.
            setMessages((previous) => mergeMessages(previous, [message]));
            if (
              document.visibilityState === "visible" &&
              message.sender_id !== userId
            )
              void markAsRead(chatId, [message.messages_id]).catch(() => {});
          }
          void refreshChats();
          setTypingUsers((previous) => ({
            ...previous,
            [chatId]: (previous[chatId] || []).filter(
              (person) => person.user_id !== message.sender_id,
            ),
          }));
        },
      ),
      websocketService.on("chat_created", () => {
        void refreshChats();
      }),
      websocketService.on(
        "message_updated",
        ({ message }: { message: ChatMessage }) => applyMutation(message),
      ),
      websocketService.on(
        "message_deleted",
        ({ message }: { message: ChatMessage }) => applyMutation(message),
      ),
      websocketService.on(
        "messages_read",
        ({ chat_id, user_id, message_ids, read_at, unread_count }) => {
          if (activeId.current === chat_id)
            setMessages((previous) =>
              previous.map((message) =>
                message.sender_id !== user_id &&
                (!message_ids.length ||
                  message_ids.includes(message.messages_id))
                  ? {
                      ...message,
                      read_by: { ...message.read_by, [user_id]: read_at },
                    }
                  : message,
              ),
            );
          if (user_id === userId)
            setChats((previous) =>
              previous.map((chat) =>
                chat.chats_id === chat_id ? { ...chat, unread_count } : chat,
              ),
            );
        },
      ),
      websocketService.on("online_users", (users: ChatUser[]) =>
        setOnlineUsers(users),
      ),
      websocketService.on(
        "user_online",
        ({ user: person }: { user: ChatUser }) =>
          setOnlineUsers((previous) => [
            ...previous.filter((item) => item.user_id !== person.user_id),
            person,
          ]),
      ),
      websocketService.on(
        "user_offline",
        ({ user_id }: { user_id: string }) => {
          setOnlineUsers((previous) =>
            previous.filter((person) => person.user_id !== user_id),
          );
          setTypingUsers((previous) =>
            Object.fromEntries(
              Object.entries(previous).map(([id, people]) => [
                id,
                people.filter((person) => person.user_id !== user_id),
              ]),
            ),
          );
        },
      ),
      websocketService.on("user_typing", ({ chat_id, user_id, user_name }) => {
        if (user_id !== userId)
          setTypingUsers((previous) => ({
            ...previous,
            [chat_id]: [
              ...(previous[chat_id] || []).filter(
                (person) => person.user_id !== user_id,
              ),
              { user_id, user_name, expires: Date.now() + 5000 },
            ],
          }));
      }),
      websocketService.on("user_stopped_typing", ({ chat_id, user_id }) =>
        setTypingUsers((previous) => ({
          ...previous,
          [chat_id]: (previous[chat_id] || []).filter(
            (person) => person.user_id !== user_id,
          ),
        })),
      ),
    ];
    void refreshChats();
    websocketService.connect();
    const expireTyping = window.setInterval(
      () =>
        setTypingUsers((previous) => {
          if (
            !Object.values(previous).some((people) =>
              people.some((person) => person.expires <= Date.now()),
            )
          )
            return previous;
          return Object.fromEntries(
            Object.entries(previous).map(([id, people]) => [
              id,
              people.filter((person) => person.expires > Date.now()),
            ]),
          );
        }),
      1000,
    );
    const visibility = () => {
      if (document.visibilityState !== "visible") return;
      void refreshChats();
      if (activeId.current) void loadMessages(activeId.current, false);
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      websocketService.disconnect();
      window.clearInterval(expireTyping);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [userId, refreshChats, loadMessages, markAsRead, applyMutation]);

  useEffect(() => {
    if (!userId || connectionStatus === "connected") return;
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void refreshChats();
      if (activeId.current) void loadMessages(activeId.current, false);
    }, 15000);
    return () => window.clearInterval(interval);
  }, [userId, connectionStatus, refreshChats, loadMessages]);

  return {
    chats,
    activeChatId,
    activeChat: chats.find((chat) => chat.chats_id === activeChatId) || null,
    messages,
    onlineUsers,
    typingUsers,
    connectionStatus,
    chatsLoading,
    messagesLoading,
    loadingOlder,
    hasOlderMessages,
    chatsError,
    messagesError,
    refreshChats,
    loadMessages,
    selectChat,
    createChat,
    sendMessage,
    retryMessage,
    markAsRead,
    loadOlder,
    editMessage,
    deleteMessage,
  };
}

const ChatContext = createContext<ReturnType<typeof useChatState> | null>(null);
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const value = useChatState();
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context)
    throw new Error("useChatContext must be used within a ChatProvider");
  return context;
};
