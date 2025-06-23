
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FunnelSubmission } from '@/types/interactiveFunnel';
import { format } from 'date-fns';

interface SubmissionDetailModalProps {
  submission: FunnelSubmission | null;
  isOpen: boolean;
  onClose: () => void;
}

const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  isOpen,
  onClose
}) => {
  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dettagli Lead</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Informazioni di base</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Nome:</strong> {submission.user_name || 'N/A'}</div>
                <div><strong>Email:</strong> {submission.user_email || 'N/A'}</div>
                <div><strong>Data:</strong> {format(new Date(submission.created_at!), 'dd/MM/yyyy HH:mm')}</div>
                <div><strong>Stato:</strong> {submission.lead_status || 'new'}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Metadati</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Sorgente:</strong> {submission.source || 'direct'}</div>
                <div><strong>Sessione:</strong> {submission.session_id || 'N/A'}</div>
                {submission.referrer_url && (
                  <div><strong>Referrer:</strong> {submission.referrer_url}</div>
                )}
                {submission.completion_time && (
                  <div><strong>Tempo completamento:</strong> {submission.completion_time}s</div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Dati del form</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(submission.submission_data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDetailModal;
