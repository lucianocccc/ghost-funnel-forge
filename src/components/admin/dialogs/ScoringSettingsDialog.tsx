
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LeadScoringPanel from '@/components/admin/LeadScoringPanel';

interface ScoringSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ScoringSettingsDialog: React.FC<ScoringSettingsDialogProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Impostazioni Lead Scoring</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <LeadScoringPanel />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScoringSettingsDialog;
