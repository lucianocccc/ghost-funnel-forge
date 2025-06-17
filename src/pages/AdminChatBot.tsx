
import React from 'react';
import { useAdminSubscription } from '@/hooks/useAdminSubscription';
import AdminChatBotLoading from '@/components/admin/chatbot/AdminChatBotLoading';
import AdminChatBotPremium from '@/components/admin/chatbot/AdminChatBotPremium';
import AdminChatBotMain from '@/components/admin/chatbot/AdminChatBotMain';

const AdminChatBot: React.FC = () => {
  const { subscription, loadingSubscription, canAccessChatbot } = useAdminSubscription();

  if (loadingSubscription) {
    return <AdminChatBotLoading />;
  }

  if (!canAccessChatbot) {
    return <AdminChatBotPremium />;
  }

  return <AdminChatBotMain subscription={subscription} />;
};

export default AdminChatBot;
