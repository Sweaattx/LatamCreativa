/**
 * Re-export del cliente de Supabase para compatibilidad.
 * 
 * Este archivo provee el singleton `supabase` que los servicios
 * existentes esperan importar.
 */

import { getSupabaseClient } from './supabase/client';

// Export singleton for backward compatibility with services
export const supabase = getSupabaseClient();

// Re-export types
export type { Database } from '@/types/database';
