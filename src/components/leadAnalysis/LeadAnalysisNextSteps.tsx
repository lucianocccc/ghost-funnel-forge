
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const LeadAnalysisNextSteps: React.FC<{ nextSteps: string[] }> = ({ nextSteps }) => {
  if (!Array.isArray(nextSteps)) return null;
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-golden mb-3">Piano d'Azione</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20 text-left text-gray-400">Priorità</TableHead>
            <TableHead className="text-left text-gray-400">Azione</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nextSteps.map((step, index) => (
            <TableRow key={index}>
              <TableCell>
                <Badge className={`
                  ${index === 0 ? 'bg-red-500 text-white' :
                   index === 1 ? 'bg-orange-500 text-white' :
                   'bg-yellow-500 text-white'}
                  font-bold
                `}>
                  {index === 0 ? 'ALTA' : index === 1 ? 'MEDIA' : 'BASSA'}
                </Badge>
              </TableCell>
              <TableCell className="text-white">{step}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadAnalysisNextSteps;
