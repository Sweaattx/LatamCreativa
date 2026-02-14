/**
 * Operaciones CRUD de Proyectos (Supabase)
 * 
 * Módulo que maneja las operaciones Create, Read, Update, Delete
 * para proyectos de portafolio almacenados en PostgreSQL.
 * 
 * @module services/supabase/projects/crud
 */
import { supabase } from '../../../lib/supabase';
import { storageService } from '../storage';
import { PortfolioItem } from '../../../types';
import { PaginatedResult, mapDbProjectToProject, ProjectInsert } from '../utils';
import { generateUniqueSlug } from '../../../utils/slugUtils';
import { Json } from '../../../types/database';

/** Tipo para items de galería en proyectos */
interface GalleryItem {
    type: 'image' | 'video' | 'youtube' | 'sketchfab';
    url: string;
    caption: string;
}

export const projectsCrud = {
    /**
     * Crea un nuevo proyecto con manejo robusto.
     * 
     * @param userId - ID del usuario que crea el proyecto
     * @param projectData - Datos parciales del proyecto
     * @param files - Archivos a subir (portada y galería)
     * @param uploadOptions - Opciones de subida
     * @returns Promise con el ID del proyecto creado
     */
    createProject: async (
        userId: string,
        projectData: Partial<PortfolioItem>,
        files: { cover?: File; gallery?: File[] },
        uploadOptions: {
            maxSizeMB: number;
            galleryMetadata?: { type: 'image' | 'video' | 'youtube' | 'sketchfab'; caption?: string; fileIndex?: number; url?: string }[];
            onProgress?: (progress: number) => void;
        }
    ): Promise<{ id: string; slug: string }> => {
        try {
            const totalOps = (files.cover ? 1 : 0) + (files.gallery?.length || 0) + 1;
            let completedOps = 0;
            const updateProgress = () => {
                completedOps++;
                if (uploadOptions.onProgress) uploadOptions.onProgress(Math.round((completedOps / totalOps) * 100));
            };

            // Generate unique slug and ID
            const slug = generateUniqueSlug(projectData.title || 'proyecto');
            
            // Upload Cover Image
            let coverUrl = '';
            if (files.cover) {
                const path = `projects/${userId}/${slug}/cover.jpg`;
                coverUrl = await storageService.uploadImage(files.cover, path, { maxSizeMB: uploadOptions.maxSizeMB });
                updateProgress();
            }

            // Upload Gallery Images
            const uploadedUrls: string[] = [];
            if (files.gallery && files.gallery.length > 0) {
                const uploadPromises = files.gallery.map(async (file, index) => {
                    const timestamp = Date.now();
                    const path = `projects/${userId}/${slug}/gallery/${timestamp}_${index}.jpg`;
                    const url = await storageService.uploadImage(file, path, { maxSizeMB: uploadOptions.maxSizeMB });
                    updateProgress();
                    return url;
                });
                uploadedUrls.push(...(await Promise.all(uploadPromises)));
            }

            // Prepare Gallery Objects
            let galleryObjects: GalleryItem[] = [];
            if (uploadOptions.galleryMetadata) {
                galleryObjects = uploadOptions.galleryMetadata.map(meta => {
                    if (meta.type === 'image' && meta.fileIndex !== undefined) {
                        return { type: 'image' as const, caption: meta.caption || '', url: uploadedUrls[meta.fileIndex] || '' };
                    } else if (meta.type === 'youtube' || meta.type === 'sketchfab') {
                        return { type: meta.type as 'youtube' | 'sketchfab', caption: meta.caption || '', url: meta.url || '' };
                    }
                    return null;
                }).filter(item => item !== null) as GalleryItem[];
            } else {
                galleryObjects = uploadedUrls.map(url => ({ type: 'image' as const, url, caption: '' }));
            }

            const legacyImages = galleryObjects.filter(item => item.type === 'image').map(item => item.url);

            // Fetch author availability
            const { data: authorDataRaw } = await supabase
                .from('users')
                .select('available_for_work, username')
                .eq('id', userId)
                .single();

            // Type cast for safe property access
            const authorData = authorDataRaw as Record<string, unknown> | null;
            const isAuthorAvailable = (authorData?.available_for_work as boolean) ?? false;
            const authorUsername = (authorData?.username as string) ?? null;

            // Create project document
            const projectInsert: ProjectInsert = {
                slug,
                title: projectData.title || '',
                description: projectData.description ?? null,
                domain: projectData.domain || 'creative',
                author_id: userId,
                image: coverUrl || projectData.image || null,
                images: legacyImages.length > 0 ? legacyImages : (projectData.images ?? null),
                gallery: galleryObjects as unknown as Json,
                tags: projectData.tags ?? null,
                category: projectData.category ?? null,
                tools: projectData.tools ?? null,
                available_for_work: isAuthorAvailable,
                artist_username: authorUsername || projectData.artistUsername || null,
                status: projectData.status || 'published',
                scheduled_at: projectData.scheduledAt ?? null,
                views: 0,
                likes: 0,
                stats: { viewCount: 0, likeCount: 0 } as unknown as Json,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: newProjectRaw, error } = await supabase
                .from('projects')
                .insert(projectInsert as never)
                .select('id, slug')
                .single();

            if (error) throw error;
            
            // Type cast for safe property access
            const newProject = newProjectRaw as { id: string; slug: string } | null;
            if (!newProject) throw new Error('Failed to create project');
            updateProgress();

            // Update user stats
            try {
                await supabase.rpc('increment_user_stat', { 
                    user_id: userId, 
                    stat_name: 'projects', 
                    amount: 1 
                } as never);
            } catch (rpcError) {
                console.warn('Could not update user stats:', rpcError);
            }

            return { id: newProject.id, slug: newProject.slug };
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    },

    /**
     * Actualiza un proyecto existente.
     * 
     * @param userId - ID del usuario propietario
     * @param projectId - ID del proyecto a actualizar
     * @param projectData - Datos a actualizar
     * @param files - Nuevos archivos a subir
     * @param uploadOptions - Opciones de subida
     */
    updateProject: async (
        userId: string,
        projectId: string,
        projectData: Partial<PortfolioItem>,
        files: { cover?: File; gallery?: File[] },
        uploadOptions: {
            maxSizeMB: number;
            galleryMetadata?: { type: 'image' | 'video' | 'youtube' | 'sketchfab'; caption?: string; fileIndex?: number; url?: string }[];
            onProgress?: (progress: number) => void;
        }
    ): Promise<void> => {
        try {
            const totalOps = (files.cover ? 1 : 0) + (files.gallery?.length || 0) + 1;
            let completedOps = 0;
            const updateProgress = () => {
                completedOps++;
                if (uploadOptions.onProgress) uploadOptions.onProgress(Math.round((completedOps / totalOps) * 100));
            };

            // Get existing project
            const { data: existingProject, error: fetchError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();

            if (fetchError) throw fetchError;
            if (!existingProject) throw new Error('Project not found');

            const oldCoverUrl = (existingProject as Record<string, unknown>).image as string || '';
            const slug = (existingProject as Record<string, unknown>).slug as string || projectId;

            // Upload Cover Image
            let coverUrl = projectData.image;
            if (files.cover) {
                if (oldCoverUrl) await storageService.deleteFromUrl(oldCoverUrl);
                const path = `projects/${userId}/${slug}/cover_${Date.now()}.jpg`;
                coverUrl = await storageService.uploadImage(files.cover, path, { maxSizeMB: uploadOptions.maxSizeMB });
                updateProgress();
            }

            // Upload new gallery images
            const uploadedUrls: string[] = [];
            if (files.gallery && files.gallery.length > 0) {
                const uploadPromises = files.gallery.map(async (file, index) => {
                    const timestamp = Date.now();
                    const path = `projects/${userId}/${slug}/gallery/${timestamp}_${index}.jpg`;
                    const url = await storageService.uploadImage(file, path, { maxSizeMB: uploadOptions.maxSizeMB });
                    updateProgress();
                    return url;
                });
                uploadedUrls.push(...(await Promise.all(uploadPromises)));
            }

            // Prepare Gallery Objects
            let galleryObjects: GalleryItem[] | undefined;
            if (uploadOptions.galleryMetadata) {
                galleryObjects = uploadOptions.galleryMetadata.map(meta => {
                    if (meta.type === 'image' && meta.fileIndex !== undefined) {
                        return { type: 'image' as const, caption: meta.caption || '', url: uploadedUrls[meta.fileIndex] || '' };
                    } else if (meta.type === 'image' && meta.url) {
                        return { type: 'image' as const, caption: meta.caption || '', url: meta.url };
                    } else if (meta.type === 'youtube' || meta.type === 'sketchfab') {
                        return { type: meta.type as 'youtube' | 'sketchfab', caption: meta.caption || '', url: meta.url || '' };
                    }
                    return null;
                }).filter(item => item !== null) as GalleryItem[];
            }

            const legacyImages = galleryObjects?.filter(item => item.type === 'image').map(item => item.url);

            // Build update object
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString()
            };

            if (projectData.title !== undefined) updateData.title = projectData.title;
            if (projectData.description !== undefined) updateData.description = projectData.description;
            if (projectData.category !== undefined) updateData.category = projectData.category;
            if (projectData.tags !== undefined) updateData.tags = projectData.tags;
            if (projectData.tools !== undefined) updateData.tools = projectData.tools;
            if (projectData.status !== undefined) updateData.status = projectData.status;
            if (projectData.scheduledAt !== undefined) updateData.scheduled_at = projectData.scheduledAt;
            if (coverUrl !== undefined) updateData.image = coverUrl;
            if (galleryObjects !== undefined) updateData.gallery = galleryObjects;
            if (legacyImages !== undefined) updateData.images = legacyImages;

             
            const { error } = await supabase
                .from('projects')
                .update(updateData as never)
                .eq('id', projectId);

            if (error) throw error;
            updateProgress();
        } catch (error) {
            console.error("Error updating project:", error);
            throw error;
        }
    },

    /**
     * Elimina un proyecto y todo su contenido.
     * 
     * @param projectId - ID del proyecto a eliminar
     * @param userId - ID del usuario propietario
     */
    deleteProject: async (projectId: string, userId: string): Promise<void> => {
        try {
            // Get project to find storage paths
            const { data: project, error: fetchError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();

            if (fetchError) throw fetchError;
            
            // Type cast for safe property access
            const projectData = project as Record<string, unknown> | null;

            // Delete storage files
            if (projectData?.image) {
                await storageService.deleteFromUrl(projectData.image as string);
            }
            if (projectData?.images && Array.isArray(projectData.images)) {
                for (const url of projectData.images as string[]) {
                    await storageService.deleteFromUrl(url);
                }
            }

            // Delete comments
            await supabase.from('comments').delete().eq('target_id', projectId).eq('target_type', 'project');

            // Delete likes
            await supabase.from('likes').delete().eq('target_id', projectId).eq('target_type', 'project');

            // Delete project
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) throw error;

            // Update user stats
            try {
                await supabase.rpc('increment_user_stat', { 
                    user_id: userId, 
                    stat_name: 'projects', 
                    amount: -1 
                } as never);
            } catch (rpcError) {
                console.warn('Could not update user stats:', rpcError);
            }

        } catch (error) {
            console.error("Error deleting project:", error);
            throw error;
        }
    },

    /**
     * Obtiene un proyecto por ID o slug.
     * 
     * @param identifier - ID o slug del proyecto
     * @returns Proyecto o null
     */
    getProject: async (identifier: string): Promise<PortfolioItem | null> => {
        try {
            // Try by ID first, then by slug
            let query = supabase.from('projects').select('*').eq('id', identifier);
            let { data, error } = await query.maybeSingle();

            if (!data) {
                query = supabase.from('projects').select('*').eq('slug', identifier);
                const result = await query.maybeSingle();
                data = result.data;
                error = result.error;
            }

            if (error) throw error;
            if (!data) return null;
            
            return mapDbProjectToProject(data as Record<string, unknown>) as unknown as PortfolioItem;
        } catch (error) {
            console.error("Error fetching project:", error);
            return null;
        }
    },

    /**
     * Obtiene proyectos paginados con filtros.
     * 
     * @param options - Opciones de consulta
     * @returns Resultado paginado
     */
    getProjects: async (options: {
        lastId?: string | null;
        pageSize?: number;
        category?: string;
        domain?: string;
        tags?: string[];
        sortBy?: 'date' | 'likes' | 'views';
        sortDirection?: 'asc' | 'desc';
        status?: string;
    } = {}): Promise<PaginatedResult<PortfolioItem>> => {
        try {
            const {
                lastId = null,
                pageSize = 12,
                category,
                domain,
                tags,
                sortBy = 'date',
                sortDirection = 'desc',
                status = 'published'
            } = options;

            let query = supabase
                .from('projects')
                .select('*')
                .eq('status', status);

            if (category) query = query.eq('category', category);
            if (domain) query = query.eq('domain', domain);
            if (tags && tags.length > 0) query = query.contains('tags', tags);

            // Sorting
            const sortColumn = sortBy === 'date' ? 'created_at' : sortBy;
            query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

            // Pagination using range
            if (lastId) {
                // Get the cursor project to know where to start
                const { data: cursorProject } = await supabase
                    .from('projects')
                    .select(sortColumn)
                    .eq('id', lastId)
                    .single();

                if (cursorProject) {
                    const cursorValue = cursorProject[sortColumn];
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

            return {
                data: items.map(p => mapDbProjectToProject(p as Record<string, unknown>) as unknown as PortfolioItem),
                lastId: (lastItem?.id as string) || null,
                hasMore
            };
        } catch (error) {
            console.error("Error fetching projects:", error);
            return { data: [], lastId: null, hasMore: false };
        }
    },

    /**
     * Obtiene proyectos de un usuario específico.
     * 
     * @param userId - ID del usuario
     * @param pageSize - Límite de resultados
     * @returns Array de proyectos
     */
    getUserProjects: async (userId: string, pageSize = 50): Promise<PortfolioItem[]> => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('author_id', userId)
                .order('created_at', { ascending: false })
                .limit(pageSize);

            if (error) throw error;
            return (data || []).map(p => mapDbProjectToProject(p as Record<string, unknown>) as unknown as PortfolioItem);
        } catch (error) {
            console.error("Error fetching user projects:", error);
            return [];
        }
    },

    /**
     * Incrementa las vistas de un proyecto.
     * 
     * @param projectId - ID del proyecto
     */
    incrementViews: async (projectId: string): Promise<void> => {
        try {
            await supabase.rpc('increment_project_views', { project_id: projectId } as never);
        } catch (error) {
            console.warn('Error incrementing views:', error);
        }
    }
};
