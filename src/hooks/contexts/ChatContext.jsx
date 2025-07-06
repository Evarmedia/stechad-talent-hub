
import React, { createContext, useContext, useState } from 'react';
import { simulateDelay } from '../../data/mockData.js';

const ChatContext = createContext();

// Enhanced mock chat data with realistic conversations using actual user IDs from auth system
const mockChats = [
  {
    id: 'chat-1',
    participants: ['1', '2'], // engineer user ID 1 and pm user ID 2
    type: 'pm-engineer',
    lastMessage: 'Sure, I can start working on the authentication module next week',
    lastMessageTime: new Date('2024-01-15T14:30:00'),
    unreadCount: 1,
    messages: [
      {
        id: 'msg-1',
        senderId: '2',
        content: 'Hi John! I wanted to discuss the upcoming React project with you.',
        timestamp: new Date('2024-01-15T09:00:00'),
        isRead: true
      },
      {
        id: 'msg-2',
        senderId: '1',
        content: 'Hello Sarah! I\'m excited about it. What are the main requirements?',
        timestamp: new Date('2024-01-15T09:15:00'),
        isRead: true
      },
      {
        id: 'msg-3',
        senderId: '2',
        content: 'We need to build a user authentication system and a dashboard. The timeline is 3 weeks.',
        timestamp: new Date('2024-01-15T10:00:00'),
        isRead: true
      },
      {
        id: 'msg-4',
        senderId: '2',
        content: 'Can you handle the authentication module first?',
        timestamp: new Date('2024-01-15T14:00:00'),
        isRead: true
      },
      {
        id: 'msg-5',
        senderId: '1',
        content: 'Sure, I can start working on the authentication module next week',
        timestamp: new Date('2024-01-15T14:30:00'),
        isRead: false
      }
    ]
  },
  {
    id: 'chat-2',
    participants: ['3', '2'], // engineer user ID 3 and pm user ID 2
    type: 'pm-engineer',
    lastMessage: 'The API integration is complete and ready for testing',
    lastMessageTime: new Date('2024-01-15T12:45:00'),
    unreadCount: 0,
    messages: [
      {
        id: 'msg-6',
        senderId: '2',
        content: 'Hey Mike, how\'s the API integration going?',
        timestamp: new Date('2024-01-15T11:00:00'),
        isRead: true
      },
      {
        id: 'msg-7',
        senderId: '3',
        content: 'Going well! I\'ve completed the user endpoints and working on the data endpoints now.',
        timestamp: new Date('2024-01-15T11:30:00'),
        isRead: true
      },
      {
        id: 'msg-8',
        senderId: '3',
        content: 'The API integration is complete and ready for testing',
        timestamp: new Date('2024-01-15T12:45:00'),
        isRead: true
      }
    ]
  },
  {
    id: 'chat-3',
    participants: ['1', 'admin'], // engineer user ID 1 and admin
    type: 'admin-engineer',
    lastMessage: 'Thanks for the clarification! I\'ll update my profile accordingly.',
    lastMessageTime: new Date('2024-01-14T16:20:00'),
    unreadCount: 2,
    messages: [
      {
        id: 'msg-9',
        senderId: 'admin',
        content: 'Hi John, I noticed your profile needs some updates for compliance.',
        timestamp: new Date('2024-01-14T15:00:00'),
        isRead: true
      },
      {
        id: 'msg-10',
        senderId: '1',
        content: 'Hi! What specific updates do I need to make?',
        timestamp: new Date('2024-01-14T15:30:00'),
        isRead: true
      },
      {
        id: 'msg-11',
        senderId: 'admin',
        content: 'Please add your certifications and update your skill level for React to Expert.',
        timestamp: new Date('2024-01-14T16:00:00'),
        isRead: false
      },
      {
        id: 'msg-12',
        senderId: '1',
        content: 'Thanks for the clarification! I\'ll update my profile accordingly.',
        timestamp: new Date('2024-01-14T16:20:00'),
        isRead: false
      }
    ]
  },
  {
    id: 'chat-4',
    participants: ['4', 'admin'], // engineer user ID 4 and admin
    type: 'admin-engineer',
    lastMessage: 'The verification process is now complete',
    lastMessageTime: new Date('2024-01-13T10:15:00'),
    unreadCount: 0,
    messages: [
      {
        id: 'msg-13',
        senderId: 'admin',
        content: 'Welcome to STECHAD! Your account is under review.',
        timestamp: new Date('2024-01-13T08:00:00'),
        isRead: true
      },
      {
        id: 'msg-14',
        senderId: '4',
        content: 'Thank you! How long does the review process usually take?',
        timestamp: new Date('2024-01-13T08:30:00'),
        isRead: true
      },
      {
        id: 'msg-15',
        senderId: 'admin',
        content: 'Usually 1-2 business days. I\'ll let you know once it\'s complete.',
        timestamp: new Date('2024-01-13T09:00:00'),
        isRead: true
      },
      {
        id: 'msg-16',
        senderId: 'admin',
        content: 'The verification process is now complete',
        timestamp: new Date('2024-01-13T10:15:00'),
        isRead: true
      }
    ]
  }
];

// User mapping for display names - matching the auth system user IDs
const userMap = {
  '1': { name: 'John Smith', role: 'engineer' },
  '2': { name: 'Sarah Davis', role: 'pm' },
  '3': { name: 'Mike Johnson', role: 'engineer' },
  '4': { name: 'Lisa Wang', role: 'engineer' },
  'admin': { name: 'Admin', role: 'admin' }
};

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState(mockChats);
  const [loading, setLoading] = useState(false);

  const getChatsForUser = async (userId, userRole) => {
    setLoading(true);
    await simulateDelay();
    
    console.log('Getting chats for user:', userId, 'with role:', userRole);
    console.log('User ID type:', typeof userId);
    
    // Convert userId to string to ensure proper comparison
    const userIdStr = String(userId);
    
    // Filter chats based on user role and participation
    const userChats = chats.filter(chat => {
      const isParticipant = chat.participants.includes(userIdStr);
      const isValidType = 
        (userRole === 'engineer' && (chat.type === 'pm-engineer' || chat.type === 'admin-engineer')) ||
        (userRole === 'pm' && chat.type === 'pm-engineer') ||
        (userRole === 'admin' && chat.type === 'admin-engineer');
      
      console.log(`Chat ${chat.id}: participant=${isParticipant}, validType=${isValidType}, type=${chat.type}, participants=${JSON.stringify(chat.participants)}, userIdStr=${userIdStr}`);
      return isParticipant && isValidType;
    });
    
    console.log('Filtered chats:', userChats);
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

  const getUserName = (userId) => {
    return userMap[userId]?.name || `User ${userId}`;
  };

  const value = {
    chats,
    loading,
    getChatsForUser,
    getChatById,
    sendMessage,
    markMessagesAsRead,
    createChat,
    getUserName
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
