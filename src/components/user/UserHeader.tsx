
import React from 'react';
import { User } from 'lucide-react';
import UserDropdownMenu from './UserDropdownMenu';

interface UserHeaderProps {
  profileName?: string;
  onSignOut: () => Promise<void>;
}

const UserHeader: React.FC<UserHeaderProps> = ({ profileName, onSignOut }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-golden" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Area <span className="text-golden">Utente</span>
          </h1>
          <p className="text-gray-600">
            Benvenuto, {profileName || 'Utente'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <UserDropdownMenu onSignOut={onSignOut} />
      </div>
    </div>
  );
};

export default UserHeader;
