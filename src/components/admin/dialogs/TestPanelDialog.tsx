
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AdminTestPanel from '@/components/admin/AdminTestPanel';

interface TestPanelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TestPanelDialog: React.FC<TestPanelDialogProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Test AI/Email</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <AdminTestPanel />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestPanelDialog;
