
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import App from './App';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';
import Admin from './pages/Admin';
import AdminRoute from './components/AdminRoute';
import Funnels from './pages/Funnels';
import Presentation from './pages/Presentation';
import LeadAnalysis from './pages/LeadAnalysis';
import ClientInterviews from './pages/ClientInterviews';
import NotFound from './pages/NotFound';
import AdminChatBot from './pages/AdminChatBot';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minuti
      gcTime: 1000 * 60 * 10, // 10 minuti
      retry: 1
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  </React.StrictMode>,
);
