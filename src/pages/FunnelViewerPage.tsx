
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

interface FunnelData {
  id: string;
  name: string;
  description: string;
  html_content?: string;
  funnel_data: any;
}

const FunnelViewerPage = () => {
  const { shareToken } = useParams();
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareToken) {
      fetchFunnel();
    }
  }, [shareToken]);

  const fetchFunnel = async () => {
    try {
      // Increment views
      await supabase.rpc('increment_funnel_views', { 
        share_token_param: shareToken 
      });

      // Fetch funnel data
      const { data, error } = await supabase
        .from('ai_generated_funnels')
        .select('id, name, description, funnel_data')
        .eq('share_token', shareToken)
        .single();

      if (error) throw error;
      
      if (data) {
        setFunnel(data);
      } else {
        setError('Funnel non trovato');
      }
    } catch (error) {
      console.error('Error fetching funnel:', error);
      setError('Errore nel caricamento del funnel');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !funnel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4">Funnel non trovato</h1>
            <p className="text-muted-foreground">
              {error || 'Il funnel richiesto non esiste o non è più disponibile.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Display HTML content if available
  if (funnel.funnel_data?.html_content) {
    return (
      <div className="min-h-screen">
        <div 
          dangerouslySetInnerHTML={{ 
            __html: funnel.funnel_data.html_content 
          }} 
        />
      </div>
    );
  }

  // Fallback display for non-HTML funnels
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">{funnel.name}</h1>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {funnel.description}
            </p>
            <div className="text-sm text-muted-foreground">
              Questo funnel è in formato legacy e non può essere visualizzato correttamente.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FunnelViewerPage;
