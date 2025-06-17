
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Admin from '@/pages/Admin';
import AdminRoute from './components/AdminRoute';
import Funnels from '@/pages/Funnels';
import Presentation from '@/pages/Presentation';
import LeadAnalysis from '@/pages/LeadAnalysis';
import ClientInterviews from '@/pages/ClientInterviews';
import NotFound from '@/pages/NotFound';
import AdminChatBot from '@/pages/AdminChatBot';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Presentation />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/admin/chatbot" element={<AdminRoute><AdminChatBot /></AdminRoute>} />
        <Route path="/funnels" element={<Funnels />} />
        <Route path="/demo" element={<Index />} />
        <Route path="/leads" element={<LeadAnalysis />} />
        <Route path="/interviews" element={<ClientInterviews />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
