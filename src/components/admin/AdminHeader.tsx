
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, LogOut } from 'lucide-react';

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
      <Button
        variant="outline"
        onClick={onSignOut}
        className="border-golden text-golden hover:bg-golden hover:text-black"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
};

export default AdminHeader;
