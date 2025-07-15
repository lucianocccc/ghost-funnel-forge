
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Presentation from "./pages/Presentation";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import SharedFunnel from "./pages/SharedFunnel";
import SharedInteractiveFunnel from "./pages/SharedInteractiveFunnel";
import NotFound from "./pages/NotFound";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Presentation />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/dashboard" 
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } 
          />
          <Route path="/funnel/:shareToken" element={<SharedFunnel />} />
          <Route path="/shared-funnel/:shareToken" element={<SharedInteractiveFunnel />} />
          <Route path="/shared-interactive-funnel/:shareToken" element={<SharedInteractiveFunnel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
