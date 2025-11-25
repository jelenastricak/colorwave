-- Add sharing fields to brand_kits table
ALTER TABLE public.brand_kits 
ADD COLUMN is_public boolean NOT NULL DEFAULT false,
ADD COLUMN share_token text UNIQUE;

-- Create index for faster lookups by share token
CREATE INDEX idx_brand_kits_share_token ON public.brand_kits(share_token) WHERE share_token IS NOT NULL;

-- Add RLS policy to allow public access to shared kits
CREATE POLICY "Anyone can view public brand kits"
ON public.brand_kits
FOR SELECT
USING (is_public = true);

-- Function to generate a unique share token
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token text;
  exists boolean;
BEGIN
  LOOP
    -- Generate a random 12-character token
    token := encode(gen_random_bytes(9), 'base64');
    token := replace(token, '/', '_');
    token := replace(token, '+', '-');
    token := substring(token, 1, 12);
    
    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM brand_kits WHERE share_token = token) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN token;
END;
$$;