
import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Users, MessageSquare, User, ArrowLeft, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChatContext } from '@/hooks/contexts/ChatContext';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatInterface = () => {
  const { user } = useAuthContext();
  const isMobile = useIsMobile();
  const {
    getUserChats,
    getAvailableUsers,
    selectedChatId,
    setSelectedChatId,
    sendMessage,
    markAsRead,
    createOrGetChat,
    getChatById,
    getUserById
  } = useChatContext();

  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const messagesEndRef = useRef(null);
  const newChatModalRef = useRef(null);

  const userChats = getUserChats(user?.id, user?.role);
  const availableUsers = getAvailableUsers(user?.id, user?.role);
  const selectedChat = selectedChatId ? getChatById(selectedChatId) : null;

  const filteredUsers = availableUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages]);

  useEffect(() => {
    if (selectedChatId && user) {
      markAsRead(selectedChatId, user.id);
    }
  }, [selectedChatId, user, markAsRead]);

  useEffect(() => {
    if (isMobile && selectedChatId) {
      setShowChatList(false);
    }
  }, [selectedChatId, isMobile]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (newChatModalRef.current && !newChatModalRef.current.contains(event.target)) {
        setShowNewChatModal(false);
        setSearchTerm('');
      }
    };

    if (showNewChatModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNewChatModal]);

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedChatId && user) {
      try {
        await sendMessage(selectedChatId, user.id, messageInput.trim());
        setMessageInput('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUserSelect = async (selectedUserId) => {
    if (user) {
      try {
        const chat = await createOrGetChat(user.id, selectedUserId);
        setSelectedChatId(chat.id);
        setShowNewChatModal(false);
        setSearchTerm('');
      } catch (error) {
        console.error('Error creating/getting chat:', error);
      }
    }
  };

  const handleBackToList = () => {
    setShowChatList(true);
    if (isMobile) {
      setSelectedChatId(null);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getChatDisplayName = (chat) => {
    if (!user) return 'Unknown';
    const otherParticipantId = chat.participants.find(id => id !== String(user.id));
    const otherUser = getUserById(otherParticipantId);
    return otherUser ? otherUser.name : 'Unknown User';
  };

  const getChatDisplayRole = (chat) => {
    if (!user) return '';
    const otherParticipantId = chat.participants.find(id => id !== String(user.id));
    const otherUser = getUserById(otherParticipantId);
    return otherUser ? otherUser.role.toUpperCase() : '';
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] max-w-full mx-auto bg-white rounded-lg border overflow-hidden">
      {/* Conversations List */}
      <div className={`${
        isMobile 
          ? showChatList ? 'w-full' : 'hidden' 
          : 'w-80 min-w-80'
      } border-r bg-gray-50 flex flex-col relative`}>
        <div className="p-3 border-b bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Conversations</h2>
            <Button
              onClick={() => setShowNewChatModal(!showNewChatModal)}
              size="sm"
              variant="outline"
              className="h-8 px-2 text-xs"
            >
              <Users className="w-3 h-3 mr-1" />
              New
            </Button>
          </div>

          {showNewChatModal && (
            <div 
              ref={newChatModalRef}
              className="absolute top-16 left-0 right-0 bg-white border rounded-lg shadow-lg z-50 mx-3"
            >
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">New Conversation</h3>
                  <Button
                    onClick={() => {
                      setShowNewChatModal(false);
                      setSearchTerm('');
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 h-8 text-xs"
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredUsers.map((availableUser) => (
                  <div
                    key={availableUser.id}
                    onClick={() => handleUserSelect(availableUser.id)}
                    className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarImage src={availableUser.avatar} />
                      <AvatarFallback className="text-xs">
                        {availableUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{availableUser.name}</p>
                      <p className="text-xs text-gray-500">{availableUser.role.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && searchTerm && (
                  <p className="text-xs text-gray-500 text-center py-4">No users found</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="overflow-y-auto flex-1">
          {userChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Start a new chat to begin</p>
            </div>
          ) : (
            userChats
              .sort((a, b) => {
                const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
                const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
                return bTime - aTime;
              })
              .map((chat) => {
                const unreadCount = chat.unreadCount[String(user?.id)] || 0;
                const isSelected = selectedChatId === chat.id;

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setSelectedChatId(chat.id);
                      if (isMobile) setShowChatList(false);
                    }}
                    className={`p-3 cursor-pointer border-b border-gray-100 hover:bg-white transition-colors ${
                      isSelected ? 'bg-white border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <Avatar className="w-8 h-8 mr-3 flex-shrink-0">
                        <AvatarFallback className="text-xs">
                          {getChatDisplayName(chat).split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {getChatDisplayName(chat)}
                          </p>
                          {chat.lastMessage && (
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTime(chat.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {getChatDisplayRole(chat)}
                          </Badge>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs h-4 min-w-4 px-1">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <p className="text-xs text-gray-600 truncate mt-1">
                            {chat.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className={`${
        isMobile 
          ? showChatList ? 'hidden' : 'w-full' 
          : 'flex-1'
      } flex flex-col bg-white`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-3">
              <div className="flex items-center">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="mr-2 p-1 h-8 w-8"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <Avatar className="w-8 h-8 mr-3">
                  <AvatarFallback className="text-xs">
                    {getChatDisplayName(selectedChat).split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-sm text-gray-900">{getChatDisplayName(selectedChat)}</h3>
                  <p className="text-xs text-gray-500">{getChatDisplayRole(selectedChat)}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {selectedChat.messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs">Start the conversation!</p>
                </div>
              ) : (
                selectedChat.messages.map((message, index) => {
                  const isCurrentUser = String(message.senderId) === String(user?.id);
                  const showDate = index === 0 || 
                    formatDate(message.timestamp) !== formatDate(selectedChat.messages[index - 1].timestamp);

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center text-xs text-gray-500 my-3">
                          {formatDate(message.timestamp)}
                        </div>
                      )}
                      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                          isCurrentUser 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-3">
              <div className="flex items-center space-x-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 h-9"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!messageInput.trim()}
                  size="sm"
                  className="h-9 px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-700 mb-1">Select a conversation</p>
              <p className="text-sm text-gray-500">Choose from existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
