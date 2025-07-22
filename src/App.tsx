
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import InteractiveFunnelBuilder from "@/pages/InteractiveFunnelBuilder";
import SharedFunnel from "@/pages/SharedFunnel";
import InteractiveFunnelView from "@/pages/InteractiveFunnelView";
import FunnelAnalytics from "@/pages/FunnelAnalytics";
import FunnelLeads from "@/pages/FunnelLeads";
import { IntelligentFunnelPage } from "@/pages/IntelligentFunnelPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/funnel/:shareToken" element={<SharedFunnel />} />
          <Route path="/interactive/:shareToken" element={<InteractiveFunnelView />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/intelligent-funnel" element={
              <ProtectedRoute>
                <IntelligentFunnelPage />
              </ProtectedRoute>
            } />
            <Route path="/interactive-builder" element={
              <ProtectedRoute>
                <InteractiveFunnelBuilder />
              </ProtectedRoute>
            } />
            <Route path="/analytics/:funnelId" element={
              <ProtectedRoute>
                <FunnelAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/leads/:funnelId" element={
              <ProtectedRoute>
                <FunnelLeads />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
