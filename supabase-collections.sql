-- ========================================
-- Collections & Collection Items + RLS + RPC
-- Run this in Supabase SQL Editor
-- ========================================

-- 1. COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    item_count INTEGER DEFAULT 0,
    thumbnails TEXT[] DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own collections"
    ON public.collections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view public collections"
    ON public.collections FOR SELECT
    USING (is_private = false);

CREATE POLICY "Users can create their own collections"
    ON public.collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
    ON public.collections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
    ON public.collections FOR DELETE
    USING (auth.uid() = user_id);


-- 2. COLLECTION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.collection_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('project', 'article')),
    added_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(collection_id, item_id, item_type)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON public.collection_items(collection_id);

-- Enable RLS
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- Policies (access through parent collection ownership)
CREATE POLICY "Users can view items in their collections"
    ON public.collection_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE id = collection_items.collection_id
            AND (user_id = auth.uid() OR is_private = false)
        )
    );

CREATE POLICY "Users can add items to their collections"
    ON public.collection_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE id = collection_items.collection_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can remove items from their collections"
    ON public.collection_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE id = collection_items.collection_id
            AND user_id = auth.uid()
        )
    );


-- 3. AUTO-UPDATE updated_at TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 4. AUTO-INCREMENT item_count ON INSERT
CREATE OR REPLACE FUNCTION public.increment_collection_item_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.collections
    SET item_count = item_count + 1, updated_at = now()
    WHERE id = NEW.collection_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_collection_item_insert
    AFTER INSERT ON public.collection_items
    FOR EACH ROW EXECUTE FUNCTION public.increment_collection_item_count();


-- 5. AUTO-DECREMENT item_count ON DELETE
CREATE OR REPLACE FUNCTION public.decrement_collection_item_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.collections
    SET item_count = GREATEST(0, item_count - 1), updated_at = now()
    WHERE id = OLD.collection_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_collection_item_delete
    AFTER DELETE ON public.collection_items
    FOR EACH ROW EXECUTE FUNCTION public.decrement_collection_item_count();


-- 6. RPC: decrement_collection_items (manual call)
CREATE OR REPLACE FUNCTION public.decrement_collection_items(collection_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.collections
    SET item_count = GREATEST(0, item_count - 1), updated_at = now()
    WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. RPC: decrement_thread_replies
CREATE OR REPLACE FUNCTION public.decrement_thread_replies(thread_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.forum_threads
    SET reply_count = GREATEST(0, reply_count - 1), updated_at = now()
    WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 8. RPC: increment_user_stat (if not already created)
CREATE OR REPLACE FUNCTION public.increment_user_stat(
    user_id UUID,
    stat_name TEXT,
    amount INTEGER
)
RETURNS void AS $$
BEGIN
    UPDATE public.users
    SET stats = jsonb_set(
        COALESCE(stats::jsonb, '{}'::jsonb),
        ARRAY[stat_name],
        (COALESCE((stats::jsonb ->> stat_name)::integer, 0) + amount)::text::jsonb
    ),
    updated_at = now()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ✅ Done! Collections system fully configured.
