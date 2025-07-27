import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Edit, Share2, Archive, BarChart3, Search, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RevolutionFunnel {
  id: string;
  template_name: string;
  industry: string;
  performance_score: number;
  usage_count: number;
  avg_conversion_rate: number;
  created_at: string;
  interactive_funnel_id: string;
  interactive_funnel?: {
    id: string;
    name: string;
    status: string;
    is_public: boolean;
    views_count: number;
    submissions_count: number;
    share_token: string;
  };
}

export const RevolutionFunnelsList = () => {
  const [funnels, setFunnels] = useState<RevolutionFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const loadFunnels = async () => {
    try {
      const { data, error } = await supabase
        .from('revolution_funnel_templates')
        .select(`
          *,
          interactive_funnel:interactive_funnels(
            id,
            name,
            status,
            is_public,
            views_count,
            submissions_count,
            share_token
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading revolution funnels:', error);
        toast({
          title: "Error",
          description: "Failed to load revolution funnels",
          variant: "destructive",
        });
        return;
      }

      setFunnels(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load revolution funnels",
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
    funnel.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    funnel.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewFunnel = (funnel: RevolutionFunnel) => {
    if (funnel.interactive_funnel?.share_token) {
      window.open(`/funnel/${funnel.interactive_funnel.share_token}`, '_blank');
    }
  };

  const handleEditFunnel = (funnel: RevolutionFunnel) => {
    if (funnel.interactive_funnel_id) {
      window.location.href = `/funnels/interactive?edit=${funnel.interactive_funnel_id}`;
    }
  };

  const handleShareFunnel = async (funnel: RevolutionFunnel) => {
    if (funnel.interactive_funnel?.share_token) {
      const url = `${window.location.origin}/funnel/${funnel.interactive_funnel.share_token}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Success",
        description: "Funnel URL copied to clipboard",
      });
    }
  };

  const handleTogglePublic = async (funnel: RevolutionFunnel) => {
    try {
      const { error } = await supabase
        .from('interactive_funnels')
        .update({ is_public: !funnel.interactive_funnel?.is_public })
        .eq('id', funnel.interactive_funnel_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Funnel ${funnel.interactive_funnel?.is_public ? 'made private' : 'made public'}`,
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

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-primary';
    if (score >= 70) return 'text-yellow-600';
    return 'text-destructive';
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
            <h1 className="text-3xl font-bold tracking-tight">Revolution Funnels</h1>
            <p className="text-muted-foreground">
              AI-powered funnels created with deep customer intelligence
            </p>
          </div>
          <Button
            onClick={() => window.location.href = '/revolution'}
            className="w-fit"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Funnel
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search funnels..."
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
                  <h3 className="text-lg font-semibold">No Revolution Funnels</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No funnels match your search.' : 'Create your first AI-powered funnel to get started.'}
                  </p>
                </div>
                {!searchQuery && (
                  <Button onClick={() => window.location.href = '/revolution'}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Revolution Funnel
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
                        {funnel.template_name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {funnel.industry && (
                          <Badge variant="outline" className="mr-2">
                            {funnel.industry}
                          </Badge>
                        )}
                        {funnel.interactive_funnel && (
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(funnel.interactive_funnel.status)}
                          >
                            {funnel.interactive_funnel.status}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-3">
                    {/* Performance Score */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Performance Score</span>
                      <span className={`font-semibold ${getPerformanceColor(funnel.performance_score)}`}>
                        {funnel.performance_score}%
                      </span>
                    </div>

                    {/* Stats */}
                    {funnel.interactive_funnel && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Views</span>
                          <p className="font-medium">{funnel.interactive_funnel.views_count}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Submissions</span>
                          <p className="font-medium">{funnel.interactive_funnel.submissions_count}</p>
                        </div>
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="text-xs text-muted-foreground">
                      Created {formatDistanceToNow(new Date(funnel.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="flex w-full space-x-2">
                    {funnel.interactive_funnel?.share_token && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewFunnel(funnel)}
                        className="flex-1"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditFunnel(funnel)}
                      className="flex-1"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    {funnel.interactive_funnel?.share_token && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareFunnel(funnel)}
                        className="flex-1"
                      >
                        <Share2 className="mr-1 h-3 w-3" />
                        Share
                      </Button>
                    )}
                  </div>
                  
                  {funnel.interactive_funnel && (
                    <div className="flex w-full mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublic(funnel)}
                        className="w-full text-xs"
                      >
                        {funnel.interactive_funnel.is_public ? 'Make Private' : 'Make Public'}
                      </Button>
                    </div>
                  )}
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