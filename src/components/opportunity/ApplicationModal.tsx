
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEmail } from '@/hooks/useEmail';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: {
    id: string;
    title: string;
    organization: string;
    application_url?: string;
  };
  onSubmit: (applicationData: ApplicationFormData) => Promise<void>;
}

interface ApplicationFormData {
  coverLetter: string;
  resume?: File;
  additionalDocuments?: File[];
  customAnswers?: Record<string, string>;
}

const ApplicationModal = ({ isOpen, onClose, opportunity, onSubmit }: ApplicationModalProps) => {
  const { user } = useAuth();
  const { sendApplicationConfirmation } = useEmail();
  const [formData, setFormData] = useState<ApplicationFormData>({
    coverLetter: '',
    customAnswers: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }

    if (!user) {
      toast.error('Please log in to apply');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save application data to database
      const { error: applicationError } = await supabase
        .from('user_applications')
        .insert({
          user_id: user.id,
          opportunity_id: opportunity.id,
          application_status: 'applied',
          notes: formData.coverLetter
        });

      if (applicationError) throw applicationError;

      // Save detailed application data
      const applicationData = {
        user_id: user.id,
        opportunity_id: opportunity.id,
        opportunity_title: opportunity.title,
        organization: opportunity.organization,
        cover_letter: formData.coverLetter,
        resume_filename: formData.resume?.name,
        additional_documents: formData.additionalDocuments?.map(doc => doc.name),
        applied_at: new Date().toISOString()
      };

      const { error: detailsError } = await supabase
        .from('application_details')
        .insert(applicationData);

      if (detailsError) {
        console.error('Error saving application details:', detailsError);
        // Don't throw here as the main application was saved
      }

      // Update opportunity application count
      const { data: currentData } = await supabase
        .from('opportunities')
        .select('application_count')
        .eq('id', opportunity.id)
        .single();

      const newCount = (currentData?.application_count || 0) + 1;

      await supabase
        .from('opportunities')
        .update({ application_count: newCount })
        .eq('id', opportunity.id);

      await onSubmit(formData);
      
      // Send application confirmation email
      try {
        await sendApplicationConfirmation({
          userName: user.user_metadata?.full_name || 'User',
          userEmail: user.email || '',
          opportunityTitle: opportunity.title,
          companyName: opportunity.organization,
          applicationDate: new Date().toLocaleDateString()
        });
      } catch (error) {
        console.error('Failed to send application confirmation email:', error);
        // Don't show error to user as application was successful
      }
      
      onClose();
      toast.success('Application submitted successfully!');
      
      // If there's an external URL, open it as well
      if (opportunity.application_url) {
        window.open(opportunity.application_url, '_blank');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'resume' | 'additionalDocuments') => {
    const files = e.target.files;
    if (files) {
      if (field === 'resume') {
        setFormData(prev => ({ ...prev, resume: files[0] }));
      } else {
        setFormData(prev => ({ ...prev, additionalDocuments: Array.from(files) }));
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Apply for {opportunity.title}
          </DialogTitle>
          <p className="text-gray-600">at {opportunity.organization}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Cover Letter */}
          <div>
            <Label htmlFor="coverLetter" className="text-sm font-medium text-gray-700">
              Cover Letter *
            </Label>
            <Textarea
              id="coverLetter"
              placeholder="Write your cover letter here. Explain why you're interested in this opportunity and how your skills match the requirements..."
              value={formData.coverLetter}
              onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
              className="mt-2 min-h-[150px]"
              required
            />
          </div>

          {/* Resume Upload */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Resume (Optional)</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileUpload(e, 'resume')}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800">
                <Upload className="w-5 h-5" />
                {formData.resume ? formData.resume.name : 'Upload Resume (PDF, DOC)'}
              </label>
            </div>
          </div>

          {/* Additional Documents */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Additional Documents (Optional)</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, 'additionalDocuments')}
                className="hidden"
                id="additional-docs-upload"
              />
              <label htmlFor="additional-docs-upload" className="cursor-pointer flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800">
                <Upload className="w-5 h-5" />
                {formData.additionalDocuments?.length 
                  ? `${formData.additionalDocuments.length} files selected`
                  : 'Upload Additional Documents'
                }
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#17cfcf] hover:bg-[#17cfcf]/90"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;
