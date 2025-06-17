import React from 'react';
import { Shield } from 'lucide-react';
import AdminDropdownMenu from './AdminDropdownMenu';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Zap, MessageSquare, Users } from 'lucide-react';

interface AdminHeaderProps {
  profileName?: string;
  onSignOut: () => Promise<void>;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ profileName, onSignOut }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: '/admin', label: 'Dashboard', icon: BarChart3 },
    { path: '/funnels', label: 'Funnel', icon: Zap },
    { path: '/interviews', label: 'Client Discovery', icon: MessageSquare },
    { path: '/lead-analysis', label: 'Lead Analysis', icon: Users },
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-golden" />
        <div>
          <h1 className="text-3xl font-bold text-white">
            Admin <span className="text-golden">Dashboard</span>
          </h1>
          <p className="text-gray-300">
            Benvenuto, {profileName || 'Admin'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <AdminDropdownMenu onSignOut={onSignOut} />
      </div>
    </div>
  );
};

export default AdminHeader;
