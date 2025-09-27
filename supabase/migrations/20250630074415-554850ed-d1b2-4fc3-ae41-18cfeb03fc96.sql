
-- Remove competitions and conferences categories
DELETE FROM public.categories 
WHERE name IN ('Competitions', 'Conferences');

-- Update opportunities that were assigned to deleted categories to assign them to a default category
-- First, let's get the ID of a default category (Jobs)
UPDATE public.opportunities 
SET category_id = (SELECT id FROM public.categories WHERE name = 'Jobs' LIMIT 1)
WHERE category_id IN (
  SELECT id FROM public.categories WHERE name IN ('Competitions', 'Conferences')
);
