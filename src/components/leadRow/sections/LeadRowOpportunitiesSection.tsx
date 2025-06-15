
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star } from 'lucide-react';

interface LeadRowOpportunitiesSectionProps {
  data: string[];
}

const LeadRowOpportunitiesSection: React.FC<LeadRowOpportunitiesSectionProps> = ({ data }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>Opportunità Identificata</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((opp: string, index: number) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-golden fill-golden" />
                <span className="font-bold text-golden">{index + 1}</span>
              </div>
            </TableCell>
            <TableCell className="text-black font-medium">{opp}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LeadRowOpportunitiesSection;
