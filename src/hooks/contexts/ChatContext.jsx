import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../../services/apiService.js';
import websocketService from '../../services/websocketService.js';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = apiService.getToken();
    if (token) {
      websocketService.connect();

      // Set up WebSocket listeners
      websocketService.on('new_message', handleNewMessage);
      websocketService.on('message_sent', handleMessageSent);
      websocketService.on('user_typing', handleUserTyping);
      websocketService.on('user_stopped_typing', handleUserStoppedTyping);
      websocketService.on('messages_read', handleMessagesRead);
      websocketService.on('user_online', handleUserOnline);
      websocketService.on('user_offline', handleUserOffline);
      websocketService.on('online_users', handleOnlineUsers);

      return () => {
        websocketService.off('new_message', handleNewMessage);
        websocketService.off('message_sent', handleMessageSent);
        websocketService.off('user_typing', handleUserTyping);
        websocketService.off('user_stopped_typing', handleUserStoppedTyping);
        websocketService.off('messages_read', handleMessagesRead);
        websocketService.off('user_online', handleUserOnline);
        websocketService.off('user_offline', handleUserOffline);
        websocketService.off('online_users', handleOnlineUsers);
        websocketService.disconnect();
      };
    }
  }, []);

  const handleNewMessage = (data) => {
    const { message, chat_id } = data;
    
    // Update messages if it's the active chat
    if (activeChat && activeChat.chats_id === chat_id) {
      setMessages(prev => [...prev, message]);
    }
    
    // Update chat list
    setChats(prev => prev.map(chat => 
      chat.chats_id === chat_id ? {
        ...chat,
        last_message_content: message.content,
        last_message_timestamp: message.timestamp
      } : chat
    ));
  };

  const handleMessageSent = (data) => {
    if (data.success && data.message) {
      console.log('Message sent successfully');
    } else {
      console.error('Message send failed:', data.error);
    }
  };

  const handleUserTyping = (data) => {
    const { user_id, user_name, chat_id } = data;
    setTypingUsers(prev => ({
      ...prev,
      [chat_id]: { user_id, user_name }
    }));
  };

  const handleUserStoppedTyping = (data) => {
    const { chat_id } = data;
    setTypingUsers(prev => {
      const updated = { ...prev };
      delete updated[chat_id];
      return updated;
    });
  };

  const handleMessagesRead = (data) => {
    const { user_id, chat_id, message_ids } = data;
    setMessages(prev => prev.map(msg => {
      if (!message_ids || message_ids.includes(msg.messages_id)) {
        return {
          ...msg,
          read_by: {
            ...msg.read_by,
            [user_id]: new Date().toISOString()
          }
        };
      }
      return msg;
    }));
  };

  const handleUserOnline = (data) => {
    const { user_id, user } = data;
    setOnlineUsers(prev => [...prev.filter(u => u.user_id !== user_id), { user_id, ...user }]);
  };

  const handleUserOffline = (data) => {
    const { user_id } = data;
    setOnlineUsers(prev => prev.filter(u => u.user_id !== user_id));
  };

  const handleOnlineUsers = (data) => {
    setOnlineUsers(data.onlineUsers || []);
  };

  // REST API methods
  const getChats = async (filters = {}) => {
    setLoading(true);
    try {
      let params = {
        page: filters.page || 1,
        limit: filters.limit || 50
      };

      if (filters.chat_type) {
        params.chat_type = filters.chat_type;
      }

      const response = await apiService.get('chat', null, params);
      const chatsData = response.success && response.data ? 
        response.data.chats || response.data : [];
      
      setChats(chatsData);
      return chatsData;
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (participantIds, chatType = 'direct', chatName = null) => {
    setLoading(true);
    try {
      const response = await apiService.post('chat', {
        participant_ids: participantIds,
        chat_type: chatType,
        chat_name: chatName
      });
      
      const createdChat = response.success && response.data ? 
        response.data.chat || response.data : null;
      
      if (createdChat) {
        setChats(prev => [createdChat, ...prev]);
        setActiveChat(createdChat);
        websocketService.joinChat(createdChat.chats_id);
      }
      
      return createdChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getChatMessages = async (chatId, filters = {}) => {
    setLoading(true);
    try {
      let params = {
        page: filters.page || 1,
        limit: filters.limit || 50
      };

      if (filters.before_timestamp) {
        params.before_timestamp = filters.before_timestamp;
      }

      const response = await apiService.get(`chat/${chatId}/messages`, null, params);
      const messagesData = response.success && response.data ? 
        response.data.messages || response.data : [];
      
      setMessages(messagesData);
      return messagesData;
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (chatId, content, messageType = 'text', attachments = [], replyTo = null) => {
    // Optimistic update
    const tempMessage = {
      messages_id: `temp-${Date.now()}`,
      chat_id: chatId,
      content,
      message_type: messageType,
      attachments,
      reply_to: replyTo,
      timestamp: new Date().toISOString(),
      is_sending: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    // Send via WebSocket
    websocketService.sendMessage(chatId, content, messageType, attachments, replyTo);
  };

  const markAsRead = async (chatId, messageIds = []) => {
    try {
      const response = await apiService.post(`chat/${chatId}/read`, {
        message_ids: messageIds
      });
      
      // Also send via WebSocket
      websocketService.markMessagesRead(chatId, messageIds);
      
      return response;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  };

  const searchMessages = async (query, filters = {}) => {
    try {
      let params = {
        query,
        page: filters.page || 1,
        limit: filters.limit || 20
      };

      if (filters.chat_id) {
        params.chat_id = filters.chat_id;
      }

      const response = await apiService.get('chat/search', null, params);
      return response.success && response.data ? 
        response.data.messages || response.data : [];
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  };

  const value = {
    chats,
    activeChat,
    messages,
    onlineUsers,
    typingUsers,
    loading,
    getChats,
    createChat,
    getChatMessages,
    sendMessage,
    markAsRead,
    searchMessages,
    setActiveChat,
    typingStart: (chatId) => websocketService.typingStart(chatId),
    typingStop: (chatId) => websocketService.typingStop(chatId),
    joinChat: (chatId) => websocketService.joinChat(chatId),
    leaveChat: (chatId) => websocketService.leaveChat(chatId)
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
