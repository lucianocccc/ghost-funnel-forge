
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Plus, Rocket, Users, ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  activeTab,
  onTabChange
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'create-funnel', label: 'Crea Funnel', icon: Plus },
    { id: 'funnels', label: 'I Miei Funnel', icon: Rocket },
    { id: 'leads', label: 'Lead', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-card border-r transition-all duration-300 z-50 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold">Menu</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      <nav className="p-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "secondary" : "ghost"}
            className={`w-full justify-start mb-1 ${collapsed ? 'px-2' : 'px-4'}`}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className="w-4 h-4" />
            {!collapsed && <span className="ml-2">{item.label}</span>}
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default DashboardSidebar;
