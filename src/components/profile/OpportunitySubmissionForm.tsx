
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { X, Plus } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface OpportunitySubmissionFormProps {
  onSuccess: () => void;
}

interface FormData {
  title: string;
  organization: string;
  description: string;
  category_id: string;
  application_url?: string;
  location?: string;
  salary_range?: string;
  is_remote: boolean;
  application_deadline?: string;
  submission_notes?: string;
}

const OpportunitySubmissionForm = ({ onSuccess }: OpportunitySubmissionFormProps) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [benefits, setBenefits] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>(['']);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      is_remote: false
    }
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const addArrayItem = (arr: string[], setArr: (arr: string[]) => void) => {
    setArr([...arr, '']);
  };

  const updateArrayItem = (arr: string[], setArr: (arr: string[]) => void, index: number, value: string) => {
    const newArr = [...arr];
    newArr[index] = value;
    setArr(newArr);
  };

  const removeArrayItem = (arr: string[], setArr: (arr: string[]) => void, index: number) => {
    setArr(arr.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error('You must be logged in to submit opportunities');
      return;
    }

    setLoading(true);
    try {
      const filteredRequirements = requirements.filter(req => req.trim() !== '');
      const filteredBenefits = benefits.filter(benefit => benefit.trim() !== '');
      const filteredTags = tags.filter(tag => tag.trim() !== '');

      const { error } = await supabase
        .from('user_submissions')
        .insert({
          ...data,
          user_id: user.id,
          requirements: filteredRequirements.length > 0 ? filteredRequirements : null,
          benefits: filteredBenefits.length > 0 ? filteredBenefits : null,
          tags: filteredTags.length > 0 ? filteredTags : null,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Opportunity submitted successfully! It will be reviewed by our team.');
      onSuccess();
    } catch (error) {
      console.error('Error submitting opportunity:', error);
      toast.error('Failed to submit opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Opportunity Title *</Label>
          <Input
            id="title"
            {...register('title', { required: 'Title is required' })}
            placeholder="e.g., Software Developer Position"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <Label htmlFor="organization">Organization *</Label>
          <Input
            id="organization"
            {...register('organization', { required: 'Organization is required' })}
            placeholder="e.g., Tech Company Inc."
          />
          {errors.organization && <p className="text-red-500 text-sm mt-1">{errors.organization.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register('description', { required: 'Description is required' })}
          placeholder="Provide detailed information about the opportunity..."
          rows={4}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select onValueChange={(value) => setValue('category_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && <p className="text-red-500 text-sm mt-1">Category is required</p>}
        </div>

        <div>
          <Label htmlFor="application_url">Application URL</Label>
          <Input
            id="application_url"
            {...register('application_url')}
            placeholder="https://example.com/apply"
            type="url"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register('location')}
            placeholder="e.g., Lagos, Nigeria"
          />
        </div>

        <div>
          <Label htmlFor="salary_range">Salary Range</Label>
          <Input
            id="salary_range"
            {...register('salary_range')}
            placeholder="e.g., ₦150,000 - ₦300,000"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_remote"
          onCheckedChange={(checked) => setValue('is_remote', checked)}
        />
        <Label htmlFor="is_remote">Remote Work Available</Label>
      </div>

      <div>
        <Label htmlFor="application_deadline">Application Deadline</Label>
        <Input
          id="application_deadline"
          {...register('application_deadline')}
          type="datetime-local"
        />
      </div>

      {/* Requirements Section */}
      <div>
        <Label>Requirements</Label>
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <Input
              value={req}
              onChange={(e) => updateArrayItem(requirements, setRequirements, index, e.target.value)}
              placeholder="Add a requirement..."
            />
            {requirements.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem(requirements, setRequirements, index)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(requirements, setRequirements)}
          className="mt-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Requirement
        </Button>
      </div>

      {/* Benefits Section */}
      <div>
        <Label>Benefits</Label>
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <Input
              value={benefit}
              onChange={(e) => updateArrayItem(benefits, setBenefits, index, e.target.value)}
              placeholder="Add a benefit..."
            />
            {benefits.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem(benefits, setBenefits, index)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(benefits, setBenefits)}
          className="mt-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Benefit
        </Button>
      </div>

      {/* Tags Section */}
      <div>
        <Label>Tags</Label>
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <Input
              value={tag}
              onChange={(e) => updateArrayItem(tags, setTags, index, e.target.value)}
              placeholder="Add a tag..."
            />
            {tags.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem(tags, setTags, index)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(tags, setTags)}
          className="mt-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tag
        </Button>
      </div>

      <div>
        <Label htmlFor="submission_notes">Additional Notes</Label>
        <Textarea
          id="submission_notes"
          {...register('submission_notes')}
          placeholder="Any additional information for the review team..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Opportunity'}
        </Button>
      </div>
    </form>
  );
};

export default OpportunitySubmissionForm;
