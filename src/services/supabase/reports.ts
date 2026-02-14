/**
 * Servicio de Reportes (Supabase)
 * 
 * Maneja la creación y gestión de reportes de contenido inapropiado.
 * 
 * @module services/supabase/reports
 */
import { supabase } from '../../lib/supabase';

interface DbReport {
    id: string;
    content_type: string;
    content_id: string;
    content_title: string | null;
    reporter_id: string;
    reporter_name: string;
    reason: string;
    description: string | null;
    status: string;
    created_at: string;
    reviewed_at: string | null;
    reviewed_by: string | null;
    notes: string | null;
}

export interface Report {
    id?: string;
    contentType: 'project' | 'article' | 'comment' | 'user';
    contentId: string;
    contentTitle?: string;
    reporterId: string;
    reporterName: string;
    reason: 'spam' | 'inappropriate' | 'harassment' | 'copyright' | 'other';
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    notes?: string;
}

export const reportsService = {
    /**
     * Crea un nuevo reporte de contenido.
     * 
     * @param report - Datos del reporte
     * @returns ID del reporte creado
     */
    createReport: async (report: Omit<Report, 'id' | 'status' | 'createdAt'>): Promise<string> => {
        try {
            const reportData = {
                content_type: report.contentType,
                content_id: report.contentId,
                content_title: report.contentTitle || null,
                reporter_id: report.reporterId,
                reporter_name: report.reporterName,
                reason: report.reason,
                description: report.description || null,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('reports')
                .insert(reportData as never)
                .select('id')
                .single();

            if (error) throw error;
            return (data as unknown as { id: string })?.id || '';
        } catch (error) {
            console.error('Error creating report:', error);
            throw error;
        }
    },

    /**
     * Obtiene todos los reportes pendientes (para admin).
     * 
     * @returns Array de reportes pendientes
     */
    getPendingReports: async (): Promise<Report[]> => {
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return ((data || []) as unknown as DbReport[]).map(row => ({
                id: row.id,
                contentType: row.content_type as Report['contentType'],
                contentId: row.content_id,
                contentTitle: row.content_title ?? undefined,
                reporterId: row.reporter_id,
                reporterName: row.reporter_name,
                reason: row.reason as Report['reason'],
                description: row.description ?? undefined,
                status: row.status as Report['status'],
                createdAt: row.created_at,
                reviewedAt: row.reviewed_at ?? undefined,
                reviewedBy: row.reviewed_by ?? undefined,
                notes: row.notes ?? undefined
            }));
        } catch (error) {
            console.error('Error fetching pending reports:', error);
            return [];
        }
    },

    /**
     * Obtiene todos los reportes (para admin).
     * 
     * @returns Array de todos los reportes
     */
    getAllReports: async (): Promise<Report[]> => {
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return ((data || []) as unknown as DbReport[]).map(row => ({
                id: row.id,
                contentType: row.content_type as Report['contentType'],
                contentId: row.content_id,
                contentTitle: row.content_title ?? undefined,
                reporterId: row.reporter_id,
                reporterName: row.reporter_name,
                reason: row.reason as Report['reason'],
                description: row.description ?? undefined,
                status: row.status as Report['status'],
                createdAt: row.created_at,
                reviewedAt: row.reviewed_at ?? undefined,
                reviewedBy: row.reviewed_by ?? undefined,
                notes: row.notes ?? undefined
            }));
        } catch (error) {
            console.error('Error fetching all reports:', error);
            return [];
        }
    },

    /**
     * Actualiza el estado de un reporte.
     * 
     * @param reportId - ID del reporte
     * @param status - Nuevo estado
     * @param reviewerId - ID del admin que revisa
     * @param notes - Notas opcionales
     */
    updateReportStatus: async (
        reportId: string,
        status: Report['status'],
        reviewerId: string,
        notes?: string
    ): Promise<void> => {
        try {
            const updateData: Record<string, unknown> = {
                status,
                reviewed_at: new Date().toISOString(),
                reviewed_by: reviewerId
            };

            if (notes) {
                updateData.notes = notes;
            }

            const { error } = await supabase
                .from('reports')
                .update(updateData as never)
                .eq('id', reportId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating report status:', error);
            throw error;
        }
    },

    /**
     * Verifica si un usuario ya reportó un contenido específico.
     * 
     * @param contentId - ID del contenido
     * @param reporterId - ID del usuario
     * @returns true si ya existe un reporte
     */
    hasUserReported: async (contentId: string, reporterId: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('id')
                .eq('content_id', contentId)
                .eq('reporter_id', reporterId)
                .limit(1);

            if (error) throw error;
            return (data?.length ?? 0) > 0;
        } catch (error) {
            console.error('Error checking existing report:', error);
            return false;
        }
    }
};
