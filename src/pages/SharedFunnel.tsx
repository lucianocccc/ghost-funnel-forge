
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSharedFunnel } from '@/hooks/useSharedFunnel';
import SharedFunnelLoading from '@/components/shared-funnel/SharedFunnelLoading';
import SharedFunnelError from '@/components/shared-funnel/SharedFunnelError';
import SharedFunnelHeader from '@/components/shared-funnel/SharedFunnelHeader';
import SharedFunnelInfo from '@/components/shared-funnel/SharedFunnelInfo';
import SharedFunnelSteps from '@/components/shared-funnel/SharedFunnelSteps';
import SharedFunnelStrategy from '@/components/shared-funnel/SharedFunnelStrategy';
import SharedFunnelCTA from '@/components/shared-funnel/SharedFunnelCTA';
import SharedFunnelFooter from '@/components/shared-funnel/SharedFunnelFooter';

const SharedFunnel: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { funnel, loading, error } = useSharedFunnel(shareToken);

  if (loading) {
    return <SharedFunnelLoading />;
  }

  if (error || !funnel) {
    return <SharedFunnelError error={error || 'Il funnel che stai cercando non esiste o è stato rimosso.'} />;
  }

  const funnelData = funnel.funnel_data || {};
  const steps = funnelData.steps || [];

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <SharedFunnelHeader />

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <SharedFunnelInfo funnel={funnel} />
          </CardHeader>
          
          <CardContent className="space-y-6">
            <SharedFunnelSteps steps={steps} />
            <SharedFunnelStrategy strategy={funnelData.strategy} />

            <Separator className="bg-gray-700" />

            <SharedFunnelCTA />
          </CardContent>
        </Card>

        <SharedFunnelFooter />
      </div>
    </div>
  );
};

export default SharedFunnel;
