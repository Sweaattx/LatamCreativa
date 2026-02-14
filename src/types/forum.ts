/**
 * Forum Types - Threads, Replies, Categories, Reports
 * 
 * Definición de tipos TypeScript para el sistema de foro de LatamCreativa.
 * Incluye hilos de discusión, respuestas, categorías y moderación.
 * 
 * @module types/forum
 */

// ============================================
// THREAD (Hilo de discusión)
// ============================================
export interface ForumThread {
    id: string;
    slug: string;                    // URL-friendly slug para SEO
    title: string;
    content: string;                 // Contenido en Markdown
    excerpt?: string;                // Resumen para listados

    // Autor
    authorId: string;
    authorName: string;
    authorUsername?: string;
    authorAvatar?: string;
    authorRole?: string;             // Badge de rol profesional

    // Clasificación
    category: string;
    tags?: string[];                 // Opcional - no siempre presente

    // Estadísticas
    views: number;
    replies?: number;                // Alias de replyCount
    replyCount?: number;             // Conteo de respuestas
    likes: number;

    // Estado
    isPinned: boolean;               // Fijado arriba
    isClosed?: boolean;              // Alias de isLocked
    isLocked?: boolean;              // Cerrado a nuevas respuestas
    isResolved: boolean;             // Pregunta resuelta
    bestAnswerId?: string;           // ID de la mejor respuesta

    // Timestamps
    createdAt: string;               // ISO date string
    updatedAt?: string;              // Última edición del autor
    lastActivityAt: string;          // Última respuesta o actividad

    // Adjuntos opcionales
    attachments?: ForumAttachment[];
}

// ============================================
// REPLY (Respuesta a un hilo)
// ============================================
export interface ForumReply {
    id: string;
    threadId: string;
    content: string;                 // Contenido en Markdown

    // Autor
    authorId: string;
    authorName: string;
    authorUsername?: string;
    authorAvatar?: string;
    authorRole?: string;

    // Estado
    likes: number;
    isBestAnswer: boolean;
    parentId?: string;               // Para respuestas anidadas (1 nivel máximo)

    // Timestamps
    createdAt: string;
    updatedAt?: string;
    isEdited: boolean;

    // Adjuntos opcionales
    attachments?: ForumAttachment[];
}

// ============================================
// CATEGORY (Categoría del foro)
// ============================================
export interface ForumCategory {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;                    // Nombre del icono de Lucide
    color: string;                   // Color de acento (tailwind color name)
    order: number;                   // Orden de aparición

    // Estadísticas (calculadas)
    threadCount?: number;

    // Última actividad (opcional, para mostrar en listado)
    lastActivity?: {
        threadTitle: string;
        threadSlug: string;
        authorName: string;
        date: string;
    };
}

// ============================================
// ATTACHMENT (Adjunto)
// ============================================
export interface ForumAttachment {
    id: string;
    url: string;
    type: 'image' | 'file';
    name: string;
    size: number;                    // Bytes
    mimeType?: string;
}

// ============================================
// REPORT (Reporte de contenido)
// ============================================
export type ReportReason = 'spam' | 'offensive' | 'off-topic' | 'harassment' | 'other';

export interface ForumReport {
    id: string;
    targetType: 'thread' | 'reply';
    targetId: string;
    threadId: string;                // Para referencia
    reporterId: string;
    reporterName?: string;
    reason: ReportReason;
    description?: string;
    status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
}

// ============================================
// FORUM STATS (Estadísticas globales)
// ============================================
export interface ForumStats {
    totalThreads: number;
    totalReplies: number;
    totalUsers: number;
    activeToday: number;
}

// ============================================
// PAGINATED RESULT (Resultado paginado)
// ============================================
export interface ForumPaginatedResult<T> {
    items: T[];
    hasMore: boolean;
    lastDoc: unknown | null;         // QueryDocumentSnapshot para paginación
    total?: number;
}

// ============================================
// CREATE/UPDATE DTOs
// ============================================
export interface CreateThreadData {
    title: string;
    content: string;
    category: string;
    tags?: string[];
    attachments?: File[];
}

export interface UpdateThreadData {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
}

export interface CreateReplyData {
    content: string;
    parentId?: string;
    attachments?: File[];
}

export interface UpdateReplyData {
    content: string;
}

// ============================================
// SORT OPTIONS
// ============================================
export type ThreadSortOption = 'recent' | 'popular' | 'activity' | 'unanswered';
export type ReplySortOption = 'oldest' | 'newest' | 'likes';
