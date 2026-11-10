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
import { isChatFocused } from "@/services/chatActivity";
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
  const boundaries = useRef(new Map<string, string>());
  const revoked = useRef(new Set<string>());
  const accessEpochs = useRef(new Map<string, number>());
  const [historyVersion, setHistoryVersion] = useState(0);
  const outbox = useRef(new Map<string, ChatMessage>());
  // Refs keep asynchronous responses and socket handlers scoped to the current session.
  activeId.current = activeChatId;
  sessionId.current = userId;
  currentUser.current = user;
  currentMessages.current = messages;

  const visibleMessage = useCallback((message: ChatMessage) => {
    if (!message || revoked.current.has(message.chat_id)) return null;
    const boundary = BigInt(boundaries.current.get(message.chat_id) || 0);
    if (
      message.message_sequence &&
      BigInt(message.message_sequence) <= boundary
    )
      return null;
    if (
      message.replyToMessage?.message_sequence &&
      BigInt(message.replyToMessage.message_sequence) <= boundary
    )
      return { ...message, replyToMessage: null, reply_unavailable: true };
    return message;
  }, []);
  const protectConversation = useCallback((chat: Conversation) => {
    const local = BigInt(boundaries.current.get(chat.chats_id) || 0);
    const snapshot = BigInt(chat.cleared_through_sequence || 0);
    const boundary = local > snapshot ? local : snapshot;
    return {
      ...chat,
      cleared_through_sequence: String(boundary),
      ...(snapshot < boundary ? { unread_count: 0 } : {}),
      ...(boundary > 0 && BigInt(chat.last_message_sequence || 0) <= boundary
        ? {
            last_message_id: null,
            last_message_content: null,
            last_message_sender_id: null,
            last_message_timestamp: null,
          }
        : {}),
    };
  }, []);
  const applyBoundary = useCallback(
    (chatId: string, sequence: string) => {
      if (BigInt(sequence || 0) <= BigInt(boundaries.current.get(chatId) || 0))
        return;
      boundaries.current.set(chatId, sequence);
      ++inboxRequest.current;
      for (const [id, pending] of outbox.current)
        if (pending.chat_id === chatId) outbox.current.delete(id);
      if (activeId.current === chatId) {
        ++historyRequest.current;
        setMessages((previous) =>
          previous
            .filter((message) => !!message.message_sequence)
            .map(visibleMessage)
            .filter(Boolean),
        );
        setHasOlderMessages(false);
        setLoadingOlder(false);
        setMessagesLoading(false);
      }
      setChats((previous) =>
        previous.map((chat) =>
          chat.chats_id === chatId
            ? {
                ...chat,
                cleared_through_sequence: sequence,
                unread_count: 0,
                last_message_content: null,
                last_message_id: null,
                last_message_timestamp: null,
              }
            : chat,
        ),
      );
      setHistoryVersion((previous) => previous + 1);
    },
    [visibleMessage],
  );
  const hideConversation = useCallback(
    (chatId: string, boundary: string) => {
      applyBoundary(chatId, boundary);
      accessEpochs.current.set(
        chatId,
        (accessEpochs.current.get(chatId) || 0) + 1,
      );
      ++inboxRequest.current;
      for (const [id, pending] of outbox.current)
        if (pending.chat_id === chatId) outbox.current.delete(id);
      setChats((previous) =>
        previous.filter((chat) => chat.chats_id !== chatId),
      );
      if (activeId.current === chatId) {
        ++historyRequest.current;
        setMessagesLoading(false);
        setLoadingOlder(false);
        activeId.current = null;
        setActiveChatId(null);
        setMessages([]);
      }
      setHistoryVersion((previous) => previous + 1);
    },
    [applyBoundary],
  );
  const refreshChats = useCallback(async () => {
    const session = sessionId.current;
    if (!session) return;
    const request = ++inboxRequest.current;
    setChatsLoading(true);
    setChatsError("");
    try {
      const result = await chatService.chats();
      if (sessionId.current === session && inboxRequest.current === request) {
        for (const chat of result.chats) {
          revoked.current.delete(chat.chats_id);
          applyBoundary(chat.chats_id, chat.cleared_through_sequence || "0");
        }
        setChats(sortChats(result.chats.map(protectConversation)));
        setChatsLoading(false);
        if (
          activeId.current &&
          !result.chats.some((chat) => chat.chats_id === activeId.current)
        ) {
          const id = activeId.current;
          try {
            const details = await chatService.details(id);
            if (
              sessionId.current === session &&
              activeId.current === id &&
              !revoked.current.has(id)
            )
              setChats((previous) => [
                ...previous.filter((chat) => chat.chats_id !== id),
                protectConversation(details),
              ]);
          } catch (error) {
            if (error.status === 404 && activeId.current === id) {
              activeId.current = null;
              setActiveChatId(null);
              setMessages([]);
            }
          }
        }
      }
    } catch (error) {
      if (sessionId.current === session)
        setChatsError(error.message || "Could not load conversations");
    } finally {
      if (sessionId.current === session && inboxRequest.current === request)
        setChatsLoading(false);
    }
  }, [applyBoundary, protectConversation]);

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
            ...result.messages.map(visibleMessage).filter(Boolean),
          ]),
        );
        if (reset)
          setHasOlderMessages(
            result.pagination.totalItems > result.messages.length,
          );
        if (isChatFocused(chatId, activeId.current))
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
    [markAsRead, visibleMessage],
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
    const request = historyRequest.current;
    if (!chatId || !oldest) return;
    setLoadingOlder(true);
    try {
      const result = await chatService.messages(chatId, {
        before_timestamp: oldest.timestamp,
        before_id: oldest.messages_id,
      });
      if (
        sessionId.current === session &&
        activeId.current === chatId &&
        request === historyRequest.current
      ) {
        setMessages((previous) =>
          mergeMessages(
            result.messages.map(visibleMessage).filter(Boolean),
            previous,
          ),
        );
        setHasOlderMessages(
          result.pagination.totalItems > result.messages.length,
        );
      }
    } finally {
      if (sessionId.current === session && activeId.current === chatId)
        setLoadingOlder(false);
    }
  }, [visibleMessage]);

  const deliver = useCallback(
    async (pending: ChatMessage) => {
      const session = sessionId.current;
      try {
        const result = await chatService.send(
          pending.chat_id,
          pending.content,
          pending.reply_to,
          pending.messages_id,
        );
        if (sessionId.current !== session || !visibleMessage(result)) return;
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
              chat.chats_id === result.chat_id &&
              BigInt(result.message_sequence || 0) >=
                BigInt(chat.last_message_sequence || 0)
                ? {
                    ...chat,
                    last_message_id: result.messages_id,
                    last_message_sequence: result.message_sequence,
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
        if (
          sessionId.current === session &&
          activeId.current === pending.chat_id
        )
          setMessages((previous) =>
            previous.map((message) =>
              message.messages_id === pending.messages_id
                ? { ...message, delivery: "failed" }
                : message,
            ),
          );
        throw error;
      }
    },
    [visibleMessage],
  );

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
            protectConversation(result),
            ...previous.filter((chat) => chat.chats_id !== result.chats_id),
          ]),
        );
        selectChat(result.chats_id);
      }
      return result;
    },
    [selectChat, protectConversation],
  );

  const applyMutation = useCallback(
    (message: ChatMessage) => {
      message = visibleMessage(message);
      if (!message) return;
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
    [refreshChats, visibleMessage],
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
    boundaries.current.clear();
    revoked.current.clear();
    accessEpochs.current.clear();
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
          message = visibleMessage(message);
          if (!message) return;
          const chatId = message.chat_id;
          outbox.current.delete(message.messages_id);
          if (activeId.current === chatId) {
            // Stable IDs reconcile HTTP responses, realtime events and explicit retries.
            setMessages((previous) => mergeMessages(previous, [message]));
            if (
              isChatFocused(chatId, activeId.current) &&
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
      websocketService.on(
        "history_cleared",
        ({ chat_id, cleared_through_sequence }) => {
          applyBoundary(chat_id, cleared_through_sequence);
          void refreshChats();
          if (activeId.current === chat_id) void loadMessages(chat_id, false);
        },
      ),
      websocketService.on(
        "chat_deleted",
        ({ chat_id, cleared_through_sequence }) =>
          hideConversation(chat_id, cleared_through_sequence),
      ),
      websocketService.on("group_updated", () => {
        void refreshChats();
      }),
      websocketService.on("membership_revoked", ({ chat_id }) => {
        revoked.current.add(chat_id);
        accessEpochs.current.set(
          chat_id,
          (accessEpochs.current.get(chat_id) || 0) + 1,
        );
        ++inboxRequest.current;
        for (const [id, pending] of outbox.current)
          if (pending.chat_id === chat_id) outbox.current.delete(id);
        setChats((previous) =>
          previous.filter((chat) => chat.chats_id !== chat_id),
        );
        if (activeId.current === chat_id) {
          ++historyRequest.current;
          setMessagesLoading(false);
          setLoadingOlder(false);
          activeId.current = null;
          setActiveChatId(null);
          setMessages([]);
        }
        setHistoryVersion((previous) => previous + 1);
      }),
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
    window.addEventListener("focus", visibility);
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      websocketService.disconnect();
      window.clearInterval(expireTyping);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("focus", visibility);
    };
  }, [
    userId,
    refreshChats,
    loadMessages,
    markAsRead,
    applyMutation,
    applyBoundary,
    hideConversation,
    visibleMessage,
  ]);

  useEffect(() => {
    if (!userId || connectionStatus === "connected") return;
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void refreshChats();
      if (activeId.current) void loadMessages(activeId.current, false);
    }, 15000);
    return () => window.clearInterval(interval);
  }, [userId, connectionStatus, refreshChats, loadMessages]);

  const clearChat = useCallback(
    async (chatId: string) => {
      const session = sessionId.current;
      const result = await chatService.clear(chatId);
      if (sessionId.current !== session) return;
      applyBoundary(chatId, result.cleared_through_sequence);
      void refreshChats();
      if (activeId.current === chatId) void loadMessages(chatId, false);
    },
    [applyBoundary, refreshChats, loadMessages],
  );
  const deleteChat = useCallback(
    async (chatId: string) => {
      const session = sessionId.current;
      const result = await chatService.deleteForMe(chatId);
      if (sessionId.current !== session) return;
      hideConversation(chatId, result.cleared_through_sequence);
    },
    [hideConversation],
  );
  const openConversation = useCallback(
    async (chatId: string) => {
      const session = sessionId.current;
      const epoch = accessEpochs.current.get(chatId) || 0;
      const result = await chatService.details(chatId);
      if (sessionId.current !== session) return;
      if ((accessEpochs.current.get(chatId) || 0) !== epoch)
        throw new Error(
          "Your membership changed. Open the conversation again to check access.",
        );
      revoked.current.delete(chatId);
      applyBoundary(chatId, result.cleared_through_sequence || "0");
      setChats((previous) =>
        sortChats([
          protectConversation(result),
          ...previous.filter((chat) => chat.chats_id !== chatId),
        ]),
      );
      selectChat(chatId);
    },
    [applyBoundary, selectChat, protectConversation],
  );

  return {
    chats,
    historyVersion,
    clearChat,
    deleteChat,
    openConversation,
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
