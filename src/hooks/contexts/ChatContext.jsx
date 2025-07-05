
import React, { createContext, useContext, useState } from 'react';
import { simulateDelay } from '../../data/mockData.js';

const ChatContext = createContext();

// Mock chat data
const mockChats = [
  {
    id: 'chat-1',
    participants: ['user-1', 'user-2'], // engineer and pm/admin
    type: 'pm-engineer', // or 'admin-engineer'
    lastMessage: 'Looking forward to the interview tomorrow',
    lastMessageTime: new Date('2024-01-15T10:30:00'),
    unreadCount: 2,
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-1',
        content: 'Hi, I saw your application for the React Developer position',
        timestamp: new Date('2024-01-15T09:00:00'),
        isRead: true
      },
      {
        id: 'msg-2',
        senderId: 'user-2',
        content: 'Hello! Yes, I\'m very interested in this opportunity',
        timestamp: new Date('2024-01-15T09:15:00'),
        isRead: true
      },
      {
        id: 'msg-3',
        senderId: 'user-1',
        content: 'Great! I\'d like to schedule an interview with you',
        timestamp: new Date('2024-01-15T10:00:00'),
        isRead: true
      },
      {
        id: 'msg-4',
        senderId: 'user-2',
        content: 'Looking forward to the interview tomorrow',
        timestamp: new Date('2024-01-15T10:30:00'),
        isRead: false
      }
    ]
  }
];

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState(mockChats);
  const [loading, setLoading] = useState(false);

  const getChatsForUser = async (userId, userRole) => {
    setLoading(true);
    await simulateDelay();
    
    // Filter chats based on user role and participation
    const userChats = chats.filter(chat => {
      const isParticipant = chat.participants.includes(userId);
      const isValidType = 
        (userRole === 'engineer' && (chat.type === 'pm-engineer' || chat.type === 'admin-engineer')) ||
        (userRole === 'pm' && chat.type === 'pm-engineer') ||
        (userRole === 'admin' && chat.type === 'admin-engineer');
      
      return isParticipant && isValidType;
    });
    
    setLoading(false);
    return userChats;
  };

  const getChatById = async (chatId) => {
    await simulateDelay(200);
    return chats.find(chat => chat.id === chatId);
  };

  const sendMessage = async (chatId, senderId, content) => {
    setLoading(true);
    await simulateDelay(500);
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      content,
      timestamp: new Date(),
      isRead: false
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: content,
          lastMessageTime: new Date(),
          unreadCount: chat.unreadCount + 1
        };
      }
      return chat;
    }));
    
    setLoading(false);
    return newMessage;
  };

  const markMessagesAsRead = async (chatId, userId) => {
    await simulateDelay(200);
    
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = chat.messages.map(msg => 
          msg.senderId !== userId ? { ...msg, isRead: true } : msg
        );
        return {
          ...chat,
          messages: updatedMessages,
          unreadCount: 0
        };
      }
      return chat;
    }));
  };

  const createChat = async (participants, type) => {
    setLoading(true);
    await simulateDelay();
    
    const newChat = {
      id: `chat-${Date.now()}`,
      participants,
      type,
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0,
      messages: []
    };

    setChats(prev => [...prev, newChat]);
    setLoading(false);
    return newChat;
  };

  const value = {
    chats,
    loading,
    getChatsForUser,
    getChatById,
    sendMessage,
    markMessagesAsRead,
    createChat
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
