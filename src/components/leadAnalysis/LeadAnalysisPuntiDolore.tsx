
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const LeadAnalysisPuntiDolore: React.FC<{ punti: string[] }> = ({ punti }) => {
  if (!Array.isArray(punti)) return null;
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-golden mb-3">Punti di Dolore Identificati</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-left text-gray-400">#</TableHead>
            <TableHead className="text-left text-gray-400">Punto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {punti.map((p, idx) => (
            <TableRow key={idx}>
              <TableCell className="text-red-400">{idx + 1}</TableCell>
              <TableCell className="text-white">{p}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadAnalysisPuntiDolore;
