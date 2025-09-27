
-- Create storage bucket for opportunity images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'opportunities'
);

-- Allow public access to view images
CREATE POLICY "Allow public access to view images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Allow users to delete their own uploaded images
CREATE POLICY "Allow users to delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own uploaded images
CREATE POLICY "Allow users to update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);
