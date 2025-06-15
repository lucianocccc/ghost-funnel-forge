
import React from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

interface LeadRowProfileSectionProps {
  data: {
    categoria_cliente?: string;
    analisi_profilo?: string;
  };
}

const LeadRowProfileSection: React.FC<LeadRowProfileSectionProps> = ({ data }) => {
  return (
    <Table>
      <TableBody>
        {data.categoria_cliente && (
          <TableRow>
            <TableCell className="font-medium text-gray-600 w-1/3">Categoria</TableCell>
            <TableCell className="text-black font-semibold">{data.categoria_cliente}</TableCell>
          </TableRow>
        )}
        {data.analisi_profilo && (
          <TableRow>
            <TableCell className="font-medium text-gray-600 w-1/3">Analisi Dettagliata</TableCell>
            <TableCell className="text-black">{data.analisi_profilo}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default LeadRowProfileSection;
