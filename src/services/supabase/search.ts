/**
 * Servicio de Búsqueda Global (Supabase)
 * 
 * Proporciona búsqueda en tiempo real sobre proyectos, artículos y usuarios.
 * 
 * @module services/supabase/search
 */
import { supabase } from '../../lib/supabase';

interface DbProject {
    id: string;
    title: string;
    author_name: string | null;
    category: string | null;
    tags: string[] | null;
    software: string[] | null;
    description: string | null;
    images: string[] | null;
    image: string | null;
    slug: string | null;
}

interface DbArticle {
    id: string;
    title: string;
    author: string | null;
    category: string | null;
    tags: string[] | null;
    excerpt: string | null;
    image: string | null;
    slug: string | null;
}

interface DbUser {
    id: string;
    name: string | null;
    username: string | null;
    role: string | null;
    profession: string | null;
    skills: string[] | null;
    avatar: string | null;
}

export interface SearchResult {
    id: string;
    type: 'project' | 'article' | 'user';
    title: string;
    subtitle?: string;
    image?: string;
    slug?: string;
    username?: string;
}

export interface SearchFilters {
    type?: 'project' | 'article' | 'user' | 'all';
    maxResults?: number;
}

const DEFAULT_MAX_RESULTS = 8;

/**
 * Normaliza un string para búsqueda (minúsculas, sin acentos, etc)
 */
const normalizeSearch = (text: string): string => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
};

/**
 * Busca en proyectos por título, autor, categoría, tags y software/programas
 */
const searchProjects = async (searchTerm: string, maxResults: number): Promise<SearchResult[]> => {
    try {
        const normalizedTerm = normalizeSearch(searchTerm);

        const { data, error } = await supabase
            .from('projects')
            .select('id, title, author_name, category, tags, software, description, images, image, slug')
            .eq('status', 'published')
            .limit(100);

        if (error) throw error;

        const results: SearchResult[] = [];
        const projects = (data || []) as unknown as DbProject[];

        projects.forEach(project => {
            const title = project.title || '';
            const normalizedTitle = normalizeSearch(title);
            const authorName = normalizeSearch(project.author_name || '');
            const category = normalizeSearch(project.category || '');
            const tags = (project.tags || []).map((t: string) => normalizeSearch(t));
            const software = (project.software || []).map((s: string) => normalizeSearch(s));
            const description = normalizeSearch(project.description || '');

            const matchesTitle = normalizedTitle.includes(normalizedTerm);
            const matchesAuthor = authorName.includes(normalizedTerm);
            const matchesCategory = category.includes(normalizedTerm);
            const matchesTags = tags.some((tag: string) => tag.includes(normalizedTerm));
            const matchesSoftware = software.some((sw: string) => sw.includes(normalizedTerm));
            const matchesDescription = description.includes(normalizedTerm);

            if (matchesTitle || matchesAuthor || matchesCategory || matchesTags || matchesSoftware || matchesDescription) {
                let subtitle = `por ${project.author_name || 'Anónimo'}`;
                if (matchesSoftware && project.software) {
                    const matchedSw = project.software.find((s: string) => normalizeSearch(s).includes(normalizedTerm));
                    if (matchedSw) subtitle += ` • ${matchedSw}`;
                } else if (project.category) {
                    subtitle += ` • ${project.category}`;
                }

                results.push({
                    id: project.id,
                    type: 'project',
                    title: title,
                    subtitle,
                    image: project.images?.[0] || project.image || undefined,
                    slug: project.slug || undefined
                });
            }
        });

        return results.slice(0, maxResults);
    } catch (error) {
        console.error('Error searching projects:', error);
        return [];
    }
};

/**
 * Busca en artículos por título, autor, categoría, tags y contenido
 */
