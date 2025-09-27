
export interface OpportunityFormData {
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

export interface OpportunityFormProps {
  mode: 'create' | 'edit';
  userRole: 'user' | 'admin' | 'staff_admin';
  initialData?: Partial<OpportunityFormData>;
  onSubmit: (data: OpportunityFormData, isDraft?: boolean) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
}
