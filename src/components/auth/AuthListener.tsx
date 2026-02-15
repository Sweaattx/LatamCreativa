'use client';

/**
 * AuthListener Component
 * 
 * Listens to Supabase auth state changes and syncs the user state with the app store.
 * 
 * KEY DESIGN: Sets a user IMMEDIATELY from Supabase auth data on sign-in,
 * then tries to enrich with database profile in background. This ensures the UI
 * always reflects logged-in state instantly, even if the DB query hangs.
 */
import { useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAppStore } from '@/hooks/useAppStore';
import { usersProfile } from '@/services/supabase/users/profile';

/**
 * Create a user object directly from Supabase auth data.
 * No database call needed — this is instant.
 */
function userFromAuth(supabaseUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
    const name = (supabaseUser.user_metadata?.full_name as string) ||
        (supabaseUser.user_metadata?.first_name as string) ||
        supabaseUser.email?.split('@')[0] || 'Usuario';
    return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name,
        avatar: (supabaseUser.user_metadata?.avatar_url as string) ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF4D00&color=fff`,
        role: 'Creative Member',
        username: supabaseUser.email?.split('@')[0] || 'usuario',
        firstName: (supabaseUser.user_metadata?.first_name as string) || '',
        lastName: (supabaseUser.user_metadata?.last_name as string) || '',
    };
}

export function AuthListener() {
    const { actions } = useAppStore();
    const actionsRef = useRef(actions);
    actionsRef.current = actions;

    useEffect(() => {
        const supabase = getSupabaseClient();
        if (!supabase) {
            console.warn('[AuthListener] No Supabase client available');
            actionsRef.current.setLoadingAuth(false);
            return;
        }

        let isMounted = true;

        // 1. Check current session on mount
        const initAuth = async () => {
            try {
                console.log('[AuthListener] initAuth starting...');
                const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

                if (error) {
                    console.warn('[AuthListener] getUser error:', error.message);
                }

                if (!isMounted) return;

                if (supabaseUser) {
                    // IMMEDIATELY set user from auth data — no DB wait
                    const authUser = userFromAuth(supabaseUser);
                    console.log('[AuthListener] ✅ Setting user IMMEDIATELY from auth:', authUser.id, authUser.name);
                    actionsRef.current.setUser(authUser as Parameters<typeof actionsRef.current.setUser>[0]);

                    // Then try to enrich from DB in background (fire-and-forget)
                    enrichFromDB(supabaseUser.id, supabaseUser);
                } else {
                    console.log('[AuthListener] No active session');
                    actionsRef.current.setUser(null);
                }
            } catch (error) {
                console.error('[AuthListener] Error initializing auth:', error);
                if (isMounted) {
                    actionsRef.current.setLoadingAuth(false);
                }
            }
        };

        // Background enrichment — update user with full DB profile if available
        const enrichFromDB = async (userId: string, supabaseUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) => {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);

                let profile = await usersProfile.getUserProfile(userId);
                clearTimeout(timeout);

                if (!profile) {
                    profile = await usersProfile.initializeUserProfile(supabaseUser as Parameters<typeof usersProfile.initializeUserProfile>[0]);
                }
                if (isMounted && profile) {
                    console.log('[AuthListener] 📦 Enriched user from DB:', profile.id);
                    actionsRef.current.setUser(profile as Parameters<typeof actionsRef.current.setUser>[0]);
                }
            } catch (err) {
                console.warn('[AuthListener] DB enrichment failed (non-critical):', err);
                // User is already set from auth data, so this is fine
            }
        };

        initAuth();

        // 2. Listen for ALL auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[AuthListener] Auth event:', event, session?.user?.id ?? 'no-user');

                if (!isMounted) return;

                if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
                    // IMMEDIATELY set user from auth data
                    const authUser = userFromAuth(session.user);
                    console.log('[AuthListener] ✅ Setting user from event:', event, authUser.name);
                    actionsRef.current.setUser(authUser as Parameters<typeof actionsRef.current.setUser>[0]);

                    // Enrich in background
                    enrichFromDB(session.user.id, session.user);
                } else if (event === 'SIGNED_OUT') {
                    console.log('[AuthListener] User signed out');
                    actionsRef.current.setUser(null);
                }
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return null;
}
