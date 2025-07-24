
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Plus, 
  Rocket, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Zap
} from 'lucide-react';

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
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Dashboard principale'
    },
    {
      id: 'create-funnel',
      label: 'Crea Funnel',
      icon: Plus,
      description: 'Tutti i metodi di creazione'
    },
    {
      id: 'funnels',
      label: 'I Miei Funnel',
      icon: Rocket,
      description: 'Gestisci i tuoi funnel'
    },
    {
      id: 'leads',
      label: 'Lead',
      icon: Users,
      description: 'Gestione contatti'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Metriche avanzate'
    }
  ];

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-40",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">GhostFunnel</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-2"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 p-3 h-auto",
                collapsed && "justify-center px-2",
                isActive && "bg-primary text-primary-foreground"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <div className="text-left flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-sm font-medium">Tutto in Un Posto</div>
            <div className="text-xs text-muted-foreground">
              Crea, gestisci e ottimizza i tuoi funnel
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSidebar;
