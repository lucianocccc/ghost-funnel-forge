
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface LeadRowAnalysisSectionProps {
  type: 'profile' | 'funnel' | 'opportunities' | 'nextSteps';
  title: string;
  icon: React.ReactNode;
  data: any;
  bgColor: string;
}

const LeadRowAnalysisSection: React.FC<LeadRowAnalysisSectionProps> = ({
  type,
  title,
  icon,
  data,
  bgColor
}) => {
  const renderProfileSection = () => (
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

  const renderFunnelSection = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Step</TableHead>
          <TableHead>Azione Strategica</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((step: string, index: number) => (
          <TableRow key={index}>
            <TableCell>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 font-bold">
                {index + 1}
              </Badge>
            </TableCell>
            <TableCell className="text-black font-medium">{step}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderOpportunitiesSection = () => (
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

  const renderNextStepsSection = () => (
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

  const renderContent = () => {
    switch (type) {
      case 'profile':
        return renderProfileSection();
      case 'funnel':
        return renderFunnelSection();
      case 'opportunities':
        return renderOpportunitiesSection();
      case 'nextSteps':
        return renderNextStepsSection();
      default:
        return null;
    }
  };

  return (
    <div className={`${bgColor} rounded-lg p-4`}>
      <h4 className="flex items-center gap-2 text-lg font-semibold text-black mb-3">
        {icon}
        {title}
      </h4>
      {renderContent()}
    </div>
  );
};

export default LeadRowAnalysisSection;
