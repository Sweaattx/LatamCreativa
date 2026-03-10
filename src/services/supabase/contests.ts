import { supabase } from '../../lib/supabase';

export interface Contest {
    id: string;
    title: string;
    description: string | null;
    image: string | null;
    prize: string | null;
    deadline: string | null;
    category: string;
    status: string;
    featured: boolean;
    created_by: string | null;
    created_at: string;
    participants_count?: number;
}

export const contestsService = {
    async getAll(filters?: { category?: string; status?: string }): Promise<Contest[]> {
        let query = (supabase as any).from('contests').select('*, contest_participants(count)').order('featured', { ascending: false }).order('created_at', { ascending: false });

        if (filters?.category && filters.category !== 'Todos') query = query.eq('category', filters.category);
        if (filters?.status === 'active') query = query.eq('status', 'active');
        if (filters?.status === 'ended') query = query.eq('status', 'ended');

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((c: Record<string, unknown>) => ({
            ...c,
            participants_count: Array.isArray(c.contest_participants) && c.contest_participants.length > 0
                ? (c.contest_participants[0] as { count: number }).count
                : 0,
        })) as Contest[];
    },

    async getById(id: string): Promise<Contest | null> {
        const { data, error } = await (supabase as any).from('contests').select('*').eq('id', id).single();
        if (error) return null;
        return data as Contest;
    },

    async participate(contestId: string, userId: string) {
        const { error } = await (supabase as any).from('contest_participants').insert({ contest_id: contestId, user_id: userId });
        if (error) throw error;
    }
};
