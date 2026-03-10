import { supabase } from '../../lib/supabase';

export interface Course {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    instructor_id: string | null;
    instructor_name: string;
    instructor_avatar: string | null;
    image: string | null;
    category: string;
    level: string;
    duration: string | null;
    lessons: number;
    students: number;
    rating: number;
    price: number;
    original_price: number | null;
    featured: boolean;
    tags: string[];
    status: string;
    created_at: string;
}

export const coursesService = {
    async getAll(filters?: { category?: string; level?: string; search?: string }): Promise<Course[]> {
        let query = (supabase as any).from('courses').select('*').eq('status', 'published').order('featured', { ascending: false }).order('students', { ascending: false });

        if (filters?.category && filters.category !== 'Todos') query = query.eq('category', filters.category);
        if (filters?.level && filters.level !== 'Todos') query = query.eq('level', filters.level);
        if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

        const { data, error } = await query;
        if (error) throw error;
        return (data as Course[]) || [];
    },

    async getBySlug(slug: string): Promise<Course | null> {
        const { data, error } = await (supabase as any).from('courses').select('*').eq('slug', slug).single();
        if (error) return null;
        return data as Course;
    },

    async enroll(courseId: string, studentId: string) {
        const { error } = await (supabase as any).from('course_enrollments').insert({ course_id: courseId, student_id: studentId });
        if (error) throw error;
    },

    async getEnrollments(studentId: string) {
        const { data, error } = await (supabase as any).from('course_enrollments').select('*, courses(*)').eq('student_id', studentId);
        if (error) throw error;
        return data || [];
    }
};
