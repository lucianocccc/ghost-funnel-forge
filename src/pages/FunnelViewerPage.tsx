
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';

const FunnelViewerPage = () => {
  const { shareToken } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="container mx-auto">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Eye className="w-8 h-8 text-golden" />
            </div>
            <CardTitle>Visualizzatore Funnel</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Token di condivisione: {shareToken}
            </p>
            <p className="mt-4">
              Funzionalità di visualizzazione funnel in sviluppo.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FunnelViewerPage;
