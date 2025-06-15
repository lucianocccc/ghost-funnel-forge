
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LeadAnalysis } from '@/hooks/useLeads';

interface LeadRowBaseInfoProps {
  lead: LeadAnalysis;
}

const LeadRowBaseInfo: React.FC<LeadRowBaseInfoProps> = ({ lead }) => {
  return (
    <div className="mb-6">
      <Table>
        <TableHeader>
          <TableRow className="border-golden/20">
            <TableHead className="font-semibold text-gray-700">Informazioni Base</TableHead>
            <TableHead className="font-semibold text-gray-700">Dettagli</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium text-gray-600">Servizio di Interesse</TableCell>
            <TableCell className="text-black font-semibold">{lead.servizio}</TableCell>
          </TableRow>
          {lead.bio && (
            <TableRow>
              <TableCell className="font-medium text-gray-600">Biografia</TableCell>
              <TableCell className="text-black">{lead.bio}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadRowBaseInfo;
