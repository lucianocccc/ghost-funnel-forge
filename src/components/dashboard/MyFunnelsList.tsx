import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ExternalLink, Trash2, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Funnel {
  id: string;
  name: string;
  description: string;
  share_token: string;
  views_count: number;
  funnel_data: any;
  created_at: string;
}

const MyFunnelsList = () => {
  const { user } = useAuth();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFunnels();
    }
  }, [user]);

  const fetchFunnels = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_generated_funnels')
        .select('id, name, description, share_token, views_count, funnel_data, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFunnels(data || []);
    } catch (error) {
      console.error('Error fetching funnels:', error);
      toast.error('Errore nel caricamento dei funnel');
    } finally {
      setLoading(false);
    }
  };

  const deleteFunnel = async (funnelId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo funnel?')) return;

    try {
      const { error } = await supabase
        .from('ai_generated_funnels')
        .delete()
        .eq('id', funnelId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setFunnels(funnels.filter(f => f.id !== funnelId));
      toast.success('Funnel eliminato con successo');
    } catch (error) {
      console.error('Error deleting funnel:', error);
      toast.error('Errore nell\'eliminazione del funnel');
    }
  };

  const openFunnel = (shareToken: string) => {
    window.open(`/funnel/${shareToken}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (funnels.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Non hai ancora creato nessun funnel.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Vai alla sezione "Crea Funnel" per iniziare!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">I Tuoi Funnel</h2>
        <Badge variant="secondary">{funnels.length} funnel</Badge>
      </div>

      <div className="grid gap-4">
        {funnels.map((funnel) => (
          <Card key={funnel.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{funnel.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {funnel.description || 'Nessuna descrizione'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Creato il {new Date(funnel.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {funnel.views_count || 0}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => openFunnel(funnel.share_token)}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visualizza
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/funnel/${funnel.share_token}`);
                    toast.success('Link copiato negli appunti!');
                  }}
                >
                  Copia Link
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteFunnel(funnel.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyFunnelsList;