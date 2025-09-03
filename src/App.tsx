
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import FunnelViewerPage from "./pages/FunnelViewerPage";
import AdminPage from "./pages/AdminPage";
import RevolutionDashboard from "./components/revolution/RevolutionDashboard";
import RevolutionFunnelsList from "./components/revolution/RevolutionFunnelsList";
import { IntelligentFunnelPage } from "./pages/IntelligentFunnelPage";
import { MicroInteractionsDemo } from "./components/micro-interactions/MicroInteractionsDemo";

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/funnel/:shareToken" element={<FunnelViewerPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/revolution" element={<RevolutionDashboard />} />
              <Route path="/revolution/funnels" element={<RevolutionFunnelsList />} />
              <Route path="/intelligent-funnel" element={<IntelligentFunnelPage />} />
              <Route path="/micro-interactions" element={<MicroInteractionsDemo />} />
              
              {/* Redirect old routes to dashboard */}
              <Route path="/interactive-builder" element={<Navigate to="/dashboard" replace />} />
              
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
  );
}

export default App;
