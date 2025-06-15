
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import FunnelAnalytics from '@/components/analytics/FunnelAnalytics';
import FeedbackSystem from '@/components/feedback/FeedbackSystem';
import FunnelEditor from '@/components/funnel/FunnelEditor';
import { BarChart3, MessageCircle, Edit, Target, Users, TrendingUp } from 'lucide-react';

const ValidationDashboard = () => {
  // Non ci sono più dati mock, collegare API reale in futuro!
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Fase 0 - <span className="text-golden">Validation</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Monitora le performance e raccogli feedback per validare il concept
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            Phase 0: Validation
          </Badge>
        </div>

        {/* Quick Stats */}
        {/* Placeholder, togliere o collegare numeri reali dal backend */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Funnel Attivi</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
                <Target className="w-8 h-8 text-golden" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Lead Totali</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Feedback Ricevuti</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
                <MessageCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editor Funnel
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Nessun dato demo, FunnelAnalytics avrà dati reali appena disponibili */}
            <div className="text-center text-gray-400 py-12">
              Nessun dato disponibile. Collega i dati reali per mostrare le analytics del funnel.
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            <FunnelEditor 
              onSave={(steps) => {
                console.log('Saving funnel steps:', steps);
              }}
            />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <FeedbackSystem showHistory={true} />
          </TabsContent>
        </Tabs>

        {/* Phase Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Roadmap delle Fasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="flex flex-col items-center p-4 bg-golden/10 rounded-lg border-2 border-golden">
                <div className="w-8 h-8 bg-golden rounded-full flex items-center justify-center text-white font-bold mb-2">
                  0
                </div>
                <h3 className="font-semibold text-center">Validation</h3>
                <p className="text-xs text-center text-gray-600">In corso</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  1
                </div>
                <h3 className="font-semibold text-center">AI Builder</h3>
                <p className="text-xs text-center text-gray-600">Prossimo</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  2
                </div>
                <h3 className="font-semibold text-center">Automation</h3>
                <p className="text-xs text-center text-gray-600">Futuro</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  3
                </div>
                <h3 className="font-semibold text-center">Scalability</h3>
                <p className="text-xs text-center text-gray-600">Futuro</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  4
                </div>
                <h3 className="font-semibold text-center">Marketplace</h3>
                <p className="text-xs text-center text-gray-600">Futuro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValidationDashboard;
