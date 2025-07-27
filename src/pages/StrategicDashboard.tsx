
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import StrategicDashboard from '@/components/strategy/StrategicDashboard';
import { Navigate } from 'react-router-dom';

const StrategicDashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only redirect if we're sure there's no user and loading is complete
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <StrategicDashboard />
    </div>
  );
};

export default StrategicDashboardPage;
