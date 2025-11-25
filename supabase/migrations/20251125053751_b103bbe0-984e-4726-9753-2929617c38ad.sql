-- Update RLS policies to allow public gallery functionality

-- Allow anyone to view public brand kits (already exists, but ensuring it's correct)
DROP POLICY IF EXISTS "Anyone can view public brand kits" ON brand_kits;
CREATE POLICY "Anyone can view public brand kits" 
ON brand_kits 
FOR SELECT 
USING (is_public = true);

-- Allow anonymous users to insert brand kits for gallery submission
DROP POLICY IF EXISTS "Allow anonymous gallery submissions" ON brand_kits;
CREATE POLICY "Allow anonymous gallery submissions" 
ON brand_kits 
FOR INSERT 
WITH CHECK (is_public = true);

-- Add a featured flag for highlighting best kits
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Add index for better gallery query performance
CREATE INDEX IF NOT EXISTS idx_brand_kits_public_featured ON brand_kits(is_public, featured, created_at DESC) WHERE is_public = true;