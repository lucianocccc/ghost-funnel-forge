
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface LeadRowFunnelSectionProps {
  data: string[];
}

const LeadRowFunnelSection: React.FC<LeadRowFunnelSectionProps> = ({ data }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Step</TableHead>
          <TableHead>Azione Strategica</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((step: string, index: number) => (
          <TableRow key={index}>
            <TableCell>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 font-bold">
                {index + 1}
              </Badge>
            </TableCell>
            <TableCell className="text-black font-medium">{step}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LeadRowFunnelSection;
