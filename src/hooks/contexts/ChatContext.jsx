
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../../services/mockApiService.js';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [chatsData, usersData] = await Promise.all([
          apiService.get('chats'),
          apiService.get('chatUsers')
        ]);
        setChats(chatsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading chat data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  const getUserChats = (userId, userRole) => {
    return chats.filter(chat => {
      const isParticipant = chat.participants.includes(String(userId));
      if (!isParticipant) return false;

      // Role-based filtering
      const otherParticipantId = chat.participants.find(id => id !== String(userId));
      const otherUser = users.find(u => u.id === otherParticipantId);
      
      if (!otherUser) return false;

      // Engineers can chat with PMs and Admins
      if (userRole === 'engineer') {
        return otherUser.role === 'pm' || otherUser.role === 'admin';
      }
      
      // PMs can chat with Engineers and Admins
      if (userRole === 'pm') {
        return otherUser.role === 'engineer' || otherUser.role === 'admin';
      }
      
      // Admins can chat with Engineers and PMs
      if (userRole === 'admin') {
        return otherUser.role === 'engineer' || otherUser.role === 'pm';
      }

      return false;
    });
  };

  const getAvailableUsers = (currentUserId, currentUserRole) => {
    return users.filter(user => {
      if (user.id === String(currentUserId)) return false;

      // Engineers can message PMs and Admins
      if (currentUserRole === 'engineer') {
        return user.role === 'pm' || user.role === 'admin';
      }
      
      // PMs can message Engineers and Admins
      if (currentUserRole === 'pm') {
        return user.role === 'engineer' || user.role === 'admin';
      }
      
      // Admins can message Engineers and PMs
      if (currentUserRole === 'admin') {
        return user.role === 'engineer' || user.role === 'pm';
      }

      return false;
    });
  };

  const sendMessage = async (chatId, senderId, content) => {
    try {
      const newMessage = {
        id: `msg-${Date.now()}`,
        senderId: String(senderId),
        content,
        timestamp: new Date().toISOString()
      };

      // Find the chat and update it
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return;

      const updatedMessages = [...chat.messages, newMessage];
      const updatedUnreadCount = { ...chat.unreadCount };
      
      // Update unread count for other participants
      chat.participants.forEach(participantId => {
        if (participantId !== String(senderId)) {
          updatedUnreadCount[participantId] = (updatedUnreadCount[participantId] || 0) + 1;
        }
      });

      const updatedChat = {
        ...chat,
        messages: updatedMessages,
        lastMessage: newMessage,
        unreadCount: updatedUnreadCount
      };

      // Update in database
      await apiService.put('chats', chatId.replace('chat-', ''), updatedChat);

      // Update local state
      setChats(prevChats => 
        prevChats.map(c => c.id === chatId ? updatedChat : c)
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (chatId, userId) => {
    try {
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return;

      const updatedUnreadCount = { ...chat.unreadCount };
      updatedUnreadCount[String(userId)] = 0;

      const updatedChat = {
        ...chat,
        unreadCount: updatedUnreadCount
      };

      // Update in database
      await apiService.put('chats', chatId.replace('chat-', ''), updatedChat);

      // Update local state
      setChats(prevChats => 
        prevChats.map(c => c.id === chatId ? updatedChat : c)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const createOrGetChat = async (userId1, userId2) => {
    const existingChat = chats.find(chat => 
      chat.participants.includes(String(userId1)) && 
      chat.participants.includes(String(userId2))
    );

    if (existingChat) {
      return existingChat;
    }

    try {
      // Create new chat
      const newChat = {
        id: `chat-${Date.now()}`,
        participants: [String(userId1), String(userId2)],
        messages: [],
        lastMessage: null,
        unreadCount: { [String(userId1)]: 0, [String(userId2)]: 0 }
      };

      const createdChat = await apiService.post('chats', newChat);
      setChats(prevChats => [...prevChats, createdChat]);
      return createdChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  const getChatById = (chatId) => {
    return chats.find(chat => chat.id === chatId);
  };

  const getUserById = (userId) => {
    return users.find(user => user.id === String(userId));
  };

  const value = {
    chats,
    users,
    selectedChatId,
    setSelectedChatId,
    getUserChats,
    getAvailableUsers,
    sendMessage,
    markAsRead,
    createOrGetChat,
    getChatById,
    getUserById
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
