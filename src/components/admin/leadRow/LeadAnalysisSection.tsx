
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle, Lightbulb, TrendingUp, Star } from 'lucide-react';

interface LeadAnalysisSectionProps {
  type: 'profile' | 'funnel' | 'opportunities' | 'nextSteps';
  title: string;
  icon: React.ReactNode;
  data: any;
  bgColor: string;
}

const LeadAnalysisSection: React.FC<LeadAnalysisSectionProps> = ({
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
            <TableCell className="font-medium text-gray-300 w-1/3">Categoria</TableCell>
            <TableCell className="text-white font-semibold">{data.categoria_cliente}</TableCell>
          </TableRow>
        )}
        {data.analisi_profilo && (
          <TableRow>
            <TableCell className="font-medium text-gray-300 w-1/3">Analisi Dettagliata</TableCell>
            <TableCell className="text-white">{data.analisi_profilo}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const renderFunnelSection = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16 text-gray-300">Step</TableHead>
          <TableHead className="text-gray-300">Azione Strategica</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((step: string, index: number) => (
          <TableRow key={index}>
            <TableCell>
              <Badge variant="outline" className="bg-blue-800 text-blue-200 border-blue-600 font-bold">
                {index + 1}
              </Badge>
            </TableCell>
            <TableCell className="text-white font-medium">{step}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderOpportunitiesSection = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16 text-gray-300">Rank</TableHead>
          <TableHead className="text-gray-300">Opportunità Identificata</TableHead>
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
            <TableCell className="text-white font-medium">{opp}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderNextStepsSection = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20 text-gray-300">Priorità</TableHead>
          <TableHead className="text-gray-300">Azione Richiesta</TableHead>
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
            <TableCell className="text-white font-medium">{step}</TableCell>
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
      <h4 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
        {icon}
        {title}
      </h4>
      {renderContent()}
    </div>
  );
};

export default LeadAnalysisSection;
