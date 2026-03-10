-- ========================================
-- Storage Buckets + Policies
-- Run this in Supabase SQL Editor
-- ========================================

-- 1. CREATE 'media' BUCKET (public, for avatars/projects/articles)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'media',
    'media',
    true,
    52428800, -- 50MB max
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
        'video/mp4',
        'video/webm'
    ]
)
ON CONFLICT (id) DO NOTHING;


-- 2. POLICIES: Anyone can VIEW public files
CREATE POLICY "Public read access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'media');


-- 3. POLICIES: Authenticated users can UPLOAD
CREATE POLICY "Authenticated users can upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'media'
        AND auth.role() = 'authenticated'
    );


-- 4. POLICIES: Users can UPDATE their own files
CREATE POLICY "Users can update own files"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'media'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );


-- 5. POLICIES: Users can DELETE their own files
CREATE POLICY "Users can delete own files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'media'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );


-- ✅ Done! Storage bucket 'media' is ready.
-- 
-- File structure convention:
--   media/{user_id}/avatars/{filename}
--   media/{user_id}/covers/{filename}
--   media/{user_id}/projects/{filename}
--   media/{user_id}/articles/{filename}
--   media/{user_id}/gallery/{filename}
