
import React from 'react';
import ChatInterface from '@/components/ChatInterface';

const AdminMessages = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Chat with Engineers and Project Managers</p>
      </div>
      <ChatInterface />
    </div>
  );
};

export default AdminMessages;
