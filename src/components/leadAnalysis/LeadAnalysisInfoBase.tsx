
import React from 'react';
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const LeadAnalysisInfoBase: React.FC<{ lead: any; analysis: any }> = ({ lead, analysis }) => (
  <div className="bg-gray-800 rounded-lg p-4">
    <h3 className="text-lg font-semibold text-golden mb-3">Informazioni Base</h3>
    <Table>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium text-gray-400 w-1/3">Nome:</TableCell>
          <TableCell className="text-white font-medium">{lead.nome}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium text-gray-400 w-1/3">Email:</TableCell>
          <TableCell className="text-white font-medium">{lead.email}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium text-gray-400 w-1/3">Servizio di Interesse:</TableCell>
          <TableCell className="text-white font-medium">{lead.servizio}</TableCell>
        </TableRow>
        {analysis.categoria_cliente && (
          <TableRow>
            <TableCell className="font-medium text-gray-400 w-1/3">Categoria Cliente:</TableCell>
            <TableCell className="text-white font-medium">{analysis.categoria_cliente}</TableCell>
          </TableRow>
        )}
        {analysis.priorita && (
          <TableRow>
            <TableCell className="font-medium text-gray-400 w-1/3">Priorità:</TableCell>
            <TableCell>
              <Badge className={`ml-2 ${
                analysis.priorita.toLowerCase() === 'alta' ? 'bg-red-500' :
                analysis.priorita.toLowerCase() === 'media' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}>
                {analysis.priorita}
              </Badge>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

export default LeadAnalysisInfoBase;
