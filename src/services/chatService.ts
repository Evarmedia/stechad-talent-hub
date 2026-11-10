import apiService from "./apiService";
import type {
  ChatMessage,
  ChatUser,
  Conversation,
  Paginated,
} from "@/types/chat";

const data = <T>(response: unknown): T => {
  const result = response as { success?: boolean; data: T; message?: string };
  if (!result?.success)
    throw new Error(result?.message || "Unable to complete the chat request");
  return result.data;
};
export const chatService = {
  async chats() {
    return data<{
      chats: Conversation[];
      pagination: Paginated<never>["pagination"];
    }>(await apiService.get("chat", { limit: 100 }));
  },
  async users(search = "") {
    return data<{
      users: ChatUser[];
      pagination: Paginated<never>["pagination"];
    }>(await apiService.get("chat/users", { search, limit: 50 }));
  },
  async create(
    participant_ids: string[],
    chat_type = "direct",
    chat_name: string = null,
  ) {
    return data<Conversation>(
      await apiService.post("chat", { participant_ids, chat_type, chat_name }),
    );
  },
  async messages(chatId: string, filters = {}) {
    return data<{
      messages: ChatMessage[];
      pagination: Paginated<never>["pagination"];
    }>(
      await apiService.get(`chat/${chatId}/messages`, {
        limit: 50,
        ...filters,
      }),
    );
  },
  async send(
    chatId: string,
    content: string,
    reply_to?: string,
    client_message_id?: string,
  ) {
    return data<ChatMessage>(
      await apiService.post(`chat/${chatId}/messages`, {
        content,
        reply_to,
        client_message_id,
      }),
    );
  },
  async read(chatId: string, message_ids: string[] = []) {
    return data<{ unread_count: number; read_at: string }>(
      await apiService.post(`chat/${chatId}/read`, { message_ids }),
    );
  },
  async edit(messageId: string, content: string) {
    return data<ChatMessage>(
      await apiService.put("chat/messages", messageId, { content }),
    );
  },
  async remove(messageId: string) {
    return data<ChatMessage>(
      await apiService.delete("chat/messages", messageId),
    );
  },
  async search(chatId: string, query: string) {
    return data<{
      messages: ChatMessage[];
      pagination: Paginated<never>["pagination"];
    }>(
      await apiService.get("chat/search", {
        chat_id: chatId,
        query,
        limit: 50,
      }),
    );
  },
};
