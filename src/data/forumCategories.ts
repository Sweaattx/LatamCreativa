/**
 * Forum Categories Configuration
 * 
 * Categorías predefinidas para el foro de LatamCreativa.
 * Organizadas por tipo: General, Disciplinas Creativas, y Profesional.
 * 
 * @module data/forumCategories
 */

import { ForumCategory } from '../types/forum';

// ============================================
// FORUM CATEGORIES
// ============================================
export const FORUM_CATEGORIES: Omit<ForumCategory, 'threadCount' | 'lastActivity'>[] = [
    // --- General ---
    {
        id: 'general',
        name: 'General',
        slug: 'general',
        description: 'Discusiones generales sobre la industria creativa latinoamericana',
        icon: 'MessageSquare',
        color: 'blue',
        order: 1
    },
    {
        id: 'ayuda',
        name: 'Ayuda & Soporte',
        slug: 'ayuda',
        description: 'Preguntas técnicas, dudas y solicitudes de ayuda',
        icon: 'HelpCircle',
        color: 'amber',
        order: 2
    },
    {
        id: 'feedback',
        name: 'Crítica y Opiniones',
        slug: 'feedback',
        description: 'Solicita opiniones constructivas sobre tu trabajo',
        icon: 'Lightbulb',
        color: 'amber',
        order: 3
    },
    {
        id: 'recursos',
        name: 'Recursos & Tutoriales',
        slug: 'recursos',
        description: 'Comparte y descubre recursos, tutoriales y herramientas',
        icon: 'BookOpen',
        color: 'teal',
        order: 4
    },

    // --- Disciplinas Creativas ---
    {
        id: '3d-cgi',
        name: '3D & CGI',
        slug: '3d-cgi',
        description: 'Modelado, texturizado, renderizado, VFX y todo lo relacionado con 3D',
        icon: 'Cuboid',
        color: 'cyan',
        order: 5
    },
    {
        id: 'animacion',
        name: 'Animación',
        slug: 'animacion',
        description: 'Animación 2D, 3D, motion graphics y rigging',
        icon: 'MonitorPlay',
        color: 'green',
        order: 6
    },
    {
        id: 'game-dev',
        name: 'Desarrollo de Juegos',
        slug: 'game-dev',
        description: 'Desarrollo de videojuegos, game art, level design',
        icon: 'Gamepad2',
        color: 'red',
        order: 7
    },
    {
        id: 'arte-2d',
        name: 'Arte 2D',
        slug: 'arte-2d',
        description: 'Ilustración, concept art, diseño gráfico y arte digital',
        icon: 'Palette',
        color: 'pink',
        order: 8
    },
    {
        id: 'programacion',
        name: 'Programación',
        slug: 'programacion',
        description: 'Código, scripts, herramientas técnicas para creativos',
        icon: 'Code',
        color: 'emerald',
        order: 9
    },

    // --- Profesional ---
    {
        id: 'carrera',
        name: 'Carrera Profesional',
        slug: 'carrera',
        description: 'Reseñas de portafolio, consejos de carrera, freelancing, entrevistas',
        icon: 'Briefcase',
        color: 'amber',
        order: 10
    },
    {
        id: 'off-topic',
        name: 'Otros Temas',
        slug: 'off-topic',
        description: 'Conversaciones casuales, memes y temas no relacionados',
        icon: 'Coffee',
        color: 'slate',
        order: 11
    }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Obtiene una categoría por su ID
 */
export function getCategoryById(id: string): Omit<ForumCategory, 'threadCount' | 'lastActivity'> | undefined {
    return FORUM_CATEGORIES.find(cat => cat.id === id);
}

/**
 * Obtiene una categoría por su slug
 */
export function getCategoryBySlug(slug: string): Omit<ForumCategory, 'threadCount' | 'lastActivity'> | undefined {
    return FORUM_CATEGORIES.find(cat => cat.slug === slug);
}

/**
 * Obtiene el color de una categoría
 */
export function getCategoryColor(categoryId: string): string {
    const category = getCategoryById(categoryId);
    return category?.color || 'gray';
}

/**
 * Obtiene el icono de una categoría
 */
export function getCategoryIcon(categoryId: string): string {
    const category = getCategoryById(categoryId);
    return category?.icon || 'MessageSquare';
}

// ============================================
// CATEGORY COLORS MAP (para estilos CSS)
// ============================================
export const CATEGORY_COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
    slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
    gray: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' }
};
