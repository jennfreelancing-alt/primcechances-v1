
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import OpportunityForm from '@/components/shared/OpportunityForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface OpportunityFormData {
  title: string;
  author: string;
  category_id: string;
  preview_text: string;
  description: string;
  organization: string;
  location?: string;
  salary_range?: string;
  is_remote?: boolean;
  application_deadline?: string;
  application_url?: string;
  requirements?: string[];
  benefits?: string[];
  tags?: string[];
  featured_image_url?: string;
  is_published?: boolean;
}

interface AdminOpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'create' | 'edit';
  opportunityId?: string;
  initialData?: Partial<OpportunityFormData>;
}

const AdminOpportunityForm = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  mode = 'create',
  opportunityId,
  initialData 
}: AdminOpportunityFormProps) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData: OpportunityFormData, isDraft: boolean = false) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    console.log('AdminOpportunityForm: Starting submission', { formData, isDraft, mode });
    setSubmitting(true);
    try {
      // The "Publish Immediately" toggle determines publishing behavior
      // When toggle is ON, both buttons publish immediately (ignore isDraft parameter)
      // When toggle is OFF, both buttons save as draft (ignore isDraft parameter)
      const isPublishing = formData.is_published;
      
      const baseOpportunityData = {
        title: formData.title,
        author: formData.author,
        organization: formData.organization,
        description: formData.description,
        category_id: formData.category_id,
        preview_text: formData.preview_text,
        featured_image_url: formData.featured_image_url,
        location: formData.location,
        salary_range: formData.salary_range,
        is_remote: formData.is_remote,
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null,
        application_url: formData.application_url,
        requirements: formData.requirements,
        benefits: formData.benefits,
        tags: formData.tags,
        is_published: isPublishing,
        status: 'approved' as const,
        source: 'user_submitted' as const,
        submitted_by: user.id,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      };

      // Add published_at only if publishing
      const opportunityData = isPublishing 
        ? { ...baseOpportunityData, published_at: new Date().toISOString() }
        : baseOpportunityData;

      let createdOpportunityId: string | undefined;

      if (mode === 'create') {
        const { data, error } = await supabase
          .from('opportunities')
          .insert(opportunityData)
          .select('id')
          .single();

        if (error) throw error;
        
        createdOpportunityId = data.id;
        
        const successMessage = isPublishing 
          ? 'Opportunity created and published successfully' 
          : 'Opportunity saved as draft successfully';
        toast.success(successMessage);
      } else {
        const { error } = await supabase
          .from('opportunities')
          .update(opportunityData)
          .eq('id', opportunityId);

        if (error) throw error;
        
        createdOpportunityId = opportunityId;
        
        const successMessage = isPublishing 
          ? 'Opportunity updated and published successfully' 
          : 'Opportunity updated successfully';
        toast.success(successMessage);
      }

      // Log admin activity (optional - don't fail if this doesn't work)
      if (createdOpportunityId) {
        try {
          await supabase
            .from('admin_activity_logs')
            .insert({
              admin_id: user.id,
              action: mode === 'create' ? 'OPPORTUNITY_CREATED' : 'OPPORTUNITY_UPDATED',
              target_type: 'opportunity',
              target_id: createdOpportunityId,
              details: { 
                title: formData.title, 
                published: isPublishing,
                mode 
              }
            });
        } catch (logError) {
          console.warn('Failed to log admin activity:', logError);
          // Don't fail the entire operation if logging fails
        }
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving opportunity:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Show more specific error message
      const errorMessage = error.message || 'Failed to save opportunity';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Opportunity' : 'Edit Opportunity'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-1">
          <OpportunityForm
            mode={mode}
            userRole="admin"
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={onClose}
            loading={submitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminOpportunityForm;
