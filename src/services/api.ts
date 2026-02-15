// ==============================================
// SUPABASE API — Single re-export point
// ==============================================
// This file re-exports the aggregated API from the Supabase service layer.
// All domain services are defined in ./supabase/index.ts

export { api } from './supabase';
export type { PaginatedResult } from './supabase/utils';
