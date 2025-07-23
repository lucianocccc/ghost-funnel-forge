
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, Users, TrendingUp } from 'lucide-react';

const InteractiveFunnelView: React.FC = () => {
  const { shareToken } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Alert className="mb-6">
          <Eye className="h-4 w-4" />
          <AlertDescription>
            You are viewing an interactive funnel. Share token: {shareToken}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Interactive Funnel Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Welcome to our Interactive Funnel</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                This is a placeholder for the interactive funnel experience. 
                The actual funnel content would be loaded based on the share token.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveFunnelView;
