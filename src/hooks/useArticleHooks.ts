/**
 * Article Hooks
 * Domain-specific hooks for blog article operations
 */

import { useState, useEffect } from 'react';
import { useAppStore } from './useAppStore';
import { ArticleItem, BlogComment } from '../types';
import { NAV_SECTIONS, NAV_SECTIONS_DEV } from '../data/navigation';
import { articlesService } from '../services/supabase/articles';
import { getErrorMessage } from '../utils/helpers';

// --- Hook for Blog Articles (Paged) ---
export const useArticles = () => {
    const { state, actions } = useAppStore();
    const { articles, pageStack, currentPage, hasMore, loading, lastId, sortOption } = state.blogState;
    const [error, setError] = useState<string | null>(null);

    const fetchPage = async (startAfterId: string | null) => {
        actions.setBlogState({ loading: true });
        setError(null);

        try {
            let sortField: 'date' | 'likes' = 'date';
            let sortDir: 'desc' | 'asc' = 'desc';

            if (sortOption === 'popular') {
                sortField = 'likes';
                sortDir = 'desc';
            } else if (sortOption === 'oldest') {
                sortField = 'date';
                sortDir = 'asc';
            }

            let result;
            const category = state.activeCategory;
            const isHome = category === 'Home' || category === 'Todas';
            const isTrending = category === 'Tendencias';
            const isNew = category === 'Nuevos';

            if (!isHome && !isTrending && !isNew) {
                const isTag = NAV_SECTIONS.some(section =>
                    section.items.some(item => item.subItems?.includes(category))
                ) || NAV_SECTIONS_DEV.some(section =>
                    section.items.some(item => item.subItems?.includes(category))
                );

                if (isTag) {
                    result = await articlesService.getArticlesByTag(category, startAfterId, 10);
                } else {
                    result = await articlesService.getArticlesByCategories([category], startAfterId, 10);
                }
            } else {
                result = await articlesService.getArticles(startAfterId, 10, sortField, sortDir);
            }

            actions.setBlogState({
                articles: result.data,
                lastId: result.lastId,
                hasMore: result.hasMore,
                loading: false
            });
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error loading articles'));
            actions.setBlogState({ loading: false });
        }
    };

    // Initial Load (only if empty)
    useEffect(() => {
        if (articles.length === 0 && !loading) {
            fetchPage(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [articles.length]);

    // Re-fetch when Sort Option changes
    useEffect(() => {
        if (!loading) {
            actions.setBlogState({
                pageStack: [],
                currentPage: 1,
                lastId: null,
                hasMore: true,
                articles: []
            });
            fetchPage(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortOption, state.activeCategory]);

    const nextPage = () => {
        if (!hasMore || loading) return;
        const currentStack = [...pageStack];
        if (lastId) currentStack.push(lastId);

        actions.setBlogState({
            pageStack: currentStack,
            currentPage: currentPage + 1
        });

        fetchPage(lastId);
    };

    const prevPage = () => {
        if (currentPage <= 1 || loading) return;
        const currentStack = [...pageStack];
        const newPage = currentPage - 1;

        let targetId: string | null = null;
        if (newPage > 1) {
            targetId = currentStack[newPage - 2];
        }

        const newStack = currentStack.slice(0, newPage - 1);

        actions.setBlogState({
            pageStack: newStack,
            currentPage: newPage
        });

        fetchPage(targetId);
    };

    return {
        articles,
        loading,
        error,
        hasMore,
        currentPage,
        nextPage,
        prevPage,
        loadMore: nextPage
    };
};

// --- Hook for Single Article (by slug or ID) ---
export const useArticle = (slugOrId: string | undefined) => {
    const [article, setArticle] = useState<ArticleItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slugOrId) return;

        const fetchArticle = async () => {
            setLoading(true);
            try {
                // Uses getArticleBySlug which tries slug first, then falls back to ID
                const data = await articlesService.getArticleBySlug(slugOrId);
                setArticle(data);
            } catch (err: unknown) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [slugOrId]);

    return { article, loading, error };
};

// --- Hook for Creating Article ---
export const useCreateArticle = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = async (data: Omit<ArticleItem, 'id'>, file?: File): Promise<{ id: string; slug: string }> => {
        setLoading(true);
        setError(null);
        try {
            const result = await articlesService.createArticle(data, file);
            return result; // { id, slug }
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { create, loading, error };
};

// --- Hook for Updating Article ---
export const useUpdateArticle = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = async (id: string, data: Partial<ArticleItem>, file?: File) => {
        setLoading(true);
        setError(null);
        try {
            await articlesService.updateArticle(id, data, file);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { update, loading, error };
};

// --- Hook for Deleting Article ---
export const useDeleteArticle = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deletePost = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await articlesService.deleteArticle(id);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { deletePost, loading, error };
};

// --- Hook for User Articles ---
export const useUserArticles = (authorName: string | undefined, authorId?: string | undefined) => {
    const [articles, setArticles] = useState<ArticleItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authorName && !authorId) return;

        const fetchArticles = async () => {
            setLoading(true);
            try {
                const data = await articlesService.getUserArticles(authorId || authorName || '');
                setArticles(data);
            } catch (err: unknown) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [authorName, authorId]);

    return { articles, loading, error };
};

// --- Hook for Recommended Articles ---
export const useRecommendedArticles = (currentArticleId: string) => {
    const [articles, setArticles] = useState<ArticleItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const result = await articlesService.getArticles(null, 4);
                const filtered = result.data
                    .filter(a => a.id !== currentArticleId)
                    .slice(0, 3);
                setArticles(filtered);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        if (currentArticleId) fetch();
    }, [currentArticleId]);

    return { articles, loading };
};

// --- Hook for Article Comments (Real-time subscription like Portfolio) ---
export const useComments = (articleId: string | undefined) => {
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!articleId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Real-time subscription - same pattern as useProjectComments
            const unsubscribe = articlesService.listenToComments(articleId, (newComments) => {
                // Map ArticleComment to BlogComment
                const mapped = newComments.map(c => ({
                    id: c.id,
                    text: c.content,
                    authorId: c.authorId,
                    authorName: c.authorName,
                    authorAvatar: c.authorAvatar || '',
                    likes: c.likes,
                    parentId: c.parentId,
                    createdAt: c.createdAt,
                    updatedAt: c.updatedAt
                }));
                setComments(mapped as unknown as BlogComment[]);
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            setLoading(false);
        }
    }, [articleId]);

    const removeComment = (commentId: string) => {
        setComments(prev => prev.filter(c => c.id !== commentId));
    };

    return { comments, loading, error, removeComment };
};

// --- Hook for Adding Comment ---
export const useAddComment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const add = async (articleId: string, commentData: { authorId: string; authorName: string; authorUsername?: string; authorAvatar: string; text: string; parentId?: string }) => {
        setLoading(true);
        setError(null);
        try {
            await articlesService.addComment(articleId, {
                content: commentData.text,
                authorId: commentData.authorId,
                authorName: commentData.authorName,
                authorAvatar: commentData.authorAvatar,
                parentId: commentData.parentId
            });
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { add, loading, error };
};


// --- Hook for Comment Actions ---
export const useCommentActions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleLike = async (articleId: string, commentId: string, userId: string): Promise<boolean> => {
        try {
            return await articlesService.toggleCommentLike(articleId, commentId, userId);
        } catch (err: unknown) {
            console.error(err);
            throw err;
        }
    };

    const update = async (articleId: string, commentId: string, content: string) => {
        setLoading(true);
        try {
            await articlesService.updateComment(articleId, commentId, content);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (articleId: string, commentId: string) => {
        setLoading(true);
        try {
            await articlesService.deleteComment(articleId, commentId);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { toggleLike, update, remove, loading, error };
};


// --- Hook for Article Like ---
export const useArticleLike = (articleId: string | undefined, userId: string | undefined) => {
    const [isLiked, setIsLiked] = useState(false);
    const [initialIsLiked, setInitialIsLiked] = useState(false);

    useEffect(() => {
        const checkLike = async () => {
            if (!articleId || !userId) return;
            const status = await articlesService.getArticleLikeStatus(articleId, userId);
            setIsLiked(status);
            setInitialIsLiked(status);
        };
        checkLike();
    }, [articleId, userId]);

    const toggleLike = async () => {
        if (!articleId || !userId) return;

        const previousState = isLiked;
        setIsLiked(!previousState);

        try {
            const newState = await articlesService.toggleArticleLike(articleId, userId);
            setIsLiked(newState);
        } catch (error) {
            console.error("Error toggling like:", error);
            setIsLiked(previousState);
        }
    };

    return { isLiked, initialIsLiked, toggleLike, loading: false };
};
