
import React from 'react';
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table';

const LeadAnalysisProfile: React.FC<{ analysis: any }> = ({ analysis }) => {
  if (!analysis.categoria_cliente && !analysis.analisi_profilo) return null;
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-golden mb-3">Analisi del Profilo</h3>
      <Table>
        <TableBody>
          {analysis.categoria_cliente && (
            <TableRow>
              <TableCell className="font-medium text-gray-400 w-1/4">Categoria Cliente</TableCell>
              <TableCell className="text-white">{analysis.categoria_cliente}</TableCell>
            </TableRow>
          )}
          {analysis.analisi_profilo && (
            <TableRow>
              <TableCell className="font-medium text-gray-400 w-1/4">Analisi Dettagliata</TableCell>
              <TableCell className="text-white leading-relaxed">{analysis.analisi_profilo}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadAnalysisProfile;
