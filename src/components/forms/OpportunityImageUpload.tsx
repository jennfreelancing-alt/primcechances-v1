
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

interface OpportunityImageUploadProps {
  imageUrl?: string;
  onImageChange: (url: string) => void;
}

const OpportunityImageUpload = ({ imageUrl, onImageChange }: OpportunityImageUploadProps) => {
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `opportunities/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      onImageChange(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Featured Image</Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {imageUrl ? (
          <div className="relative">
            <img
              src={imageUrl}
              alt="Featured"
              className="w-full h-48 object-cover rounded"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => onImageChange('')}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <span className="text-sm text-gray-600">
                  Click to upload featured image
                </span>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={imageUploading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityImageUpload;
