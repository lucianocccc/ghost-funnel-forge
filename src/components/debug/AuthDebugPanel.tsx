
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AuthDebugPanel: React.FC = () => {
  const { user, profile, loading, session } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm text-blue-800">Auth Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant={loading ? "secondary" : "outline"}>
            Loading: {loading ? 'Yes' : 'No'}
          </Badge>
          <Badge variant={user ? "default" : "destructive"}>
            User: {user ? 'Present' : 'None'}
          </Badge>
          <Badge variant={session ? "default" : "destructive"}>
            Session: {session ? 'Present' : 'None'}
          </Badge>
          <Badge variant={profile ? "default" : "destructive"}>
            Profile: {profile ? 'Present' : 'None'}
          </Badge>
        </div>
        
        {user && (
          <div className="text-blue-700">
            <div>User ID: {user.id}</div>
            <div>Email: {user.email}</div>
            <div>Confirmed: {user.email_confirmed_at ? 'Yes' : 'No'}</div>
          </div>
        )}
        
        {profile && (
          <div className="text-green-700">
            <div>Profile Role: {profile.role}</div>
            <div>Name: {profile.first_name} {profile.last_name}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebugPanel;
