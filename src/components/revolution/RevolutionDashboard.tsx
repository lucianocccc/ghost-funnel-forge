
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Rocket } from 'lucide-react';

const RevolutionDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="container mx-auto">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Rocket className="w-8 h-8 text-golden" />
            </div>
            <CardTitle>Revolution Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Funzionalità Revolution Dashboard in sviluppo.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevolutionDashboard;
