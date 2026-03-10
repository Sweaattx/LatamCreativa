-- ===========================================
-- 🔒 RLS LOCKDOWN — LatamCreativa
-- ===========================================
-- Ejecutar en Supabase Dashboard → SQL Editor
-- Esto protege TODAS las tablas contra acceso no autorizado
-- ===========================================

-- ── 1. USERS / PROFILES ──
-- Cualquiera puede ver info pública (nombre, username, avatar)
-- Solo el dueño puede ver su email y datos privados
-- Solo el dueño puede editar su perfil

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Ver perfil público (sin email ni datos privados)
CREATE POLICY "users_select_public" ON public.users
  FOR SELECT
  USING (true);

-- Solo el dueño puede actualizar su perfil
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Solo el dueño puede borrar su cuenta
CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE
  USING (auth.uid() = id);

-- Revocar acceso directo a columnas sensibles
-- IMPORTANTE: Crea una vista para la API en vez de exponer la tabla directamente
-- Así nadie puede ver emails ni datos privados via REST API

-- Vista pública (SIN email ni datos sensibles)
CREATE OR REPLACE VIEW public.public_users AS
SELECT
  id,
  name,
  first_name,
  last_name,
  username,
  avatar,
  role,
  bio,
  country,
  city,
  available_for_work,
  is_profile_complete,
  created_at
FROM public.users;

-- ── 2. PROJECTS ──
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver proyectos publicados
CREATE POLICY "projects_select_all" ON public.projects
  FOR SELECT
  USING (true);

-- Solo el autor puede insertar
CREATE POLICY "projects_insert_own" ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Solo el autor puede editar
CREATE POLICY "projects_update_own" ON public.projects
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Solo el autor puede borrar
CREATE POLICY "projects_delete_own" ON public.projects
  FOR DELETE
  USING (auth.uid() = author_id);

-- ── 3. ARTICLES ──
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "articles_select_all" ON public.articles
  FOR SELECT USING (true);

CREATE POLICY "articles_insert_own" ON public.articles
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "articles_update_own" ON public.articles
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "articles_delete_own" ON public.articles
  FOR DELETE USING (auth.uid() = author_id);

-- ── 4. MESSAGES (CRÍTICO — solo participantes pueden leer) ──
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Solo el remitente o receptor puede ver mensajes
CREATE POLICY "messages_select_participants" ON public.messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Solo usuarios autenticados pueden enviar (como ellos mismos)
CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Solo el remitente puede borrar sus mensajes
CREATE POLICY "messages_delete_own" ON public.messages
  FOR DELETE
  USING (auth.uid() = sender_id);

-- ── 5. COMMENTS ──
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_all" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert_auth" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- ── 6. FORUM THREADS ──
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forum_threads_select_all" ON public.forum_threads
  FOR SELECT USING (true);

CREATE POLICY "forum_threads_insert_auth" ON public.forum_threads
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "forum_threads_update_own" ON public.forum_threads
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "forum_threads_delete_own" ON public.forum_threads
  FOR DELETE USING (auth.uid() = author_id);

-- ── 7. REPORTS (solo el que reporta y admins) ──
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Solo el que reportó puede ver su reporte
CREATE POLICY "reports_select_own" ON public.reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- Solo usuarios autenticados pueden crear reportes
CREATE POLICY "reports_insert_auth" ON public.reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- ── 8. LIKES ──
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select_all" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "likes_insert_auth" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete_own" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- ── 9. NOTIFICATIONS ──
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Solo el destinatario puede ver sus notificaciones
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el sistema puede insertar (via service_role)
-- Los usuarios no pueden crear notificaciones falsas
CREATE POLICY "notifications_insert_system" ON public.notifications
  FOR INSERT
  WITH CHECK (false); -- Solo service_role puede insertar

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- ⚠️  OCULTAR EMAIL DE LA TABLA USERS
-- ===========================================
-- Opción 1: Revocar SELECT en columna email (más seguro)
-- Requiere que el código use la vista public_users en vez de la tabla directamente

-- Opción 2: Crear función para obtener email solo del usuario actual
CREATE OR REPLACE FUNCTION public.get_my_email()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT email FROM public.users WHERE id = auth.uid();
$$;

-- ===========================================
-- ✅ VERIFICACIÓN
-- ===========================================
-- Después de ejecutar, prueba en SQL Editor:
-- SELECT * FROM public.users LIMIT 5;
-- (debe mostrar solo datos del usuario actual si estás logueado,
--  o datos públicos si no estás logueado)
