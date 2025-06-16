
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Zap, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/demo' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: Zap, label: 'Funnels', path: '/funnels' },
    { icon: User, label: 'Account', path: '/dashboard' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors",
                isActive 
                  ? "text-golden" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
