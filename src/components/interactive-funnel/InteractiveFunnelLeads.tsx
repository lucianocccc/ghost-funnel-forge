
import React from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { useInteractiveFunnelLeads } from './leads/useInteractiveFunnelLeads';
import LeadsHeader from './leads/LeadsHeader';
import LeadsTableLoading from './leads/LeadsTableLoading';
import LeadsTableEmpty from './leads/LeadsTableEmpty';
import LeadsTable from './leads/LeadsTable';
import SubmissionDetailModal from './leads/SubmissionDetailModal';

interface InteractiveFunnelLeadsProps {
  funnelId: string;
  funnelName: string;
  isOpen: boolean;
  onClose: () => void;
}

const InteractiveFunnelLeads: React.FC<InteractiveFunnelLeadsProps> = ({
  funnelId,
  funnelName,
  isOpen,
  onClose
}) => {
  const {
    submissions,
    loading,
    selectedSubmission,
    setSelectedSubmission,
    exportToCSV
  } = useInteractiveFunnelLeads({ funnelId, funnelName, isOpen });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <LeadsHeader
              funnelName={funnelName}
              submissionCount={submissions.length}
              onExportCSV={exportToCSV}
            />
          </DialogHeader>

          {loading ? (
            <LeadsTableLoading />
          ) : submissions.length === 0 ? (
            <LeadsTableEmpty />
          ) : (
            <div className="space-y-4">
              <LeadsTable
                submissions={submissions}
                onViewDetails={setSelectedSubmission}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SubmissionDetailModal
        submission={selectedSubmission}
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />
    </>
  );
};

export default InteractiveFunnelLeads;
