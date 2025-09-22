import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import FunnelViewerPage from "./pages/FunnelViewerPage";

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
            
            {/* Redirect all old routes to dashboard */}
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
            <Route path="/revolution" element={<Navigate to="/dashboard" replace />} />
            <Route path="/revolution/funnels" element={<Navigate to="/dashboard" replace />} />
            <Route path="/intelligent-funnel" element={<Navigate to="/dashboard" replace />} />
            <Route path="/ai-funnel" element={<Navigate to="/dashboard" replace />} />
            <Route path="/micro-interactions" element={<Navigate to="/dashboard" replace />} />
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