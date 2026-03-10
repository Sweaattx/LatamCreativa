import { supabase } from '../../lib/supabase';

export interface Job {
    id: string;
    title: string;
    company: string;
    company_logo: string | null;
    location: string;
    type: string;
    remote: boolean;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    salary_hourly: boolean;
    skills: string[];
    description: string | null;
    featured: boolean;
    applicants: number;
    status: string;
    posted_by: string | null;
    created_at: string;
}

export const jobsService = {
    async getAll(filters?: { type?: string; remote?: boolean; search?: string }): Promise<Job[]> {
        let query = (supabase as any).from('jobs').select('*').eq('status', 'active').order('featured', { ascending: false }).order('created_at', { ascending: false });

        if (filters?.type && filters.type !== 'Todos') query = query.eq('type', filters.type);
        if (filters?.remote) query = query.eq('remote', true);
        if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,company.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

        const { data, error } = await query;
        if (error) throw error;
        return (data as Job[]) || [];
    },

    async getById(id: string): Promise<Job | null> {
        const { data, error } = await (supabase as any).from('jobs').select('*').eq('id', id).single();
        if (error) return null;
        return data as Job;
    },

    async create(job: Omit<Job, 'id' | 'created_at' | 'applicants'>): Promise<Job> {
        const { data, error } = await (supabase as any).from('jobs').insert(job).select().single();
        if (error) throw error;
        return data as Job;
    },

    async apply(jobId: string, userId: string, message?: string) {
        const { error } = await (supabase as any).from('job_applications').insert({ job_id: jobId, applicant_id: userId, message });
        if (error) throw error;
    }
};
