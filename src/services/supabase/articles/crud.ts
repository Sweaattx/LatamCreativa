/**
 * Operaciones CRUD de Artículos (Supabase)
 * 
 * Módulo que maneja las operaciones Create, Read, Update, Delete
 * para artículos del blog almacenados en PostgreSQL.
 * 
 * Optimizaciones:
 * - Caché en memoria para consultas frecuentes
 * - Timeouts configurables
 * - Manejo robusto de errores
 * 
 * @module services/supabase/articles/crud
 */
import { supabase } from '../../../lib/supabase';
import { storageService } from '../storage';
import { ArticleItem } from '../../../types';
import { 
    PaginatedResult, 
    mapDbArticleToArticle, 
    withTimeout, 
    ArticleInsert,
    getFromCache,
    setInCache,
    invalidateCachePattern
} from '../utils';
import { notificationsService } from '../notifications';
import { usersSocial } from '../users/social';
import { generateUniqueSlug } from '../../../utils/slugUtils';

// Constantes de configuración
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

export const articlesCrud = {
    /**
     * Obtiene artículos paginados.
     * 
     * @param lastId - Último ID de la página anterior
     * @param pageSize - Cantidad de artículos por página
     * @param sortField - Campo para ordenar
     * @param sortDirection - Dirección del ordenamiento
     * @returns Resultado paginado
     */
    getArticles: async (
        lastId: string | null = null,
        pageSize = 10,
        sortField: 'date' | 'likes' = 'date',
        sortDirection: 'desc' | 'asc' = 'desc'
    ): Promise<PaginatedResult<ArticleItem>> => {
        // Intentar obtener del caché (solo primera página)
        const cacheKey = `articles:${sortField}:${sortDirection}:${pageSize}:${lastId || 'first'}`;
        if (!lastId) {
            const cached = getFromCache<PaginatedResult<ArticleItem>>(cacheKey);
            if (cached) return cached;
        }

        try {
            const sortColumn = sortField === 'date' ? 'created_at' : sortField;

            let query = supabase
                .from('articles')
                .select('*')
                .eq('status', 'published')
                .order(sortColumn, { ascending: sortDirection === 'asc' });

            if (lastId) {
                const { data: cursorArticle } = await supabase
                    .from('articles')
                    .select(sortColumn)
                    .eq('id', lastId)
                    .single();

                if (cursorArticle) {
                    const cursorValue = cursorArticle[sortColumn];
                    if (sortDirection === 'desc') {
                        query = query.lt(sortColumn, cursorValue);
                    } else {
                        query = query.gt(sortColumn, cursorValue);
                    }
                }
            }

            query = query.limit(pageSize + 1);

            const { data, error } = await query;
            if (error) throw error;

            const hasMore = (data?.length || 0) > pageSize;
            const items = (data || []).slice(0, pageSize);
            const lastItem = items[items.length - 1] as Record<string, unknown> | undefined;

            const result: PaginatedResult<ArticleItem> = {
                data: items.map(a => mapDbArticleToArticle(a as Record<string, unknown>) as unknown as ArticleItem),
                lastId: (lastItem?.id as string) || null,
                hasMore
            };

            // Guardar en caché (solo primera página)
            if (!lastId) {
                setInCache(cacheKey, result, CACHE_TTL);
            }

            return result;
        } catch (error) {
            console.error("Error fetching articles:", error);
            throw error;
        }
    },

    /**
     * Crea un nuevo artículo.
     * 
     * @param articleData - Datos del artículo
     * @param imageFile - Archivo de imagen de portada
     * @returns ID del artículo creado
     */
    createArticle: async (
        articleData: Omit<ArticleItem, 'id'>,
        imageFile?: File
    ): Promise<{ id: string; slug: string }> => {
        try {
            let imageUrl = articleData.image;
            const slug = generateUniqueSlug(articleData.title || 'articulo');

            if (imageFile) {
                try {
                    const imagePath = `articles/${Date.now()}_${slug}.jpg`;
                    imageUrl = await withTimeout(
                        storageService.uploadImage(imageFile, imagePath, { maxSizeMB: 5, compress: true }),
                        15000,
                        "Image upload timed out (15s). Please check your connection."
                    );
                } catch (uploadError) {
                    console.error("Error uploading image:", uploadError);
                }
            }

            const articleInsert: ArticleInsert = {
                slug,
                title: articleData.title,
                content: articleData.content || '',
                excerpt: articleData.excerpt ?? null,
                image: imageUrl ?? null,
                category: articleData.category ?? null,
                tags: articleData.tags ?? null,
                author_id: articleData.authorId,
                author: articleData.author ?? null,
                author_avatar: articleData.authorAvatar ?? null,
                status: articleData.status || 'published',
                scheduled_at: articleData.scheduledAt ?? null,
                views: 0,
                likes: 0,
                comments_count: 0,
                date: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: newArticleRaw, error } = await supabase
                .from('articles')
                .insert(articleInsert as never)
                .select('id, slug')
                .single();

            if (error) throw error;
            
            // Type cast for safe property access
            const newArticle = newArticleRaw as { id: string; slug: string } | null;
            if (!newArticle) throw new Error('Failed to create article');

            // Notify Followers
            try {
                if (articleData.authorId) {
                    const followers = await usersSocial.getFollowers(articleData.authorId);

                    for (const followerId of followers) {
                        await notificationsService.createNotification(followerId, {
                            type: 'system',
                            user_name: articleData.author || 'Usuario',
                            avatar: articleData.authorAvatar || null,
                            content: `publicó un nuevo artículo: "${articleData.title}"`,
                            category: articleData.category || null,
                            link: `/blog/${newArticle.slug}`,
                            read: false
                        });
                    }
                }
            } catch (notifError) {
                console.error("Error sending notifications:", notifError);
            }

            // Invalidar caché de artículos
            invalidateCachePattern('articles:');

            return { id: newArticle.id, slug: newArticle.slug };
        } catch (error) {
            console.error("Error creating article:", error);
            throw error;
        }
    },

    /**
     * Actualiza un artículo existente.
     * 
     * @param articleId - ID del artículo
     * @param articleData - Datos a actualizar
     * @param imageFile - Nueva imagen de portada
     */
    updateArticle: async (
        articleId: string,
        articleData: Partial<ArticleItem>,
        imageFile?: File
    ): Promise<void> => {
        try {
            let imageUrl = articleData.image;

            if (imageFile) {
                try {
                    const imagePath = `articles/${Date.now()}_${articleId}.jpg`;
                    imageUrl = await storageService.uploadImage(imageFile, imagePath, { maxSizeMB: 5, compress: true });
                } catch (uploadError) {
                    console.error("Error uploading new image:", uploadError);
                }
            }

            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString()
            };

            if (articleData.title !== undefined) updateData.title = articleData.title;
            if (articleData.content !== undefined) updateData.content = articleData.content;
            if (articleData.excerpt !== undefined) updateData.excerpt = articleData.excerpt;
            if (articleData.category !== undefined) updateData.category = articleData.category;
            if (articleData.tags !== undefined) updateData.tags = articleData.tags;
            if (articleData.status !== undefined) updateData.status = articleData.status;
            if (articleData.scheduledAt !== undefined) updateData.scheduled_at = articleData.scheduledAt;
            if (imageUrl !== undefined) updateData.image = imageUrl;

             
            const { error } = await supabase
                .from('articles')
                .update(updateData as never)
                .eq('id', articleId);

            if (error) throw error;
        } catch (error) {
            console.error("Error updating article:", error);
            throw error;
        }
    },

    /**
     * Elimina un artículo.
     * 
     * @param articleId - ID del artículo a eliminar
     */
    deleteArticle: async (articleId: string): Promise<void> => {
        try {
            // Get article to find image URL
            const { data: articleRaw } = await supabase
                .from('articles')
                .select('image, author_id')
                .eq('id', articleId)
                .single();

            // Type cast for safe property access
            const article = articleRaw as Record<string, unknown> | null;

            // Delete image from storage
            if (article?.image) {
                await storageService.deleteFromUrl(article.image as string);
            }

            // Delete comments
            await supabase.from('comments').delete().eq('target_id', articleId).eq('target_type', 'article');

            // Delete likes
            await supabase.from('likes').delete().eq('target_id', articleId).eq('target_type', 'article');

            // Delete article
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', articleId);

            if (error) throw error;
        } catch (error) {
            console.error("Error deleting article:", error);
            throw error;
        }
    },

    /**
     * Obtiene un artículo por ID o slug.
     * 
     * @param identifier - ID o slug del artículo
     * @returns Artículo o null
     */
    getArticle: async (identifier: string): Promise<ArticleItem | null> => {
        try {
            let query = supabase.from('articles').select('*').eq('id', identifier);
            let { data, error } = await query.maybeSingle();

            if (!data) {
                query = supabase.from('articles').select('*').eq('slug', identifier);
                const result = await query.maybeSingle();
                data = result.data;
                error = result.error;
            }

            if (error) throw error;
            if (!data) return null;
            
            return mapDbArticleToArticle(data as Record<string, unknown>) as unknown as ArticleItem;
        } catch (error) {
            console.error("Error fetching article:", error);
            return null;
        }
    },

    /**
     * Obtiene los artículos más recientes.
     * 
     * @param limitCount - Cantidad máxima
     * @returns Array de artículos
     */
    getRecentArticles: async (limitCount = 4): Promise<ArticleItem[]> => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('status', 'published')
                .order('date', { ascending: false })
                .limit(limitCount);

            if (error) throw error;
            return (data || []).map(a => mapDbArticleToArticle(a as Record<string, unknown>) as unknown as ArticleItem);
        } catch (error) {
            console.error("Error fetching recent articles:", error);
            return [];
        }
    },

    /**
     * Obtiene artículos de un usuario específico.
     * 
     * @param userId - ID del usuario
     * @param includeAll - Incluir borradores y programados
     * @returns Array de artículos
     */
    getUserArticles: async (userId: string, includeAll = false): Promise<ArticleItem[]> => {
        try {
            let query = supabase
                .from('articles')
                .select('*')
                .eq('author_id', userId)
                .order('date', { ascending: false });

            if (!includeAll) {
                query = query.eq('status', 'published');
            }

            const { data, error } = await query;
            if (error) throw error;
            return (data || []).map(a => mapDbArticleToArticle(a as Record<string, unknown>) as unknown as ArticleItem);
        } catch (error) {
            console.error("Error fetching user articles:", error);
            return [];
        }
    },

    /**
     * Obtiene artículos recomendados (excluyendo uno específico).
     * 
     * @param excludeId - ID del artículo a excluir
     * @param limitCount - Cantidad máxima
     * @returns Array de artículos
     */
    getRecommendedArticles: async (excludeId: string, limitCount = 4): Promise<ArticleItem[]> => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('status', 'published')
                .neq('id', excludeId)
                .order('views', { ascending: false })
                .limit(limitCount);

            if (error) throw error;
            return (data || []).map(a => mapDbArticleToArticle(a as Record<string, unknown>) as unknown as ArticleItem);
        } catch (error) {
            console.error("Error fetching recommended articles:", error);
            return [];
        }
    },

    /**
     * Incrementa las vistas de un artículo.
     * 
     * @param articleId - ID del artículo
     */
    incrementViews: async (articleId: string): Promise<void> => {
        try {
            await supabase.rpc('increment_article_views', { article_id: articleId } as never);
        } catch (error) {
            console.warn('Error incrementing views:', error);
        }
    },

    /**
     * Obtiene artículos por tag.
     * 
     * @param tag - Tag a buscar
     * @param lastId - Último ID para paginación
     * @param pageSize - Tamaño de página
     */
    getArticlesByTag: async (
        tag: string,
        lastId: string | null = null,
        pageSize = 10
    ): Promise<PaginatedResult<ArticleItem>> => {
        try {
            let query = supabase
                .from('articles')
                .select('*')
                .eq('status', 'published')
                .contains('tags', [tag])
                .order('created_at', { ascending: false });

            if (lastId) {
                const { data: cursor } = await supabase
                    .from('articles')
                    .select('created_at')
                    .eq('id', lastId)
                    .single();
                if (cursor) {
                    query = query.lt('created_at', (cursor as { created_at: string }).created_at);
                }
            }

            query = query.limit(pageSize + 1);
            const { data, error } = await query;
            if (error) throw error;

            const hasMore = (data?.length || 0) > pageSize;
            const items = (data || []).slice(0, pageSize);
            const lastItem = items[items.length - 1] as Record<string, unknown> | undefined;

            return {
                data: items.map(a => mapDbArticleToArticle(a as Record<string, unknown>) as unknown as ArticleItem),
                lastId: (lastItem?.id as string) || null,
                hasMore
            };
        } catch (error) {
            console.error("Error fetching articles by tag:", error);
            return { data: [], lastId: null, hasMore: false };
        }
    },

    /**
     * Obtiene artículos por categorías.
     * 
     * @param categories - Array de categorías
     * @param lastId - Último ID para paginación
     * @param pageSize - Tamaño de página
     */
    getArticlesByCategories: async (
        categories: string[],
        lastId: string | null = null,
        pageSize = 10
    ): Promise<PaginatedResult<ArticleItem>> => {
        try {
            let query = supabase
                .from('articles')
                .select('*')
                .eq('status', 'published')
                .in('category', categories)
                .order('created_at', { ascending: false });

            if (lastId) {
                const { data: cursor } = await supabase
                    .from('articles')
                    .select('created_at')
                    .eq('id', lastId)
                    .single();
                if (cursor) {
                    query = query.lt('created_at', (cursor as { created_at: string }).created_at);
                }
            }

            query = query.limit(pageSize + 1);
            const { data, error } = await query;
            if (error) throw error;

            const hasMore = (data?.length || 0) > pageSize;
            const items = (data || []).slice(0, pageSize);
            const lastItem = items[items.length - 1] as Record<string, unknown> | undefined;

            return {
                data: items.map(a => mapDbArticleToArticle(a as Record<string, unknown>) as unknown as ArticleItem),
                lastId: (lastItem?.id as string) || null,
                hasMore
            };
        } catch (error) {
            console.error("Error fetching articles by categories:", error);
            return { data: [], lastId: null, hasMore: false };
        }
    },

    /**
     * Obtiene un artículo por slug.
     * 
     * @param slug - Slug del artículo
     */
    getArticleBySlug: async (slug: string): Promise<ArticleItem | null> => {
        try {
            // Primero intentar por slug
            let { data } = await supabase
                .from('articles')
                .select('*')
                .eq('slug', slug)
                .maybeSingle();

            // Si no encuentra, intentar por ID
            if (!data) {
                const result = await supabase
                    .from('articles')
                    .select('*')
                    .eq('id', slug)
                    .maybeSingle();
                data = result.data;
            }

            if (!data) return null;
            return mapDbArticleToArticle(data as Record<string, unknown>) as unknown as ArticleItem;
        } catch (error) {
            console.error("Error fetching article by slug:", error);
            return null;
        }
    }
};
