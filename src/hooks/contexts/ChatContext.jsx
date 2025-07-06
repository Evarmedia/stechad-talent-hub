import React, { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

// Mock chat data with proper role-based conversations
const mockChats = [
  {
    id: 'chat-1',
    participants: ['1', '2'], // engineer and pm
    messages: [
      { id: 'msg-1', senderId: '2', content: 'Hi! I reviewed your application for the React Developer position. Could we schedule a quick chat?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { id: 'msg-2', senderId: '1', content: 'Absolutely! I\'m available this week. What time works best for you?', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) },
      { id: 'msg-3', senderId: '2', content: 'How about tomorrow at 2 PM? We can discuss the project requirements in detail.', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
    ],
    lastMessage: { id: 'msg-3', senderId: '2', content: 'How about tomorrow at 2 PM? We can discuss the project requirements in detail.', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
    unreadCount: { '1': 1, '2': 0 }
  },
  {
    id: 'chat-2',
    participants: ['1', 'admin'],
    messages: [
      { id: 'msg-4', senderId: 'admin', content: 'Welcome to STECHAD! Your profile has been approved. You can now apply for jobs.', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { id: 'msg-5', senderId: '1', content: 'Thank you! I\'m excited to get started. Are there any specific guidelines I should follow?', timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000) },
      { id: 'msg-6', senderId: 'admin', content: 'Just make sure to keep your profile updated and apply only to positions that match your skills.', timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000) },
    ],
    lastMessage: { id: 'msg-6', senderId: 'admin', content: 'Just make sure to keep your profile updated and apply only to positions that match your skills.', timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000) },
    unreadCount: { '1': 0, 'admin': 0 }
  },
  {
    id: 'chat-3',
    participants: ['3', '2'], // another engineer and pm
    messages: [
      { id: 'msg-7', senderId: '3', content: 'I have a question about the Node.js project timeline.', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
      { id: 'msg-8', senderId: '2', content: 'Sure! What would you like to know?', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    ],
    lastMessage: { id: 'msg-8', senderId: '2', content: 'Sure! What would you like to know?', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    unreadCount: { '3': 0, '2': 1 }
  },
  {
    id: 'chat-4',
    participants: ['4', 'admin'], // engineer and admin
    messages: [
      { id: 'msg-9', senderId: '4', content: 'I need help with updating my portfolio links.', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) },
      { id: 'msg-10', senderId: 'admin', content: 'You can update your portfolio in the Profile section. Let me know if you need any assistance.', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    ],
    lastMessage: { id: 'msg-10', senderId: 'admin', content: 'You can update your portfolio in the Profile section. Let me know if you need any assistance.', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    unreadCount: { '4': 0, 'admin': 1 }
  },
  {
    id: 'chat-5',
    participants: ['2', 'admin'], // pm and admin
    messages: [
      { id: 'msg-11', senderId: '2', content: 'Hi Admin, I wanted to discuss the hiring targets for Q1.', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) },
      { id: 'msg-12', senderId: 'admin', content: 'Sure! Let\'s schedule a meeting to go over the numbers and strategy.', timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000) },
    ],
    lastMessage: { id: 'msg-12', senderId: 'admin', content: 'Sure! Let\'s schedule a meeting to go over the numbers and strategy.', timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000) },
    unreadCount: { '2': 0, 'admin': 1 }
  }
];

// Mock users data
const mockUsers = [
  { id: '1', name: 'Alex Johnson', role: 'engineer', avatar: '/api/placeholder/32/32', email: 'alex@example.com' },
  { id: '2', name: 'Sarah Wilson', role: 'pm', avatar: '/api/placeholder/32/32', email: 'sarah@example.com' },
  { id: '3', name: 'Mike Chen', role: 'engineer', avatar: '/api/placeholder/32/32', email: 'mike@example.com' },
  { id: '4', name: 'Lisa Davis', role: 'engineer', avatar: '/api/placeholder/32/32', email: 'lisa@example.com' },
  { id: 'admin', name: 'Admin User', role: 'admin', avatar: '/api/placeholder/32/32', email: 'admin@stechad.com' }
];

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState(mockChats);
  const [users, setUsers] = useState(mockUsers);
  const [selectedChatId, setSelectedChatId] = useState(null);

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

  const sendMessage = (chatId, senderId, content) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: String(senderId),
      content,
      timestamp: new Date()
    };

    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === chatId) {
          const updatedMessages = [...chat.messages, newMessage];
          const updatedUnreadCount = { ...chat.unreadCount };
          
          // Update unread count for other participants
          chat.participants.forEach(participantId => {
            if (participantId !== String(senderId)) {
              updatedUnreadCount[participantId] = (updatedUnreadCount[participantId] || 0) + 1;
            }
          });

          return {
            ...chat,
            messages: updatedMessages,
            lastMessage: newMessage,
            unreadCount: updatedUnreadCount
          };
        }
        return chat;
      })
    );
  };

  const markAsRead = (chatId, userId) => {
    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === chatId) {
          const updatedUnreadCount = { ...chat.unreadCount };
          updatedUnreadCount[String(userId)] = 0;
          return {
            ...chat,
            unreadCount: updatedUnreadCount
          };
        }
        return chat;
      })
    );
  };

  const createOrGetChat = (userId1, userId2) => {
    const existingChat = chats.find(chat => 
      chat.participants.includes(String(userId1)) && 
      chat.participants.includes(String(userId2))
    );

    if (existingChat) {
      return existingChat;
    }

    // Create new chat
    const newChat = {
      id: `chat-${Date.now()}`,
      participants: [String(userId1), String(userId2)],
      messages: [],
      lastMessage: null,
      unreadCount: { [String(userId1)]: 0, [String(userId2)]: 0 }
    };

    setChats(prevChats => [...prevChats, newChat]);
    return newChat;
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
