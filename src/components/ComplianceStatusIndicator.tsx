import React from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ComplianceStatusProps {
  isCompliant: boolean;
  validationDate?: string;
  warningCount?: number;
  errorCount?: number;
  score?: number;
  issues?: any[];
}

export function ComplianceStatusIndicator({ 
  isCompliant, 
  validationDate, 
  warningCount = 0, 
  errorCount = 0 
}: ComplianceStatusProps) {
  const getStatusIcon = () => {
    if (errorCount > 0) return <XCircle className="w-4 h-4 text-destructive" />;
    if (warningCount > 0) return <AlertTriangle className="w-4 h-4 text-warning" />;
    return <CheckCircle className="w-4 h-4 text-success" />;
  };

  const getStatusText = () => {
    if (errorCount > 0) return 'Non Conforme';
    if (warningCount > 0) return 'Conforme con Avvisi';
    return 'Completamente Conforme';
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (errorCount > 0) return 'destructive';
    if (warningCount > 0) return 'secondary';
    return 'default';
  };

  const getTooltipContent = () => {
    const parts = [];
    if (isCompliant) {
      parts.push('✅ Conforme al Codice Deontologico Forense');
    }
    if (validationDate) {
      parts.push(`📅 Validato: ${new Date(validationDate).toLocaleDateString('it-IT')}`);
    }
    if (warningCount > 0) {
      parts.push(`⚠️ ${warningCount} avvisi di conformità`);
    }
    if (errorCount > 0) {
      parts.push(`❌ ${errorCount} errori di conformità`);
    }
    parts.push('🔍 Validazione automatica CNF attiva');
    
    return parts.join('\n');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getStatusVariant()} className="gap-1 text-xs">
            <Shield className="w-3 h-3" />
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm whitespace-pre-line">
          <div className="text-sm">
            {getTooltipContent()}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Component for showing detailed compliance info
export function ComplianceDetails({ complianceData }: { complianceData: any }) {
  if (!complianceData?.legalCompliance) return null;

  return (
    <div className="bg-muted/30 p-3 rounded-lg border border-muted text-xs space-y-2">
      <div className="flex items-center gap-2 font-medium">
        <Shield className="w-4 h-4 text-primary" />
        Validazione Conformità CNF
      </div>
      <div className="grid grid-cols-2 gap-2 text-muted-foreground">
        <div>Validato: {complianceData.legalCompliance.validated ? '✅ Sì' : '❌ No'}</div>
        <div>Versione: {complianceData.legalCompliance.complianceVersion || 'N/A'}</div>
      </div>
      {complianceData.legalCompliance.validationDate && (
        <div className="text-muted-foreground">
          Data: {new Date(complianceData.legalCompliance.validationDate).toLocaleString('it-IT')}
        </div>
      )}
    </div>
  );
}