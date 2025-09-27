
import { useState } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { callOpenAI } from '@/services/openaiService';

interface GeneratedDocument {
  id: string;
  document_type: string;
  title: string;
  content: string;
  created_at: string;
  is_ats_optimized: boolean;
}

export const useDocumentGenerator = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);

  const generateDocument = async (
    documentType: 'cover_letter' | 'cv' | 'sop',
    opportunityId?: string,
    additionalInfo?: any
  ) => {
    if (!user) {
      toast.error('Please log in to generate documents');
      return null;
    }

    setLoading(true);
    try {
      // Use OpenAI to generate the document
      let prompt = '';
      let title = '';
      switch (documentType) {
        case 'cover_letter':
          title = 'Professional Cover Letter';
          prompt = `Write a professional cover letter for a job application. User email: ${user.email}. Additional info: ${JSON.stringify(additionalInfo)}`;
          break;
        case 'cv':
          title = 'Professional CV/Resume';
          prompt = `Write a professional CV/resume for a software developer. User email: ${user.email}. Additional info: ${JSON.stringify(additionalInfo)}`;
          break;
        case 'sop':
          title = 'Statement of Purpose';
          prompt = `Write a statement of purpose for a job or academic application. User email: ${user.email}. Additional info: ${JSON.stringify(additionalInfo)}`;
          break;
      }
      const openaiRes = await callOpenAI('chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert document generator for job seekers.' },
          { role: 'user', content: prompt }
        ],
        user: user.id
      });
      const content = openaiRes.choices?.[0]?.message?.content || '';
      const newDocument: GeneratedDocument = {
        id: crypto.randomUUID(),
        document_type: documentType,
        title,
        content,
        created_at: new Date().toISOString(),
        is_ats_optimized: true
      };
      setDocuments(prev => [newDocument, ...prev]);
      toast.success(`${documentType.replace('_', ' ')} generated successfully!`);
      return newDocument;
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to generate document');
    } finally {
      setLoading(false);
    }
    return null;
  };

  const fetchUserDocuments = async () => {
    if (!user) return;
    console.log('Fetching user documents for user:', user.id);
  };

  const deleteDocument = async (documentId: string) => {
    try {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Document deleted');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  return {
    generateDocument,
    fetchUserDocuments,
    deleteDocument,
    documents,
    loading
  };
};
