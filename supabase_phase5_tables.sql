CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'system')),
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    link TEXT,
    read BOOLEAN DEFAULT false,
    actor_name TEXT,
    actor_avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own notifications" ON notifications;
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

CREATE TABLE IF NOT EXISTS project_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, user_id)
);

ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Likes are publicly readable" ON project_likes;
CREATE POLICY "Likes are publicly readable" ON project_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can like" ON project_likes;
CREATE POLICY "Users can like" ON project_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unlike" ON project_likes;
CREATE POLICY "Users can unlike" ON project_likes FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS article_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(article_id, user_id)
);

ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Article likes are publicly readable" ON article_likes;
CREATE POLICY "Article likes are publicly readable" ON article_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can like articles" ON article_likes;
CREATE POLICY "Users can like articles" ON article_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unlike articles" ON article_likes;
CREATE POLICY "Users can unlike articles" ON article_likes FOR DELETE USING (auth.uid() = user_id);
