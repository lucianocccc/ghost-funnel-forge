
import React from 'react';
import AdminDropdownMenu from '@/components/admin/AdminDropdownMenu';

interface AdminHeaderProps {
  profileName?: string;
  onSignOut: () => Promise<void>;
  onOpenScoringSettings?: () => void;
  onOpenTestPanel?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  profileName, 
  onSignOut,
  onOpenScoringSettings,
  onOpenTestPanel
}) => {
  return (
    <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg border border-gray-700">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Dashboard Amministratore
        </h1>
        {profileName && (
          <p className="text-gray-400 mt-1">
            Benvenuto, {profileName}
          </p>
        )}
      </div>
      
      <AdminDropdownMenu 
        onSignOut={onSignOut}
        onOpenScoringSettings={onOpenScoringSettings}
        onOpenTestPanel={onOpenTestPanel}
      />
    </div>
  );
};

export default AdminHeader;
