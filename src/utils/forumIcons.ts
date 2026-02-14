/**
 * Forum Icon Map - Tree-shakeable icon imports
 * 
 * Este archivo provee un mapa de iconos específicos para el foro,
 * evitando el import wildcard de lucide-react que infla el bundle.
 * 
 * @module utils/forumIcons
 */

import { LucideIcon } from 'lucide-react';

// Importar solo los iconos necesarios para las categorías del foro
import {
    MessageSquare,
    HelpCircle,
    Lightbulb,
    BookOpen,
    Cuboid,
    MonitorPlay,
    Gamepad2,
    Palette,
    Code,
    Briefcase,
    Coffee
} from 'lucide-react';

/**
 * Mapa de iconos del foro - Solo incluye los iconos usados en FORUM_CATEGORIES
 */
export const FORUM_ICON_MAP: Record<string, LucideIcon> = {
    MessageSquare,
    HelpCircle,
    Lightbulb,
    BookOpen,
    Cuboid,
    MonitorPlay,
    Gamepad2,
    Palette,
    Code,
    Briefcase,
    Coffee
};

/**
 * Obtiene un componente de icono por nombre
 * @param iconName - Nombre del icono (e.g., 'MessageSquare')
 * @returns El componente LucideIcon o MessageSquare como fallback
 */
export function getForumIcon(iconName: string): LucideIcon {
    return FORUM_ICON_MAP[iconName] || MessageSquare;
}
