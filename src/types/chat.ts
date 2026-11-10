export interface ChatUser {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role?: string | { role_key: string; name: string };
  job_title?: string;
  department?: string;
  company?: string;
  city?: string;
  country?: string;
}
export interface ChatMessage {
  messages_id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  message_sequence?: string;
  reply_unavailable?: boolean;
  message_type?: string;
  attachments?: { url?: string; name?: string }[];
  reply_to?: string;
  replyToMessage?: ChatMessage;
  sender?: ChatUser;
  read_by?: Record<string, string>;
  is_edited?: boolean;
  is_deleted?: boolean;
  delivery?: "sending" | "failed";
}
export interface Conversation {
  chats_id: string;
  chat_type: "direct" | "group" | "support";
  chat_name?: string;
  description?: string;
  avatar_url?: string;
  posting_policy?: "all_members" | "creator_only";
  created_by?: string;
  can_manage?: boolean;
  can_post?: boolean;
  cleared_through_sequence?: string;
  participants: string[];
  participant_details: ChatUser[];
  unread_count: number;
  last_message_id?: string;
  last_message_sequence?: string;
  last_message_content?: string;
  last_message_sender_id?: string;
  last_message_timestamp?: string;
  updated_at: string;
}
export interface Paginated<T> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  messages?: T[];
}
export const userName = (user?: ChatUser) =>
  [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
  "Team member";
export const roleName = (user?: ChatUser) => {
  const role =
    typeof user?.role === "object"
      ? user.role.name || user.role.role_key
      : user?.role;
  return (role || "Team member").replace(/_/g, " ");
};
export const conversationName = (chat: Conversation, userId: string) =>
  chat.chat_name ||
  userName(
    chat.participant_details?.find((person) => person.user_id !== userId),
  );
