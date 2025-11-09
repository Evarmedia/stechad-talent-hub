import apiService from './apiService';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  connect() {
    const token = apiService.getToken();
    
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    // Connect to WebSocket server
    const wsUrl = 'ws://localhost:5000';
    
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      
      // Authenticate after connection
      this.socket.send(JSON.stringify({
        type: 'auth',
        token: token
      }));
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  handleMessage(data) {
    const eventType = data.type;
    const listeners = this.listeners.get(eventType);
    
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  off(eventType, callback) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(eventType, data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: eventType,
        ...data
      }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // Chat-specific methods
  joinChat(chatId) {
    this.emit('join_chat', { chatId });
  }

  leaveChat(chatId) {
    this.emit('leave_chat', { chatId });
  }

  sendMessage(chatId, content, messageType = 'text', attachments = [], replyTo = null) {
    this.emit('send_message', {
      chat_id: chatId,
      content,
      message_type: messageType,
      attachments,
      reply_to: replyTo
    });
  }

  typingStart(chatId) {
    this.emit('typing_start', { chat_id: chatId });
  }

  typingStop(chatId) {
    this.emit('typing_stop', { chat_id: chatId });
  }

  markMessagesRead(chatId, messageIds = []) {
    this.emit('mark_messages_read', {
      chat_id: chatId,
      message_ids: messageIds
    });
  }

  getOnlineUsers() {
    this.emit('get_online_users', {});
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
