
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Index from "./pages/Index";
import SharedFunnel from "./pages/SharedFunnel";
import SharedInteractiveFunnel from "./pages/SharedInteractiveFunnel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {navItems.map(({ to, page }) => (
            <Route key={to} path={to} element={page} />
          ))}
          <Route path="/funnel/:shareToken" element={<SharedFunnel />} />
          <Route path="/shared-funnel/:shareToken" element={<SharedInteractiveFunnel />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