const searchArticles = async (searchTerm: string, maxResults: number): Promise<SearchResult[]> => {
    try {
        const normalizedTerm = normalizeSearch(searchTerm);

        const { data, error } = await supabase
            .from('articles')
            .select('id, title, author, category, tags, excerpt, image, slug')
            .eq('status', 'published')
            .limit(100);

        if (error) throw error;

        const results: SearchResult[] = [];
        const articles = (data || []) as unknown as DbArticle[];

        articles.forEach(article => {
            const title = article.title || '';
            const normalizedTitle = normalizeSearch(title);
            const authorName = normalizeSearch(article.author || '');
            const category = normalizeSearch(article.category || '');
            const tags = (article.tags || []).map((t: string) => normalizeSearch(t));
            const excerpt = normalizeSearch(article.excerpt || '');

            const matchesTitle = normalizedTitle.includes(normalizedTerm);
            const matchesAuthor = authorName.includes(normalizedTerm);
            const matchesCategory = category.includes(normalizedTerm);
            const matchesTags = tags.some((tag: string) => tag.includes(normalizedTerm));
            const matchesExcerpt = excerpt.includes(normalizedTerm);

            if (matchesTitle || matchesAuthor || matchesCategory || matchesTags || matchesExcerpt) {
                let subtitle = `por ${article.author || 'Anónimo'}`;
                if (matchesTags && article.tags) {
                    const matchedTag = article.tags.find((t: string) => normalizeSearch(t).includes(normalizedTerm));
                    if (matchedTag) subtitle += ` • #${matchedTag}`;
                } else if (article.category) {
                    subtitle += ` • ${article.category}`;
                }

                results.push({
                    id: article.id,
                    type: 'article',
                    title: title,
                    subtitle,
                    image: article.image || undefined,
                    slug: article.slug || undefined
                });
            }
        });

        return results.slice(0, maxResults);
    } catch (error) {
        console.error('Error searching articles:', error);
        return [];
    }
};

/**
 * Busca en usuarios por nombre o username
 */
const searchUsers = async (searchTerm: string, maxResults: number): Promise<SearchResult[]> => {
    try {
        const normalizedTerm = normalizeSearch(searchTerm);

        const { data, error } = await supabase
            .from('users')
            .select('id, name, username, role, profession, skills, avatar')
            .limit(100);

        if (error) throw error;

        const results: SearchResult[] = [];
        const users = (data || []) as unknown as DbUser[];

        users.forEach(user => {
            const name = user.name || '';
            const username = user.username || '';
            const normalizedName = normalizeSearch(name);
            const normalizedUsername = normalizeSearch(username);
            const role = normalizeSearch(user.role || user.profession || '');
            const skills = (user.skills || []).map((s: string) => normalizeSearch(s));

            if (
                normalizedName.includes(normalizedTerm) ||
                normalizedUsername.includes(normalizedTerm) ||
                role.includes(normalizedTerm) ||
                skills.some((skill: string) => skill.includes(normalizedTerm))
            ) {
                let subtitle = `@${username || user.id.slice(0, 8)}`;
                const matchingSkill = skills.find((skill: string) => skill.includes(normalizedTerm));
                if (matchingSkill && user.skills) {
                    const originalSkill = user.skills.find((s: string) => normalizeSearch(s).includes(normalizedTerm));
                    subtitle += originalSkill ? ` • Experto en ${originalSkill}` : ` • ${user.role || user.profession || 'Usuario'}`;
                } else {
                    subtitle += ` • ${user.role || user.profession || 'Usuario'}`;
                }

                results.push({
                    id: user.id,
                    type: 'user',
                    title: name,
                    subtitle,
                    image: user.avatar || undefined,
                    username: username || user.id
                });
            }
        });

        return results.slice(0, maxResults);
    } catch (error) {
        console.error('Error searching users:', error);
        return [];
    }
};

/**
 * Búsqueda global que combina resultados de proyectos, artículos y usuarios
 * OPTIMIZADO: Ejecuta las búsquedas en PARALELO para mayor velocidad
 */
export const globalSearch = async (
    searchTerm: string,
    filters: SearchFilters = {}
): Promise<SearchResult[]> => {
    if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
    }

    const { type = 'all', maxResults = DEFAULT_MAX_RESULTS } = filters;
    const perTypeLimit = Math.ceil(maxResults / 3);

    try {
        if (type !== 'all') {
            switch (type) {
                case 'project':
                    return await searchProjects(searchTerm, maxResults);
                case 'article':
                    return await searchArticles(searchTerm, maxResults);
                case 'user':
                    return await searchUsers(searchTerm, maxResults);
                default:
                    return [];
            }
        }

        // PARALELO: Ejecutar las tres búsquedas simultáneamente
        const [projects, articles, users] = await Promise.all([
            searchProjects(searchTerm, perTypeLimit),
            searchArticles(searchTerm, perTypeLimit),
            searchUsers(searchTerm, perTypeLimit)
        ]);

        const results = [...projects, ...articles, ...users];
        return results.slice(0, maxResults);
    } catch (error) {
        console.error('Error in global search:', error);
        return [];
    }
};

export const searchService = {
    search: globalSearch,
    searchProjects,
    searchArticles,
    searchUsers
};
