'use client';

/**
 * AuthListener Component
 * 
 * Listens to Supabase auth state changes and syncs the user state with the app store.
 * - On mount: validates the current session and loads the user profile
 * - On SIGNED_IN / TOKEN_REFRESHED: sets/refreshes the user in the store
 * - On SIGNED_OUT: clears the user from the store
 * 
 * Must be rendered inside the Providers component.
 */
import { useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAppStore } from '@/hooks/useAppStore';
import { usersProfile } from '@/services/supabase/users/profile';

async function loadProfile(userId: string, supabaseUser?: { email?: string; user_metadata?: Record<string, unknown> }) {
    let profile = await usersProfile.getUserProfile(userId);
    if (!profile && supabaseUser) {
        profile = await usersProfile.initializeUserProfile(supabaseUser as Parameters<typeof usersProfile.initializeUserProfile>[0]);
    }
    return profile;
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
                        console.log('[AuthListener] Setting user profile in store:', profile.id);
                        actionsRef.current.setUser(profile);
                    } else {
                        console.warn('[AuthListener] Profile not found/loaded for user:', supabaseUser.id);
                        actionsRef.current.setLoadingAuth(false);
                    }
                } else {
                    console.log('[AuthListener] No active session found');
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
                            console.log('[AuthListener] Setting user from event:', event, profile.id);
                            actionsRef.current.setUser(profile);
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
