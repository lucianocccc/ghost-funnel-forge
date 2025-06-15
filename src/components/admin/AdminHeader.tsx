
import React from 'react';
import { Shield } from 'lucide-react';
import AdminDropdownMenu from './AdminDropdownMenu';

interface AdminHeaderProps {
  profileName?: string;
  onSignOut: () => Promise<void>;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ profileName, onSignOut }) => {
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
