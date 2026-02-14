/**
 * User Hooks
 * Domain-specific hooks for user profile, follow, and admin operations
 */

import { useState, useEffect } from 'react';
import { useAppStore } from './useAppStore';
import { api } from '../services/api';
import { usersService } from '../services/supabase/users';

import { User } from '../types';

// --- Hook for User Profile ---
export const useUserProfile = (userId: string | null) => {
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const fetchProfile = async () => {
            setLoading(true);
            try {
                const data = await usersService.getUserProfile(userId);
                setProfile(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    return { profile, loading };
};

// --- Hook for Admin: All Users ---
export const useAllUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const data = await api.getAllUsers();
                setUsers(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return { users, loading };
};

// --- Hook for Follow/Unfollow ---
export const useFollow = (targetUserId: string, currentUserId: string | undefined) => {
    const { actions } = useAppStore();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
            if (!targetUserId) return;
            setLoading(true);
            try {
                // Check if following
                if (currentUserId) {
                    const following = await usersService.isFollowing(targetUserId, currentUserId);
                    setIsFollowing(following);
                }

                // Fetch follower count
                const followers = await usersService.getFollowers(targetUserId);
                setFollowerCount(followers.length);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [targetUserId, currentUserId]);

    const toggleFollow = async () => {
        if (!currentUserId || !targetUserId) return;

        // Optimistic update: Store previous state for rollback
        const wasFollowing = isFollowing;
        const offset = wasFollowing ? -1 : 1;

        // Update UI immediately (Optimistic)
        setIsFollowing(!wasFollowing);
        setFollowerCount(prev => Math.max(0, prev + offset));

        try {
            if (wasFollowing) {
                await usersService.unfollowUser(targetUserId, currentUserId);
            } else {
                await usersService.followUser(targetUserId, currentUserId);
            }
            // Trigger global update for sidebar
            actions.triggerFollowUpdate();
        } catch (error) {
            console.error("Error toggling follow:", error);
            // Revert state on error
            setIsFollowing(wasFollowing);
            setFollowerCount(prev => Math.max(0, prev - offset));
        }
    };

    return { isFollowing, loading, toggleFollow, setFollowerCount, followerCount };
};

// Backward compatibility alias (deprecated)
export const useSubscription = useFollow;
