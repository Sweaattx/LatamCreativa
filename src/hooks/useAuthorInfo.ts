/**
 * useAuthorInfo Hook
 * 
 * Fetches author information in real-time using the authorId.
 * This ensures that when a user updates their profile (name, avatar),
 * the changes are reflected immediately in all their content.
 * 
 * Usage:
 * const { authorName, authorAvatar, loading } = useAuthorInfo(authorId, fallbackName, fallbackAvatar);
 */

import { useState, useEffect, useMemo } from 'react';
import { usersService } from '../services/supabase/users';

interface AuthorInfo {
    authorName: string;
    authorUsername?: string;
    authorAvatar: string;
    authorId: string;
    loading: boolean;
}

/**
 * Safely extracts a string value from potentially nested data (handles n8n edge cases)
 */
function safeString(value: unknown, fallback: string = ''): string {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>;
        // Handle { name: 'value' } format
        if (typeof obj.name === 'string') return obj.name;
        // Handle { text: 'value' } format (Gemini API)
        if (typeof obj.text === 'string') return obj.text;
        // Handle nested parts structure
        if (Array.isArray(obj.parts) && obj.parts[0] && typeof (obj.parts[0] as Record<string, unknown>).text === 'string') {
            return (obj.parts[0] as Record<string, unknown>).text as string;
        }
    }
    return String(value) || fallback;
}

/**
 * Safely extracts author ID from potentially nested data
 */
function safeAuthorId(value: unknown): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>;
        if (obj.id) return String(obj.id);
        if (obj.uid) return String(obj.uid);
    }
    return undefined;
}

/**
 * Hook to fetch live author information
 * Falls back to provided values while loading or if fetch fails
 * 
 * @param authorId - The author's user ID (can be string or object)
 * @param fallbackName - Fallback name (stored at creation time)
 * @param fallbackAvatar - Fallback avatar (stored at creation time)
 * @returns Live author info with loading state
 */
export function useAuthorInfo(
    authorId: string | object | undefined,
    fallbackName: string | object = 'Usuario',
    fallbackAvatar: string | object = ''
): AuthorInfo {
    // Normalize inputs once using useMemo to prevent unnecessary re-renders
    // Extract stable string representations for dependency comparison
    const authorIdStr = typeof authorId === 'string' ? authorId : JSON.stringify(authorId);
    const fallbackNameStr = typeof fallbackName === 'string' ? fallbackName : JSON.stringify(fallbackName);
    const fallbackAvatarStr = typeof fallbackAvatar === 'string' ? fallbackAvatar : JSON.stringify(fallbackAvatar);

    const normalizedData = useMemo(() => ({
        id: safeAuthorId(authorId),
        name: safeString(fallbackName, 'Usuario'),
        avatar: safeString(fallbackAvatar, '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [authorIdStr, fallbackNameStr, fallbackAvatarStr]);

    const [authorInfo, setAuthorInfo] = useState<AuthorInfo>({
        authorName: normalizedData.name,
        authorAvatar: normalizedData.avatar,
        authorId: normalizedData.id || '',
        loading: !!normalizedData.id // Only loading if we have an ID to fetch
    });

    useEffect(() => {
        const { id, name, avatar } = normalizedData;

        // Skip if no authorId
        if (!id) {
            setAuthorInfo({
                authorName: name,
                authorAvatar: avatar,
                authorId: '',
                loading: false
            });
            return;
        }

        const fetchAuthor = async () => {
            try {
                const userProfile = await usersService.getUserProfile(id);

                if (userProfile) {
                    setAuthorInfo({
                        authorName: userProfile.name || name,
                        authorUsername: userProfile.username,
                        authorAvatar: userProfile.avatar || avatar,
                        authorId: id,
                        loading: false
                    });
                } else {
                    // User not found, use fallbacks
                    setAuthorInfo({
                        authorName: name,
                        authorAvatar: avatar,
                        authorId: id,
                        loading: false
                    });
                }
            } catch (error) {
                console.error('Error fetching author info:', error);
                // On error, use fallbacks
                setAuthorInfo({
                    authorName: name,
                    authorAvatar: avatar,
                    authorId: id,
                    loading: false
                });
            }
        };

        fetchAuthor();
    }, [normalizedData]);

    return authorInfo;
}


/**
 * Batch hook for fetching multiple authors at once
 * Useful for lists of articles/projects
 * Uses caching to avoid duplicate requests
 */
const authorCache = new Map<string, { name: string; avatar: string; username?: string }>();

export function useAuthorsInfo(
    authorIds: string[]
): Map<string, { name: string; avatar: string; username?: string; loading: boolean }> {
    const [authorsMap, setAuthorsMap] = useState<Map<string, { name: string; avatar: string; username?: string; loading: boolean }>>(new Map());

    useEffect(() => {
        const fetchAuthors = async () => {
            const uniqueIds = [...new Set(authorIds.filter(id => id && !authorCache.has(id)))];

            if (uniqueIds.length === 0) {
                // All cached, build result from cache
                const result = new Map<string, { name: string; avatar: string; username?: string; loading: boolean }>();
                authorIds.forEach(id => {
                    const cached = authorCache.get(id);
                    if (cached) {
                        result.set(id, { ...cached, loading: false });
                    }
                });
                setAuthorsMap(result);
                return;
            }

            // Fetch uncached authors
            await Promise.all(uniqueIds.map(async (id) => {
                try {
                    const profile = await usersService.getUserProfile(id);
                    if (profile) {
                        authorCache.set(id, {
                            name: profile.name || 'Usuario',
                            avatar: profile.avatar || '',
                            username: profile.username
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching author ${id}:`, error);
                }
            }));

            // Build result with all authors
            const result = new Map<string, { name: string; avatar: string; username?: string; loading: boolean }>();
            authorIds.forEach(id => {
                const cached = authorCache.get(id);
                result.set(id, {
                    name: cached?.name || 'Usuario',
                    avatar: cached?.avatar || '',
                    username: cached?.username,
                    loading: false
                });
            });
            setAuthorsMap(result);
        };

        fetchAuthors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authorIds.join(',')]);

    return authorsMap;
}
