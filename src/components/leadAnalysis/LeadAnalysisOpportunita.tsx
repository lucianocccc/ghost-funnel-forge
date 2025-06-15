
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const LeadAnalysisOpportunita: React.FC<{ opportunita: string[] }> = ({ opportunita }) => {
  if (!Array.isArray(opportunita)) return null;
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-golden mb-3">Opportunità di Business</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-left text-gray-400">#</TableHead>
            <TableHead className="text-left text-gray-400">Opportunità</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunita.map((o, idx) => (
            <TableRow key={idx}>
              <TableCell className="text-green-400">{idx + 1}</TableCell>
              <TableCell className="text-white">{o}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadAnalysisOpportunita;
