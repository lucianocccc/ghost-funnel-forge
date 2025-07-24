
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

const LeadManagement = () => {
  const leads = [
    { id: 1, name: 'Mario Rossi', email: 'mario@example.com', status: 'Nuovo', funnel: 'Funnel #1' },
    { id: 2, name: 'Giulia Bianchi', email: 'giulia@example.com', status: 'Qualificato', funnel: 'Funnel #2' },
    { id: 3, name: 'Luca Verdi', email: 'luca@example.com', status: 'Convertito', funnel: 'Funnel #1' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Nuovo': return 'bg-blue-100 text-blue-800';
      case 'Qualificato': return 'bg-yellow-100 text-yellow-800';
      case 'Convertito': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Users className="w-6 h-6 text-golden" />
          Gestione Lead
        </h2>
        <p className="text-muted-foreground">
          Monitora e gestisci tutti i lead generati dai tuoi funnel.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Funnel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.funnel}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadManagement;
