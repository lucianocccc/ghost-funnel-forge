
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFunnels } from '@/hooks/useFunnels';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Play, Pause, Archive, BarChart3, Settings } from 'lucide-react';

const FunnelList = () => {
  const { funnels, loading, updateFunnelStatus } = useFunnels();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Bozza', variant: 'secondary' as const },
      active: { label: 'Attivo', variant: 'default' as const },
      archived: { label: 'Archiviato', variant: 'outline' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getActionButton = (funnel: any) => {
    if (funnel.status === 'draft') {
      return (
        <Button
          size="sm"
          onClick={() => updateFunnelStatus(funnel.id, 'active')}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Play className="w-4 h-4 mr-1" />
          Attiva
        </Button>
      );
    }
    
    if (funnel.status === 'active') {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateFunnelStatus(funnel.id, 'archived')}
        >
          <Archive className="w-4 h-4 mr-1" />
          Archivia
        </Button>
      );
    }
    
    return (
      <Button
        size="sm"
        onClick={() => updateFunnelStatus(funnel.id, 'active')}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Play className="w-4 h-4 mr-1" />
        Riattiva
      </Button>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>I Tuoi Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {funnels.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nessun funnel creato ancora.</p>
            <p className="text-sm">Usa il pulsante "Crea Funnel" per iniziare.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Passi</TableHead>
                <TableHead>Settore</TableHead>
                <TableHead>Creato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funnels.map((funnel) => (
                <TableRow key={funnel.id}>
                  <TableCell className="font-medium">
                    {funnel.name}
                    {funnel.description && (
                      <p className="text-sm text-gray-500 mt-1">{funnel.description}</p>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(funnel.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {funnel.funnel_steps?.length || 0} passi
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {funnel.industry ? (
                      <Badge variant="outline">{funnel.industry}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(funnel.created_at), 'dd MMM yyyy', { locale: it })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {getActionButton(funnel)}
                      <Button size="sm" variant="ghost">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default FunnelList;
