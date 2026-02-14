/**
 * Cliente de Supabase para el lado del cliente (Browser)
 * 
 * Usa este cliente en componentes de cliente ('use client')
 */
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client during build time
    console.warn('Supabase credentials not available - using mock client');
    return null as unknown as ReturnType<typeof createBrowserClient<Database>>;
  }
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Singleton para uso en hooks y componentes cliente
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: always create new client
    return createClient();
  }
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
