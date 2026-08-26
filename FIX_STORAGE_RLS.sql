-- Fix storage policies to allow avatar uploads
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars' OR bucket_id = 'portfolio-images');

CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' OR bucket_id = 'portfolio-images');

CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' OR bucket_id = 'portfolio-images');

CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' OR bucket_id = 'portfolio-images');
