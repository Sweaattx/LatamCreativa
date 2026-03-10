import { supabase } from '../../lib/supabase';

export interface FreelancerProfile {
    id: string;
    user_id: string;
    title: string;
    location: string | null;
    hourly_rate: number | null;
    skills: string[];
    available: boolean;
    featured: boolean;
    rating: number;
    reviews_count: number;
    completed_projects: number;
    bio: string | null;
    portfolio_url: string | null;
    created_at: string;
    name?: string;
    avatar?: string;
}

export const freelancersService = {
    async getAll(filters?: { skill?: string; available?: boolean; search?: string }): Promise<FreelancerProfile[]> {
        let query = (supabase as any).from('freelancer_profiles').select('*').order('featured', { ascending: false }).order('rating', { ascending: false });

        if (filters?.available !== undefined) query = query.eq('available', filters.available);
        if (filters?.skill) query = query.contains('skills', [filters.skill]);
        if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);

        const { data, error } = await query;
        if (error) throw error;
        return (data as FreelancerProfile[]) || [];
    },

    async getByUserId(userId: string): Promise<FreelancerProfile | null> {
        const { data, error } = await (supabase as any).from('freelancer_profiles').select('*').eq('user_id', userId).single();
        if (error) return null;
        return data as FreelancerProfile;
    },

    async upsert(profile: Partial<FreelancerProfile> & { user_id: string }): Promise<FreelancerProfile> {
        const { data, error } = await (supabase as any).from('freelancer_profiles').upsert(profile, { onConflict: 'user_id' }).select().single();
        if (error) throw error;
        return data as FreelancerProfile;
    }
};
