import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import OpportunityForm from '@/components/shared/OpportunityForm';


import { OpportunityFormData } from '@/types/opportunity-form';

interface CreateOpportunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OpportunityFormData, isDraft?: boolean) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CreateOpportunityModal: React.FC<CreateOpportunityModalProps> = ({ open, onOpenChange, onSubmit, onCancel, loading }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">Create New Opportunity</DialogTitle>
        </DialogHeader>
        <div className="px-1">
          <OpportunityForm
            mode="create"
            userRole="admin"
            onSubmit={onSubmit}
            onCancel={onCancel}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOpportunityModal;
