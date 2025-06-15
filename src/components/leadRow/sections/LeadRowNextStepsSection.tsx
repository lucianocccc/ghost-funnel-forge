
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface LeadRowNextStepsSectionProps {
  data: string[];
}

const LeadRowNextStepsSection: React.FC<LeadRowNextStepsSectionProps> = ({ data }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Priorità</TableHead>
          <TableHead>Azione Richiesta</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((step: string, index: number) => (
          <TableRow key={index}>
            <TableCell>
              <Badge 
                className={`
                  ${index === 0 ? 'bg-red-500 text-white' : 
                    index === 1 ? 'bg-orange-500 text-white' : 
                    'bg-yellow-500 text-white'} 
                  font-bold
                `}
              >
                {index === 0 ? 'ALTA' : index === 1 ? 'MEDIA' : 'BASSA'}
              </Badge>
            </TableCell>
            <TableCell className="text-black font-medium">{step}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LeadRowNextStepsSection;
