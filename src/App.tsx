
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Admin from '@/pages/Admin';
import Funnels from '@/pages/Funnels';
import LeadAnalysis from '@/pages/LeadAnalysis';
import Presentation from '@/pages/Presentation';
import NotFound from '@/pages/NotFound';
import ClientInterviews from '@/pages/ClientInterviews';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Presentation />} />
          <Route path="/home" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/funnels" element={<Funnels />} />
          <Route path="/interviews" element={<ClientInterviews />} />
          <Route path="/lead-analysis" element={<LeadAnalysis />} />
          <Route path="/presentation" element={<Presentation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
