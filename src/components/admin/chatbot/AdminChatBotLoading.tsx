
import React from 'react';

const AdminChatBotLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="animate-spin w-12 h-12 border-4 border-golden border-t-transparent rounded-full"></div>
    </div>
  );
};

export default AdminChatBotLoading;
