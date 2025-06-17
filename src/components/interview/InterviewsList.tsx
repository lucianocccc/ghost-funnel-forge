
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useClientInterviews } from '@/hooks/useClientInterviews';
import { useAIFunnels } from '@/hooks/useAIFunnels';
import { MessageSquare, Brain, Eye, Building, Users, Calendar, Zap } from 'lucide-react';

const InterviewsList: React.FC = () => {
  const { interviews, loading, analyzeInterview } = useClientInterviews();
  const { generateFunnelFromInterview } = useAIFunnels();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const config = {
      in_progress: { label: 'In Corso', variant: 'secondary' as const },
      completed: { label: 'Completata', variant: 'default' as const },
      analyzed: { label: 'Analizzata', variant: 'outline' as const }
    };
    return config[status as keyof typeof config] || config.in_progress;
  };

  const handleAnalyze = async (interviewId: string) => {
    setProcessingId(interviewId);
    await analyzeInterview(interviewId);
    setProcessingId(null);
  };

  const handleGenerateFunnel = async (interviewId: string) => {
    setProcessingId(interviewId);
    await generateFunnelFromInterview(interviewId);
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">Nessuna intervista disponibile</p>
        <p className="text-sm">Crea la tua prima intervista cliente per iniziare.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      {interviews.map((interview) => (
        <Card key={interview.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-golden/10 rounded-lg">
                  <Building className="w-5 h-5 text-golden" />
                </div>
                <div>
                  <CardTitle className="text-lg">{interview.business_name || 'Nome non specificato'}</CardTitle>
                  <Badge variant={getStatusBadge(interview.status).variant}>
                    {getStatusBadge(interview.status).label}
                  </Badge>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(interview.created_at), 'dd MMM yyyy', { locale: it })}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {interview.business_description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {interview.business_description}
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {interview.target_audience && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{interview.target_audience}</span>
                </div>
              )}
              {interview.budget_range && (
                <div className="text-gray-600">
                  Budget: <span className="font-medium">{interview.budget_range}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {interview.status === 'completed' && !interview.gpt_analysis && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAnalyze(interview.id)}
                  disabled={processingId === interview.id}
                  className="flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  {processingId === interview.id ? 'Analisi...' : 'Analizza'}
                </Button>
              )}
              
              {interview.status === 'analyzed' && (
                <Button
                  size="sm"
                  onClick={() => handleGenerateFunnel(interview.id)}
                  disabled={processingId === interview.id}
                  className="bg-golden hover:bg-golden/90 text-black flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {processingId === interview.id ? 'Generazione...' : 'Genera Funnel AI'}
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Dettagli
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InterviewsList;
