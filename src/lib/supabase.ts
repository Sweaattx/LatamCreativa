/**
 * Re-export del cliente de Supabase para compatibilidad.
 * 
 * Este archivo provee el singleton `supabase` que los servicios
 * existentes esperan importar.
 * 
 * Usa lazy initialization via Proxy para evitar problemas en
 * Cloudflare Workers donde el contexto del módulo puede reciclarse.
 */

import { getSupabaseClient } from './supabase/client';

// Lazy-initialized proxy: delegates all property access to the real client
// This avoids calling getSupabaseClient() at module load time, which can
// create stale singletons in edge/Workers environments.
export const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
    get(_target, prop, receiver) {
        const client = getSupabaseClient();
        const value = Reflect.get(client as object, prop, receiver);
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    }
});

// Re-export types
export type { Database } from '@/types/database';
