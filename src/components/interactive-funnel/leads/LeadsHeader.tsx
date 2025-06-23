
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';

interface LeadsHeaderProps {
  funnelName: string;
  submissionCount: number;
  onExportCSV: () => void;
}

const LeadsHeader: React.FC<LeadsHeaderProps> = ({
  funnelName,
  submissionCount,
  onExportCSV
}) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">
        Lead raccolti: {funnelName}
      </h2>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Esporta CSV
        </Button>
        <Badge variant="secondary">
          {submissionCount} lead
        </Badge>
      </div>
    </div>
  );
};

export default LeadsHeader;
