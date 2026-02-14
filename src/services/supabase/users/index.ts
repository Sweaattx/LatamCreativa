/**
 * Users Service Index (Supabase)
 * 
 * Barrel export para todos los módulos de usuarios.
 * 
 * @module services/supabase/users
 */

export { usersAuth } from './auth';
export { usersProfile, type UserProfile } from './profile';
export { usersSocial } from './social';

// Combined service for backward compatibility
import { usersAuth } from './auth';
import { usersProfile } from './profile';
import { usersSocial } from './social';

export const usersService = {
    // Auth
    ...usersAuth,

    // Profile
    ...usersProfile,

    // Social
    ...usersSocial,
};
