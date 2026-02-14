'use client';

/**
 * AuthListener Component
 * 
 * Listens to Supabase auth state changes and syncs the user state with the app store.
 * This ensures the app correctly reflects the user's auth status:
 * - On page load: validates the current session and loads the user profile
 * - On login: sets the user in the store
 * - On logout/session expiry: clears the user from the store
 * 
 * Must be rendered inside the Providers component.
 */
import { useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAppStore } from '@/hooks/useAppStore';
import { usersProfile } from '@/services/supabase/users/profile';

export function AuthListener() {
    const { actions } = useAppStore();
    const actionsRef = useRef(actions);
    actionsRef.current = actions;
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const supabase = getSupabaseClient();
        if (!supabase) {
            actionsRef.current.setLoadingAuth(false);
            return;
        }

        // 1. Check current session on mount
        const initAuth = async () => {
            try {
                const { data: { user: supabaseUser } } = await supabase.auth.getUser();

                if (supabaseUser) {
                    // Fetch the full user profile from the database
                    const profile = await usersProfile.getUserProfile(supabaseUser.id);
                    if (profile) {
                        actionsRef.current.setUser(profile);
                    } else {
                        // User exists in auth but not in DB — initialize profile
                        const newProfile = await usersProfile.initializeUserProfile(supabaseUser);
                        if (newProfile) {
                            actionsRef.current.setUser(newProfile);
                        }
                    }
                } else {
                    // No valid session — clear cached user
                    actionsRef.current.setUser(null);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                actionsRef.current.setLoadingAuth(false);
            }
        };

        initAuth();

        // 2. Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const profile = await usersProfile.getUserProfile(session.user.id);
                    if (profile) {
                        actionsRef.current.setUser(profile);
                    }
                } else if (event === 'SIGNED_OUT') {
                    actionsRef.current.setUser(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return null; // This component renders nothing
}
