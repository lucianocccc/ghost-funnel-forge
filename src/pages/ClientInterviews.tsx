
import React, { useState } from 'react';
import AdminRoute from '@/components/AdminRoute';
import AdminHeader from '@/components/admin/AdminHeader';
import ClientInterviewForm from '@/components/interview/ClientInterviewForm';
import InterviewsList from '@/components/interview/InterviewsList';
import AIFunnelsList from '@/components/ai-funnel/AIFunnelsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Brain, Plus, List } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ClientInterviews = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante il logout",
        variant: "destructive",
      });
    }
  };

  const handleInterviewSuccess = () => {
    setIsFormOpen(false);
    toast({
      title: "Successo",
      description: "Intervista completata! Ora puoi procedere con l'analisi.",
    });
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-black">
        <div className="p-6 border-b border-gray-800">
          <AdminHeader 
            profileName={profile?.first_name}
            onSignOut={handleSignOut}
          />
        </div>
        <div className="p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Client <span className="text-golden">Discovery</span>
                </h1>
                <p className="text-gray-300 mt-2">
                  Interviste clienti e generazione funnel AI personalizzati
                </p>
              </div>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-golden hover:bg-golden/90 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuova Intervista
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nuova Intervista Cliente</DialogTitle>
                  </DialogHeader>
                  <ClientInterviewForm onSuccess={handleInterviewSuccess} />
                </DialogContent>
              </Dialog>
            </div>

            <Tabs defaultValue="interviews" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="interviews" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Interviste Clienti
                </TabsTrigger>
                <TabsTrigger value="ai-funnels" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Funnel AI Generati
                </TabsTrigger>
              </TabsList>

              <TabsContent value="interviews">
                <div className="bg-white rounded-lg p-6">
                  <InterviewsList />
                </div>
              </TabsContent>

              <TabsContent value="ai-funnels">
                <div className="bg-white rounded-lg p-6">
                  <AIFunnelsList />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default ClientInterviews;
