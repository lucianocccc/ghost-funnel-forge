
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const LeadAnalysisFunnel: React.FC<{ funnel: string[] }> = ({ funnel }) => {
  if (!Array.isArray(funnel)) return null;
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-golden mb-3">Funnel Personalizzato</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-left text-gray-400">Step</TableHead>
            <TableHead className="text-left text-gray-400">Azione Strategica</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funnel.map((step, idx) => (
            <TableRow key={idx}>
              <TableCell className="text-blue-400 font-bold">{idx + 1}</TableCell>
              <TableCell className="text-white">{step}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadAnalysisFunnel;
