import { supabase } from '../../lib/supabase';

export interface CollabProject {
    id: string;
    title: string;
    description: string | null;
    image: string | null;
    roles_needed: string[];
    members: number;
    max_members: number;
    deadline: string | null;
    category: string;
    status: string;
    author_id: string;
    created_at: string;
    author_name?: string;
    author_avatar?: string;
}

export const collabProjectsService = {
    async getAll(filters?: { category?: string; status?: string; search?: string }): Promise<CollabProject[]> {
        let query = (supabase as any).from('collaborative_projects').select('*').order('created_at', { ascending: false });

        if (filters?.category && filters.category !== 'Todos') query = query.eq('category', filters.category);
        if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
        if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

        const { data, error } = await query;
        if (error) throw error;
        return (data as CollabProject[]) || [];
    },

    async getById(id: string): Promise<CollabProject | null> {
        const { data, error } = await (supabase as any).from('collaborative_projects').select('*').eq('id', id).single();
        if (error) return null;
        return data as CollabProject;
    },

    async create(project: Omit<CollabProject, 'id' | 'created_at' | 'members'>): Promise<CollabProject> {
        const { data, error } = await (supabase as any).from('collaborative_projects').insert(project).select().single();
        if (error) throw error;
        return data as CollabProject;
    },

    async join(projectId: string, userId: string, role: string) {
        const { error } = await (supabase as any).from('collab_project_members').insert({ project_id: projectId, user_id: userId, role });
        if (error) throw error;
    }
};
