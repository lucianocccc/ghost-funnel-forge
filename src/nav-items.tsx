
import { Home, BarChart3, Camera } from "lucide-react";
import Presentation from "./pages/Presentation";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import CinematicFunnelDemo from "./pages/CinematicFunnelDemo";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Presentation />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Auth",
    to: "/auth",
    icon: <Home className="h-4 w-4" />,
    page: <Auth />,
  },
  {
    title: "Cinematic Demo",
    to: "/cinematic-demo",
    icon: <Camera className="h-4 w-4" />,
    page: <CinematicFunnelDemo />,
  },
];
