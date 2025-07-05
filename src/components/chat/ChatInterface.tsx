
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageCircle } from 'lucide-react';
import { useChatContext } from '@/hooks/contexts/ChatContext';
import { useAuthContext } from '@/hooks/useAuthContext';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  selectedChatId?: string;
  onChatSelect?: (chatId: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedChatId, onChatSelect }) => {
  const { user } = useAuthContext();
  const { 
    chats, 
    loading, 
    getChatsForUser, 
    getChatById, 
    sendMessage, 
    markMessagesAsRead,
    getUserName
  } = useChatContext();
  
  const [userChats, setUserChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadUserChats();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChatId) {
      loadSelectedChat(selectedChatId);
    }
  }, [selectedChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const loadUserChats = async () => {
    if (!user) return;
    
    try {
      const chats = await getChatsForUser(user.id, user.role);
      setUserChats(chats);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadSelectedChat = async (chatId) => {
    try {
      const chat = await getChatById(chatId);
      setSelectedChat(chat);
      
      if (chat && user) {
        await markMessagesAsRead(chatId, user.id);
        // Refresh chats to update unread counts
        loadUserChats();
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const handleChatSelect = (chatId) => {
    loadSelectedChat(chatId);
    onChatSelect?.(chatId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user || sendingMessage) return;

    setSendingMessage(true);
    try {
      await sendMessage(selectedChat.id, user.id, newMessage.trim());
      setNewMessage('');
      
      // Refresh the selected chat to show the new message
      await loadSelectedChat(selectedChat.id);
      await loadUserChats();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipantId = (chat) => {
    return chat.participants.find(id => id !== user?.id);
  };

  const getOtherParticipantName = (chat) => {
    const otherParticipantId = getOtherParticipantId(chat);
    return getUserName(otherParticipantId);
  };

  if (loading && userChats.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Chat List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {userChats.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {userChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat?.id === chat.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getOtherParticipantName(chat).split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {getOtherParticipantName(chat)}
                        </span>
                      </div>
                      {chat.unreadCount > 0 && (
                        <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(chat.lastMessageTime, 'MMM dd, HH:mm')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="lg:col-span-2">
        {selectedChat ? (
          <>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">
                {getOtherParticipantName(selectedChat)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[500px]">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.senderId === user?.id
                            ? 'bg-primary text-primary-foreground ml-4'
                            : 'bg-muted mr-4'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user?.id 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {format(message.timestamp, 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={sendingMessage}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || sendingMessage}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatInterface;
