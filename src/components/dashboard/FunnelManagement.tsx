
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Plus, BarChart3, Zap } from 'lucide-react';

const FunnelManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">I Miei Funnel</h2>
          <p className="text-muted-foreground">
            Gestisci e monitora tutti i tuoi funnel di conversione.
          </p>
        </div>
        <Button className="bg-golden hover:bg-yellow-600 text-black">
          <Plus className="w-4 h-4 mr-2" />
          Nuovo Funnel
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => window.location.href = '/revolution/funnels'}>
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="font-semibold">Revolution Funnels</h3>
            <p className="text-sm text-muted-foreground">AI-powered funnels with deep customer intelligence</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => window.location.href = '/funnels/interactive'}>
          <CardContent className="p-6 text-center">
            <Rocket className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold">Interactive Funnels</h3>
            <p className="text-sm text-muted-foreground">Standard interactive funnel builder</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => window.location.href = '/dashboard?tab=create-funnel'}>
          <CardContent className="p-6 text-center">
            <Plus className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold">Create New</h3>
            <p className="text-sm text-muted-foreground">Start building a new funnel</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((funnel) => (
          <Card key={funnel}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Rocket className="w-5 h-5 text-golden" />
                  <CardTitle className="text-lg">Funnel #{funnel}</CardTitle>
                </div>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Visite:</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conversioni:</span>
                  <span className="font-medium">123</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tasso:</span>
                  <span className="font-medium text-green-600">10%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FunnelManagement;
