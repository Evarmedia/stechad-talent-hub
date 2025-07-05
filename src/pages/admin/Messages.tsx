
import React from 'react';
import ChatInterface from '@/components/chat/ChatInterface';

const AdminMessages: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Messages</h1>
        <p className="text-muted-foreground mt-2">
          Communicate with engineers and project managers
        </p>
      </div>
      
      <ChatInterface />
    </div>
  );
};

export default AdminMessages;
