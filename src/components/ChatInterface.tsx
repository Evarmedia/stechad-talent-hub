import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  MoreHorizontal,
  Info,
  Trash2,
  Volume2,
  VolumeX,
  ArrowDown,
  ArrowLeft,
  CheckCheck,
  ChevronDown,
  CircleAlert,
  Eraser,
  Loader2,
  MessageCircle,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useChatContext } from "@/hooks/contexts/ChatContext";
import { useAuthContext } from "@/hooks/useAuthContext";
import { chatService } from "@/services/chatService";
import websocketService from "@/services/websocketService";
import { cn } from "@/lib/utils";
import {
  conversationName,
  roleName,
  userName,
  type ChatMessage,
  type Conversation,
} from "@/types/chat";
import NewConversationDialog from "./chat/NewConversationDialog";
import MessageBubble from "./chat/MessageBubble";
import ChatDetailsSheet from "./chat/ChatDetailsSheet";
import { useChatSound } from "@/hooks/contexts/ChatSoundContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
const dateLabel = (timestamp: string) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  return date.toDateString() === today.toDateString()
    ? "Today"
    : date.toDateString() === yesterday.toDateString()
      ? "Yesterday"
      : date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year:
            date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
        });
};
const inboxTime = (timestamp?: string) =>
  timestamp
    ? dateLabel(timestamp) === "Today"
      ? new Date(timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : dateLabel(timestamp)
    : "";

export default function ChatInterface() {
  const { user } = useAuthContext();
  const { soundEnabled, toggleSound } = useChatSound();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [deleteChatOpen, setDeleteChatOpen] = useState(false);
  const {
    chats,
    activeChatId,
    activeChat,
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
    sendMessage,
    retryMessage,
    loadOlder,
    editMessage,
    deleteMessage,
    clearChat,
    deleteChat,
    historyVersion,
  } = useChatContext();
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [reply, setReply] = useState<ChatMessage | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [messageQuery, setMessageQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [editing, setEditing] = useState<ChatMessage | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleting, setDeleting] = useState<ChatMessage | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [nearBottom, setNearBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimer = useRef<number>();
  const lastTypingAt = useRef(0);
  const previousChatId = useRef<string | null>(null);
  const seenClearBoundaries = useRef(new Map<string, string>());
  const draft = drafts[activeChatId] || "";
  const totalUnread = chats.reduce(
    (total, chat) => total + (chat.unread_count || 0),
    0,
  );
  const activeTyping = typingUsers[activeChatId] || [];
  const onlineIds = useMemo(
    () => new Set(onlineUsers.map((person) => person.user_id)),
    [onlineUsers],
  );
  const filteredChats = chats.filter(
    (chat) =>
      (!unreadOnly || chat.unread_count > 0) &&
      `${conversationName(chat, user?.user_id)} ${chat.last_message_content || ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const peer = activeChat?.participant_details?.find(
    (person) => person.user_id !== user?.user_id,
  );
  const isGroup = activeChat && activeChat.chat_type !== "direct";
  const searchMode = searchOpen && messageQuery.trim().length >= 2;
  const visibleMessages = searchMode ? searchResults : messages;

  const scrollToLatest = (smooth = false) => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "instant",
    });
    setNearBottom(true);
  };
  useEffect(() => {
    const changedChat = previousChatId.current !== activeChatId;
    previousChatId.current = activeChatId;
    if (changedChat || nearBottom) scrollToLatest();
    // Scroll only when messages or the selected conversation change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, activeChatId, messagesLoading]);
  useEffect(() => {
    setReply(null);
    setSearchOpen(false);
    setMessageQuery("");
    setActionError("");
    setNearBottom(true);
    lastTypingAt.current = 0;
    setDetailsOpen(false);
    setClearOpen(false);
    setEditing(null);
    setDeleting(null);
    setSearchResults([]);
    return () => window.clearTimeout(typingTimer.current);
  }, [activeChatId]);
  useEffect(() => {
    if (!activeChatId) return;
    const boundary = activeChat?.cleared_through_sequence || "0";
    const previous = seenClearBoundaries.current.get(activeChatId) || "0";
    seenClearBoundaries.current.set(activeChatId, boundary);
    if (BigInt(boundary) <= BigInt(previous)) return;
    setReply(null);
    setEditing(null);
    setDeleting(null);
    setMessageQuery("");
    setSearchResults([]);
    setSearching(false);
    setSearchTotal(0);
    if (activeChatId)
      setDrafts((previous) => ({ ...previous, [activeChatId]: "" }));
  }, [historyVersion, activeChatId, activeChat?.cleared_through_sequence]);
  useEffect(() => {
    setDrafts({});
    seenClearBoundaries.current.clear();
    setReply(null);
  }, [user?.user_id]);
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
  }, [draft]);
  useEffect(() => {
    if (!searchMode || !activeChatId) {
      setSearchResults([]);
      setSearchError("");
      return;
    }
    let cancelled = false;
    setSearching(true);
    setSearchError("");
    const timer = window.setTimeout(async () => {
      try {
        const result = await chatService.search(
          activeChatId,
          messageQuery.trim(),
        );
        if (!cancelled) {
          setSearchResults(result.messages);
          setSearchTotal(result.pagination.totalItems);
        }
      } catch (error) {
        if (!cancelled)
          setSearchError(error.message || "Could not search messages");
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeChatId, messageQuery, searchMode, messages, historyVersion]);

  const updateDraft = (value: string) => {
    if (!activeChatId) return;
    setDrafts((previous) => ({ ...previous, [activeChatId]: value }));
    window.clearTimeout(typingTimer.current);
    if (value.trim()) {
      if (Date.now() - lastTypingAt.current > 2000) {
        websocketService.typingStart(activeChatId);
        lastTypingAt.current = Date.now();
      }
      typingTimer.current = window.setTimeout(() => {
        websocketService.typingStop(activeChatId);
        lastTypingAt.current = 0;
      }, 1500);
    } else {
      websocketService.typingStop(activeChatId);
      lastTypingAt.current = 0;
    }
  };
  const send = async () => {
    if (
      !draft.trim() ||
      !activeChatId ||
      messagesLoading ||
      messagesError ||
      activeChat?.can_post === false
    )
      return;
    const content = draft.trim();
    const quote = reply;
    updateDraft("");
    setReply(null);
    setActionError("");
    setNearBottom(true);
    try {
      await sendMessage(activeChatId, content, quote);
    } catch (error) {
      setActionError(
        error.message ||
          "Your message was not sent. Use Retry below the message.",
      );
    }
    textareaRef.current?.focus();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void send();
    }
  };
  const older = async () => {
    const element = scrollRef.current;
    const height = element?.scrollHeight || 0;
    setNearBottom(false);
    try {
      await loadOlder();
      requestAnimationFrame(() => {
        if (element) element.scrollTop = element.scrollHeight - height;
      });
    } catch (error) {
      setActionError(error.message || "Could not load earlier messages");
    }
  };
  const mutate = async (remove = false) => {
    setSaving(true);
    setActionError("");
    try {
      if (remove && deleting) {
        await deleteMessage(deleting.messages_id);
        setDeleting(null);
      } else if (editing) {
        await editMessage(editing.messages_id, editContent.trim());
        setEditing(null);
      }
    } catch (error) {
      setActionError(error.message || "Could not update the message");
    } finally {
      setSaving(false);
    }
  };
  const renderAvatar = (chat: Conversation, selected = false) => {
    const name = conversationName(chat, user?.user_id);
    const person = chat.participant_details?.find(
      (item) => item.user_id !== user?.user_id,
    );
    return (
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11">
          <AvatarImage
            src={
              chat.chat_type === "direct" ? person?.avatar_url : chat.avatar_url
            }
            alt=""
          />
          <AvatarFallback
            className={cn(
              "text-sm font-semibold",
              selected
                ? "bg-primary/10 text-primary"
                : "bg-slate-100 text-slate-600",
            )}
          >
            {chat.chat_type === "direct" ? (
              initials(name)
            ) : (
              <Users className="h-5 w-5" />
            )}
          </AvatarFallback>
        </Avatar>
        {chat.chat_type === "direct" && onlineIds.has(person?.user_id) && (
          <span
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
            aria-label="Online"
          />
        )}
      </div>
    );
  };

  return (
    <section
      className="flex h-full min-h-0 flex-col"
      aria-label="Team messages"
    >
      <div className="mb-5 flex shrink-0 items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Messages
            </h1>
            {totalUnread > 0 && (
              <span
                className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary"
                aria-label={`${totalUnread} unread messages`}
              >
                {totalUnread}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Your team. One conversation away.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2 py-1.5 text-xs text-slate-500 sm:px-3"
            role="status"
          >
            {connectionStatus === "connected" ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-amber-600" />
            )}
            <span className="sr-only sm:not-sr-only">
              {connectionStatus === "connected"
                ? "Live"
                : connectionStatus === "connecting"
                  ? "Connecting…"
                  : "Reconnecting…"}
            </span>
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 shrink-0 text-slate-500"
            aria-label={
              soundEnabled ? "Mute message sounds" : "Enable message sounds"
            }
            aria-pressed={soundEnabled}
            title={soundEnabled ? "Message sound on" : "Message sound off"}
            onClick={toggleSound}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={() => setNewChatOpen(true)}
            className="h-10 gap-2 rounded-xl px-3 sm:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New message</span>
            <span className="sr-only sm:hidden">New message</span>
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <aside
          className={cn(
            "flex w-full shrink-0 flex-col border-r border-slate-200 md:w-[300px] xl:w-[340px]",
            activeChatId && "hidden md:flex",
          )}
          aria-label="Conversations"
        >
          <div className="space-y-4 border-b border-slate-100 p-4 lg:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">
                Inbox{" "}
                <span className="ml-1 text-xs font-normal text-slate-500">
                  {chats.length}
                </span>
              </h2>
              <button
                type="button"
                aria-label="Refresh conversations"
                onClick={() => void refreshChats()}
                className="flex h-8 w-8 items-center justify-center border-0 bg-transparent text-slate-500 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <RefreshCw
                  className={cn("h-3.5 w-3.5", chatsLoading && "animate-spin")}
                />
              </button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                aria-label="Search conversations"
                placeholder="Search conversations…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:ring-primary/40"
              />
            </div>
            <div className="flex gap-2" aria-label="Inbox filters">
              {[
                { label: "All messages", unread: false },
                { label: "Unread", unread: true },
              ].map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => setUnreadOnly(filter.unread)}
                  aria-pressed={unreadOnly === filter.unread}
                  className={cn(
                    "rounded-lg border-0 px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    unreadOnly === filter.unread
                      ? "bg-primary-light text-primary"
                      : "bg-transparent text-slate-500 hover:bg-slate-50",
                  )}
                >
                  {filter.label}
                  {filter.unread && totalUnread > 0 ? ` (${totalUnread})` : ""}
                </button>
              ))}
            </div>
          </div>
          <div
            className="min-h-0 flex-1 overflow-y-auto p-2"
            aria-busy={chatsLoading}
          >
            {chatsError && (
              <div
                role="alert"
                className="m-2 rounded-xl bg-red-50 p-3 text-xs text-red-800"
              >
                <p>{chatsError}</p>
                <button
                  type="button"
                  className="mt-2 border-0 bg-transparent font-semibold underline"
                  onClick={() => void refreshChats()}
                >
                  Try again
                </button>
              </div>
            )}
            {chatsLoading && !chats.length ? (
              <div role="status" className="space-y-4 p-3">
                <span className="sr-only">Loading conversations</span>
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex animate-pulse gap-3">
                    <div className="h-11 w-11 rounded-full bg-slate-100" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-2/3 rounded bg-slate-100" />
                      <div className="h-3 w-full rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length ? (
              filteredChats.map((chat) => {
                const selected = chat.chats_id === activeChatId;
                const typing = typingUsers[chat.chats_id]?.length > 0;
                return (
                  <button
                    type="button"
                    key={chat.chats_id}
                    aria-current={selected ? "true" : undefined}
                    onClick={() => selectChat(chat.chats_id)}
                    className={cn(
                      "mb-1 flex w-full gap-3 rounded-xl border-transparent p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                      selected ? "bg-primary-light" : "hover:bg-slate-50",
                    )}
                  >
                    {renderAvatar(chat, selected)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-sm",
                            chat.unread_count
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-700",
                          )}
                        >
                          {conversationName(chat, user?.user_id)}
                        </p>
                        <time
                          className={cn(
                            "shrink-0 text-[10px]",
                            chat.unread_count
                              ? "font-medium text-primary"
                              : "text-slate-500",
                          )}
                        >
                          {inboxTime(chat.last_message_timestamp)}
                        </time>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-xs leading-5",
                            typing
                              ? "font-medium italic text-primary"
                              : chat.unread_count
                                ? "text-slate-700"
                                : "text-slate-500",
                          )}
                        >
                          {typing
                            ? "Typing…"
                            : chat.last_message_content
                              ? `${chat.last_message_sender_id === user?.user_id ? "You: " : ""}${chat.last_message_content}`
                              : "Say hello to start the conversation"}
                        </p>
                        {chat.unread_count > 0 && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                            {chat.unread_count > 99 ? "99+" : chat.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              !chatsError && (
                <div className="px-4 py-12 text-center">
                  <MessageSquare className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">
                    {search
                      ? "No conversations found"
                      : unreadOnly
                        ? "You’re all caught up"
                        : "Your inbox starts here"}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {search
                      ? "Try another name or keyword."
                      : unreadOnly
                        ? "New messages will appear here."
                        : "Start a conversation with someone on your team."}
                  </p>
                  {!search && !unreadOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 text-primary"
                      onClick={() => setNewChatOpen(true)}
                    >
                      New conversation
                    </Button>
                  )}
                </div>
              )
            )}
          </div>
          <div className="hidden items-center gap-2 border-t border-slate-100 px-5 py-3 text-[11px] text-slate-500 md:flex">
            <MessageCircle className="h-3.5 w-3.5" />A little conversation goes
            a long way.
          </div>
        </aside>

        <div
          className={cn(
            "relative min-w-0 flex-1 flex-col bg-slate-50/80",
            activeChatId ? "flex" : "hidden md:flex",
          )}
        >
          {activeChat ? (
            <>
              <header className="flex min-h-[77px] shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 shrink-0 border-0 md:hidden"
                    aria-label="Back to conversations"
                    onClick={() => selectChat(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <button
                    type="button"
                    aria-label={
                      isGroup ? "View group details" : "View contact profile"
                    }
                    className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    onClick={() => setDetailsOpen(true)}
                  >
                    {renderAvatar(activeChat)}
                  </button>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                      {conversationName(activeChat, user?.user_id)}
                    </h2>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {activeTyping.length ? (
                        <span className="text-primary">
                          {activeTyping
                            .map((person) => person.user_name.split(" ")[0])
                            .join(", ")}{" "}
                          {activeTyping.length === 1 ? "is" : "are"} typing…
                        </span>
                      ) : isGroup ? (
                        `${activeChat.participants.length} members · ${activeChat.participants.filter((id) => onlineIds.has(id)).length} online`
                      ) : (
                        <>
                          <span className="capitalize">{roleName(peer)}</span>
                          {onlineIds.has(peer?.user_id) && (
                            <span className="ml-2 text-emerald-600">
                              · Online
                            </span>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="ml-2 flex shrink-0 items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-9 w-9 shrink-0 border-0 text-slate-500 hover:bg-slate-50",
                      searchOpen && "bg-primary-light text-primary",
                    )}
                    aria-label={
                      searchOpen
                        ? "Close message search"
                        : "Search this conversation"
                    }
                    aria-pressed={searchOpen}
                    onClick={() => {
                      setSearchOpen((previous) => !previous);
                      setMessageQuery("");
                    }}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 border-0 text-slate-500"
                        aria-label="Conversation menu"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onSelect={() => setDetailsOpen(true)}>
                        <Info className="mr-2 h-4 w-4" />
                        {isGroup ? "Group details" : "Contact profile"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={toggleSound}>
                        {soundEnabled ? (
                          <Volume2 className="mr-2 h-4 w-4" />
                        ) : (
                          <VolumeX className="mr-2 h-4 w-4" />
                        )}
                        {soundEnabled
                          ? "Mute message sounds"
                          : "Enable message sounds"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => {
                          setActionError("");
                          setClearOpen(true);
                        }}
                      >
                        <Eraser className="mr-2 h-4 w-4" />
                        Clear chat for me
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-700 focus:text-red-700"
                        onSelect={() => {
                          setActionError("");
                          setDeleteChatOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete chat for me
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>
              {searchOpen && (
                <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      autoFocus
                      aria-label="Search messages"
                      placeholder="Search this conversation (at least 2 characters)…"
                      value={messageQuery}
                      maxLength={200}
                      onChange={(event) => setMessageQuery(event.target.value)}
                      className="h-10 pl-9 pr-9"
                    />
                    <button
                      type="button"
                      aria-label="Clear message search"
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center border-0 text-slate-500"
                      onClick={() => setMessageQuery("")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {searchMode && !searching && (
                    <p className="mt-2 text-xs text-slate-500">
                      {searchTotal} result{searchTotal === 1 ? "" : "s"}
                      {searchTotal > searchResults.length
                        ? ` · showing the latest ${searchResults.length}`
                        : ""}
                    </p>
                  )}
                </div>
              )}
              <div
                ref={scrollRef}
                onScroll={(event) => {
                  const element = event.currentTarget;
                  setNearBottom(
                    element.scrollHeight -
                      element.scrollTop -
                      element.clientHeight <
                      90,
                  );
                }}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 lg:px-8"
                role="log"
                aria-label={
                  searchMode
                    ? "Message search results"
                    : "Conversation messages"
                }
                aria-live="polite"
                aria-relevant="additions"
                aria-busy={messagesLoading || searching}
              >
                {messagesLoading || searching ? (
                  <div
                    role="status"
                    className="flex h-full items-center justify-center gap-2 text-sm text-slate-500"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {searching ? "Searching messages…" : "Loading messages…"}
                  </div>
                ) : messagesError || searchError ? (
                  <div
                    role="alert"
                    className="mx-auto mt-10 max-w-sm rounded-xl border border-red-100 bg-white p-5 text-center text-sm text-red-800"
                  >
                    <CircleAlert className="mx-auto mb-3 h-6 w-6" />
                    <p>{messagesError || searchError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => void loadMessages(activeChatId)}
                    >
                      Try again
                    </Button>
                  </div>
                ) : (
                  <>
                    {!searchMode && hasOlderMessages && (
                      <div className="mb-5 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full bg-white text-xs text-slate-500"
                          disabled={loadingOlder}
                          onClick={() => void older()}
                        >
                          {loadingOlder ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <ChevronDown className="h-3 w-3 rotate-180" />
                          )}
                          Load earlier messages
                        </Button>
                      </div>
                    )}
                    {!visibleMessages.length ? (
                      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-primary/70">
                          <MessageCircle className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          {searchMode
                            ? "No messages found"
                            : `Say hello to ${isGroup ? "the team" : peer?.first_name || "your teammate"}`}
                        </p>
                        <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500">
                          {searchMode
                            ? "Try a different word or phrase."
                            : "Ask a question, share an update, or get the next project started."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {visibleMessages.map((message, index) => (
                          <div key={message.messages_id}>
                            {(index === 0 ||
                              dateLabel(message.timestamp) !==
                                dateLabel(
                                  visibleMessages[index - 1].timestamp,
                                )) && (
                              <div className="my-5 flex items-center justify-center">
                                <span className="rounded-full border border-slate-200/70 bg-white px-3 py-1 text-[10px] font-medium text-slate-500">
                                  {dateLabel(message.timestamp)}
                                </span>
                              </div>
                            )}
                            <MessageBubble
                              message={message}
                              own={message.sender_id === user?.user_id}
                              group={isGroup}
                              canPost={activeChat.can_post !== false}
                              onReply={() => {
                                setReply(message);
                                textareaRef.current?.focus();
                              }}
                              onEdit={() => {
                                setEditing(message);
                                setEditContent(message.content);
                                setActionError("");
                              }}
                              onDelete={() => {
                                setDeleting(message);
                                setActionError("");
                              }}
                              onRetry={() => {
                                setActionError("");
                                void retryMessage(message).catch((error) =>
                                  setActionError(
                                    error.message ||
                                      "Message could not be sent",
                                  ),
                                );
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              {!nearBottom && !searchMode && messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute bottom-40 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white shadow-md"
                  onClick={() => scrollToLatest(true)}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                  Latest messages
                </Button>
              )}
              <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:px-6 sm:py-4">
                {activeChat.can_post === false && (
                  <p className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    Only the creator can post in this group. You can still read
                    its messages.
                  </p>
                )}
                {actionError && !editing && !deleting && (
                  <div
                    role="alert"
                    className="mb-2 flex items-start justify-between gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800"
                  >
                    <p>{actionError}</p>
                    <button
                      type="button"
                      onClick={() => setActionError("")}
                      aria-label="Dismiss message error"
                      className="border-0 bg-transparent"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {reply && (
                  <div className="mb-2 flex items-start justify-between gap-3 rounded-lg border-l-2 border-primary bg-slate-50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-primary">
                        Replying to {userName(reply.sender)}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {reply.content}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Cancel reply"
                      onClick={() => setReply(null)}
                      className="border-0 bg-transparent p-1 text-slate-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void send();
                  }}
                  className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/5"
                >
                  <Textarea
                    ref={textareaRef}
                    aria-label="Write a message"
                    value={draft}
                    maxLength={10000}
                    rows={1}
                    onChange={(event) => updateDraft(event.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Write a message…"
                    disabled={
                      messagesLoading ||
                      !!messagesError ||
                      activeChat.can_post === false
                    }
                    className="max-h-[140px] min-h-10 resize-none rounded-lg border-0 bg-transparent px-2.5 py-2.5 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    aria-label="Send message"
                    disabled={
                      !draft.trim() ||
                      messagesLoading ||
                      !!messagesError ||
                      activeChat.can_post === false
                    }
                    className="h-10 w-10 shrink-0 rounded-lg"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <div className="mt-2 flex min-h-4 items-center justify-between text-[10px] text-slate-500">
                  <span className="hidden sm:inline">
                    Enter to send · Shift + Enter for a new line
                  </span>
                  <span className="sm:ml-auto">
                    {activeTyping.length ? (
                      <span className="text-primary">
                        {activeTyping
                          .map((person) => person.user_name.split(" ")[0])
                          .join(", ")}{" "}
                        {activeTyping.length === 1 ? "is" : "are"} typing…
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <CheckCheck className="h-3 w-3" />
                        Keep your team in the loop
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/10 bg-primary-light text-primary">
                <MessageSquare className="h-8 w-8 stroke-[1.5]" />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                Stay connected
              </p>
              <h2 className="text-xl font-bold tracking-tight text-slate-800">
                Good work starts with a conversation.
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
                Choose a conversation from your inbox, or reach out to someone
                on your team.
              </p>
              <Button
                variant="outline"
                onClick={() => setNewChatOpen(true)}
                className="mt-6 rounded-xl border-slate-200 bg-white text-primary"
              >
                <Plus className="h-4 w-4" />
                Start a conversation
              </Button>
            </div>
          )}
        </div>
      </div>
      <NewConversationDialog open={newChatOpen} onOpenChange={setNewChatOpen} />
      {activeChat && (
        <ChatDetailsSheet
          chat={activeChat}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
      <AlertDialog
        open={clearOpen}
        onOpenChange={(open) => {
          if (!saving) setClearOpen(open);
        }}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this chat for you?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes previous messages, search results, and message
              notifications from your view. Other participants keep their
              history. You’ll stay in this conversation and receive new
              messages. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p role="alert" className="text-sm text-red-700">
              {actionError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                setActionError("");
                try {
                  await clearChat(activeChatId);
                  setReply(null);
                  setEditing(null);
                  setDeleting(null);
                  setMessageQuery("");
                  setSearchResults([]);
                  setDrafts((previous) => ({
                    ...previous,
                    [activeChatId]: "",
                  }));
                  setClearOpen(false);
                } catch (error) {
                  setActionError(error.message || "Could not clear the chat");
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}Clear chat
              for me
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={deleteChatOpen}
        onOpenChange={(open) => {
          if (!saving) setDeleteChatOpen(open);
        }}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat for you?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the chat and its previous messages from your inbox.
              Other participants keep their copy. The chat will return if a new
              message arrives or you start the conversation again. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p role="alert" className="text-sm text-red-700">
              {actionError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={saving}
              onClick={async () => {
                const chatId = activeChatId;
                if (!chatId) return;
                setSaving(true);
                setActionError("");
                try {
                  await deleteChat(chatId);
                  setReply(null);
                  setEditing(null);
                  setDeleting(null);
                  setMessageQuery("");
                  setSearchResults([]);
                  setDrafts((previous) => ({ ...previous, [chatId]: "" }));
                  setDeleteChatOpen(false);
                } catch (error) {
                  setActionError(error.message || "Could not delete the chat");
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete chat for me
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open && !saving) {
            setEditing(null);
            setActionError("");
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit message</DialogTitle>
            <DialogDescription>
              Update your message for everyone in the conversation.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            autoFocus
            aria-label="Edit message content"
            value={editContent}
            maxLength={10000}
            onChange={(event) => setEditContent(event.target.value)}
            className="min-h-28"
          />
          {actionError && (
            <p role="alert" className="text-sm text-red-700">
              {actionError}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={saving || !editContent.trim()}
              onClick={() => void mutate()}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save
              changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !saving) {
            setDeleting(null);
            setActionError("");
          }
        }}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the message for everyone in the conversation. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p role="alert" className="text-sm text-red-700">
              {actionError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={saving}
              onClick={() => void mutate(true)}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}Delete
              message
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
