
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const LeadAnalysisStrategie: React.FC<{ strategie: string[] }> = ({ strategie }) => {
  if (!Array.isArray(strategie)) return null;
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-golden mb-3">Strategie di Approccio</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-left text-gray-400">#</TableHead>
            <TableHead className="text-left text-gray-400">Strategia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {strategie.map((s, idx) => (
            <TableRow key={idx}>
              <TableCell className="text-golden">{idx + 1}</TableCell>
              <TableCell className="text-white">{s}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadAnalysisStrategie;
