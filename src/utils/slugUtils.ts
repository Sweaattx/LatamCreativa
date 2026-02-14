/**
 * Funciones Utilitarias de Slug
 * 
 * Crea slugs amigables para URLs a partir de texto para URLs SEO-friendly.
 * 
 * @module utils/slugUtils
 */

/**
 * Convierte una cadena de texto a un slug amigable para URLs.
 * 
 * @param text - El texto a convertir (ej. título del artículo)
 * @returns Slug en minúsculas con guiones (ej. "mi-articulo-genial")
 * 
 * @example
 * generateSlug("Mi Artículo Genial") // "mi-articulo-genial"
 * generateSlug("3D Art: Diseño & Modelado") // "3d-art-diseno-modelado"
 */
export const generateSlug = (text: string): string => {
    if (!text) return '';

    return text
        .normalize('NFD')                          // Descomponer caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '')           // Remover marcas de acento
        .toLowerCase()                             // Convertir a minúsculas
        .trim()                                    // Remover espacios al inicio/final
        .replace(/[^a-z0-9\s-]/g, '')             // Remover caracteres especiales
        .replace(/\s+/g, '-')                      // Reemplazar espacios con guiones
        .replace(/-+/g, '-')                       // Reemplazar guiones múltiples con uno
        .replace(/^-+|-+$/g, '');                  // Remover guiones al inicio/final
};

/**
 * Genera un slug único agregando un sufijo aleatorio corto.
 * Útil para evitar colisiones cuando múltiples items tienen títulos similares.
 * 
 * @param text - El texto a convertir
 * @returns Slug con sufijo único (ej. "mi-articulo-a1b2c3")
 */
export const generateUniqueSlug = (text: string): string => {
    const baseSlug = generateSlug(text);
    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${uniqueSuffix}`;
};

/**
 * Valida si una cadena tiene formato de slug válido.
 * 
 * @param slug - El slug a validar
 * @returns True si es un formato de slug válido
 */
export const isValidSlug = (slug: string): boolean => {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};
