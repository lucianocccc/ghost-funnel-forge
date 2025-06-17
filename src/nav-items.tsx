
import { Home, Users, Settings, BarChart3, Zap, MessageSquare } from "lucide-react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Funnels from "./pages/Funnels";
import LeadAnalysis from "./pages/LeadAnalysis";
import Presentation from "./pages/Presentation";
import ClientInterviews from "./pages/ClientInterviews";
import Auth from "./pages/Auth";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Funnels",
    to: "/funnels",
    icon: <Zap className="h-4 w-4" />,
    page: <Funnels />,
  },
  {
    title: "Lead Analysis",
    to: "/lead-analysis",
    icon: <Users className="h-4 w-4" />,
    page: <LeadAnalysis />,
  },
  {
    title: "Client Interviews",
    to: "/client-interviews",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <ClientInterviews />,
  },
  {
    title: "Presentation",
    to: "/presentation",
    icon: <Settings className="h-4 w-4" />,
    page: <Presentation />,
  },
  {
    title: "Auth",
    to: "/auth",
    icon: <Settings className="h-4 w-4" />,
    page: <Auth />,
  },
];
