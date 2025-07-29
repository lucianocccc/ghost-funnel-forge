import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Edit, Share2, Archive, BarChart3, Search, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface InteractiveFunnel {
  id: string;
  name: string;
  description?: string;
  status: string;
  is_public: boolean;
  views_count: number;
  submissions_count: number;
  share_token: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  settings?: {
    ai_generated?: boolean;
    instant_generation?: boolean;
    revolution_engine?: boolean;
    original_prompt?: string;
  };
}

export const RevolutionFunnelsList = () => {
  const [funnels, setFunnels] = useState<InteractiveFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const loadFunnels = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('❌ No authenticated user found');
        toast({
          title: "Errore di Autenticazione", 
          description: "Devi essere autenticato per visualizzare i funnel",
          variant: "destructive",
        });
        return;
      }

      console.log('🔍 Loading funnels for user:', user.id);

      const { data, error } = await supabase
        .from('interactive_funnels')
        .select(`
          id,
          name,
          description,
          status,
          is_public,
          views_count,
          submissions_count,
          share_token,
          created_at,
          updated_at,
          created_by,
          settings
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading funnels:', error);
        toast({
          title: "Errore",
          description: `Errore nel caricamento dei funnel: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Successfully loaded', data?.length || 0, 'funnels');
      console.log('Funnels:', data?.map(f => ({ 
        id: f.id, 
        name: f.name, 
        aiGenerated: f.settings && typeof f.settings === 'object' ? (f.settings as any)?.ai_generated : false 
      })));

      // Transform the data to properly type the settings
      const typedFunnels = data?.map(funnel => ({
        ...funnel,
        settings: funnel.settings && typeof funnel.settings === 'object' ? funnel.settings as {
          ai_generated?: boolean;
          instant_generation?: boolean;
          revolution_engine?: boolean;
          original_prompt?: string;
        } : undefined
      })) || [];

      setFunnels(typedFunnels);
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto nel caricamento dei funnel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunnels();
  }, []);

  const filteredFunnels = funnels.filter(funnel =>
    funnel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    funnel.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewFunnel = (funnel: InteractiveFunnel) => {
    if (funnel.share_token && funnel.is_public) {
      window.open(`/funnel/${funnel.share_token}`, '_blank');
    } else {
      toast({
        title: "Error",
        description: "This funnel is not public or has no share token",
        variant: "destructive",
      });
    }
  };

  const handleEditFunnel = (funnel: InteractiveFunnel) => {
    // For now, show info message
    toast({
      title: "Info",
      description: "Funnel editing interface coming soon",
    });
  };

  const handleShareFunnel = async (funnel: InteractiveFunnel) => {
    if (funnel.share_token && funnel.is_public) {
      const url = `${window.location.origin}/funnel/${funnel.share_token}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Success",
        description: "Funnel URL copied to clipboard",
      });
    } else {
      toast({
        title: "Error",
        description: "Funnel must be public to share",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublic = async (funnel: InteractiveFunnel) => {
    try {
      const { error } = await supabase
        .from('interactive_funnels')
        .update({ is_public: !funnel.is_public })
        .eq('id', funnel.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Funnel ${funnel.is_public ? 'made private' : 'made public'}`,
      });

      loadFunnels();
    } catch (error) {
      console.error('Error toggling funnel visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update funnel visibility",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary/10 text-primary border-primary/20';
      case 'draft': return 'bg-muted text-muted-foreground border-muted-foreground/20';
      case 'archived': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-secondary text-secondary-foreground border-secondary/20';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">I Tuoi Funnels</h1>
            <p className="text-muted-foreground">
              Tutti i funnels che hai creato, inclusi quelli generati con AI
            </p>
          </div>
          <Button
            onClick={() => window.location.href = '/revolution'}
            className="w-fit"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crea Nuovo Funnel
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca funnels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Funnels Grid */}
        {filteredFunnels.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-muted p-3">
                  <BarChart3 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Nessun Funnel Trovato</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Nessun funnel corrisponde alla tua ricerca.' : 'Crea il tuo primo funnel per iniziare.'}
                  </p>
                </div>
                {!searchQuery && (
                  <Button onClick={() => window.location.href = '/revolution'}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crea Primo Funnel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFunnels.map((funnel) => (
              <Card key={funnel.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between space-x-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {funnel.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex flex-wrap gap-1">
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(funnel.status)}
                          >
                            {funnel.status}
                          </Badge>
                          {funnel.is_public && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              Pubblico
                            </Badge>
                          )}
                          {funnel.settings?.ai_generated && (
                            <Badge variant="outline" className="bg-purple/10 text-purple border-purple/20">
                              🤖 AI
                            </Badge>
                          )}
                          {funnel.settings?.instant_generation && (
                            <Badge variant="outline" className="bg-orange/10 text-orange border-orange/20">
                              ⚡ Instant
                            </Badge>
                          )}
                          {funnel.settings?.revolution_engine && (
                            <Badge variant="outline" className="bg-gradient-to-r from-purple to-pink text-white border-purple/20">
                              🚀 Revolution
                            </Badge>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-3">
                    {/* Description */}
                    {funnel.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {funnel.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Visualizzazioni</span>
                        <p className="font-medium">{funnel.views_count || 0}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Conversioni</span>
                        <p className="font-medium">{funnel.submissions_count || 0}</p>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="text-xs text-muted-foreground">
                      Creato {formatDistanceToNow(new Date(funnel.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="flex w-full space-x-2">
                    {funnel.share_token && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewFunnel(funnel)}
                        className="flex-1"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Visualizza
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditFunnel(funnel)}
                      className="flex-1"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Modifica
                    </Button>
                    {funnel.share_token && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareFunnel(funnel)}
                        className="flex-1"
                      >
                        <Share2 className="mr-1 h-3 w-3" />
                        Condividi
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex w-full mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublic(funnel)}
                      className="w-full text-xs"
                    >
                      {funnel.is_public ? 'Rendi Privato' : 'Rendi Pubblico'}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RevolutionFunnelsList;