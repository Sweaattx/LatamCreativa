'use client';

/**
 * AuthListener Component
 * 
 * Listens to Supabase auth state changes and syncs the user state with the app store.
 * - On mount: validates the current session and loads the user profile
 * - On SIGNED_IN / TOKEN_REFRESHED: sets/refreshes the user in the store
 * - On SIGNED_OUT: clears the user from the store
 */
import { useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAppStore } from '@/hooks/useAppStore';
import { usersProfile } from '@/services/supabase/users/profile';

/**
 * Create a minimal fallback user object from Supabase auth data.
 * Used when the database profile fetch fails or times out.
 */
function createFallbackUser(supabaseUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
    return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: (supabaseUser.user_metadata?.full_name as string) ||
            (supabaseUser.user_metadata?.first_name as string) ||
            supabaseUser.email?.split('@')[0] || 'Usuario',
        avatar: (supabaseUser.user_metadata?.avatar_url as string) ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(supabaseUser.email || 'U')}&background=FF4D00&color=fff`,
        role: 'Creative Member',
        username: supabaseUser.email?.split('@')[0] || 'usuario',
    };
}

/**
 * Wraps a promise with a timeout. If the promise doesn't resolve within
 * the given ms, it rejects with a timeout error.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`[${label}] Timeout after ${ms}ms`));
        }, ms);
        promise.then(
            (val) => { clearTimeout(timer); resolve(val); },
            (err) => { clearTimeout(timer); reject(err); }
        );
    });
}

const PROFILE_TIMEOUT_MS = 5000; // 5 seconds

async function loadProfile(userId: string, supabaseUser?: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
    try {
        const profilePromise = (async () => {
            let profile = await usersProfile.getUserProfile(userId);
            if (!profile && supabaseUser) {
                profile = await usersProfile.initializeUserProfile(supabaseUser as Parameters<typeof usersProfile.initializeUserProfile>[0]);
            }
            return profile;
        })();

        const profile = await withTimeout(profilePromise, PROFILE_TIMEOUT_MS, 'loadProfile');
        return profile;
    } catch (error) {
        console.warn('[AuthListener] Profile loading failed/timed out, using fallback:', error);
        if (supabaseUser) {
            return createFallbackUser(supabaseUser);
        }
        return null;
    }
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
                console.log('[AuthListener] Checking current session...');
                const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

                if (error) {
                    console.warn('[AuthListener] getUser error:', error.message);
                }

                if (!isMounted) return;

                if (supabaseUser) {
                    console.log('[AuthListener] Found supabase user:', supabaseUser.id);
                    const profile = await loadProfile(supabaseUser.id, supabaseUser);
                    if (isMounted && profile) {
                        console.log('[AuthListener] ✅ Setting user in store from initAuth:', profile.id);
                        actionsRef.current.setUser(profile as Parameters<typeof actionsRef.current.setUser>[0]);
                    } else if (isMounted) {
                        console.warn('[AuthListener] No profile returned for user');
                        actionsRef.current.setLoadingAuth(false);
                    }
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

        initAuth();

        // 2. Listen for ALL auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[AuthListener] Auth state changed:', event, 'user:', session?.user?.id ?? 'none');

                if (!isMounted) return;

                try {
                    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
                        const profile = await loadProfile(session.user.id, session.user);
                        if (isMounted && profile) {
                            console.log('[AuthListener] ✅ Setting user from event:', event, profile.id);
                            actionsRef.current.setUser(profile as Parameters<typeof actionsRef.current.setUser>[0]);
                        } else if (isMounted) {
                            console.warn('[AuthListener] Could not load profile from event:', event);
                            actionsRef.current.setLoadingAuth(false);
                        }
                    } else if (event === 'SIGNED_OUT') {
                        console.log('[AuthListener] User signed out');
                        actionsRef.current.setUser(null);
                    }
                } catch (error) {
                    console.error('[AuthListener] Error handling auth state change:', error);
                    if (isMounted) {
                        actionsRef.current.setLoadingAuth(false);
                    }
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
