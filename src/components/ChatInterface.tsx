
import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Users, MessageSquare, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChatContext } from '@/hooks/contexts/ChatContext';
import { useAuthContext } from '@/hooks/useAuthContext';

const ChatInterface = () => {
  const { user } = useAuthContext();
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
  const messagesEndRef = useRef(null);

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

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedChatId && user) {
      sendMessage(selectedChatId, user.id, messageInput.trim());
      setMessageInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUserSelect = (selectedUserId) => {
    if (user) {
      const chat = createOrGetChat(user.id, selectedUserId);
      setSelectedChatId(chat.id);
      setShowNewChatModal(false);
      setSearchTerm('');
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
    <div className="flex h-[calc(100vh-8rem)] max-w-7xl mx-auto">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button
              onClick={() => setShowNewChatModal(!showNewChatModal)}
              size="sm"
              variant="outline"
            >
              <Users className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {showNewChatModal && (
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Start New Conversation</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {filteredUsers.map((availableUser) => (
                    <div
                      key={availableUser.id}
                      onClick={() => handleUserSelect(availableUser.id)}
                      className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded"
                    >
                      <Avatar className="w-8 h-8 mr-3">
                        <AvatarImage src={availableUser.avatar} />
                        <AvatarFallback>
                          {availableUser.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{availableUser.name}</p>
                        <p className="text-xs text-gray-500">{availableUser.role.toUpperCase()}</p>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && searchTerm && (
                    <p className="text-sm text-gray-500 text-center py-2">No users found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="overflow-y-auto">
          {userChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a new chat to begin messaging</p>
            </div>
          ) : (
            userChats
              .sort((a, b) => {
                const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(0);
                const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(0);
                return bTime - aTime;
              })
              .map((chat) => {
                const unreadCount = chat.unreadCount[String(user?.id)] || 0;
                const isSelected = selectedChatId === chat.id;

                return (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <Avatar className="w-10 h-10 mr-3">
                          <AvatarFallback>
                            {getChatDisplayName(chat).split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {getChatDisplayName(chat)}
                            </p>
                            {unreadCount > 0 && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {getChatDisplayRole(chat)}
                            </Badge>
                            {chat.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatTime(chat.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          {chat.lastMessage && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {chat.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4">
              <div className="flex items-center">
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarFallback>
                    {getChatDisplayName(selectedChat).split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{getChatDisplayName(selectedChat)}</h3>
                  <p className="text-sm text-gray-500">{getChatDisplayRole(selectedChat)}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedChat.messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                selectedChat.messages.map((message, index) => {
                  const isCurrentUser = String(message.senderId) === String(user?.id);
                  const showDate = index === 0 || 
                    formatDate(message.timestamp) !== formatDate(selectedChat.messages[index - 1].timestamp);

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center text-xs text-gray-500 my-4">
                          {formatDate(message.timestamp)}
                        </div>
                      )}
                      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isCurrentUser 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-800 border'
                        }`}>
                          <p className="text-sm">{message.content}</p>
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
            <div className="bg-white border-t p-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a conversation to start messaging</p>
              <p className="text-sm">Choose from existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
