import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import FunnelGenerationWizard from '@/components/ai-funnel/FunnelGenerationWizard';

export default function FunnelAIPage() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <FunnelGenerationWizard />
      </div>
    </div>
  );
}