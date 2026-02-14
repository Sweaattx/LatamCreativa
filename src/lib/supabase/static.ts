/**
 * Cliente de Supabase para generación estática
 * 
 * Este cliente NO usa cookies y es seguro para usar en:
 * - generateStaticParams
 * - generateMetadata (cuando se llama durante build)
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export function createStaticClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
