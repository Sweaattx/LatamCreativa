/**
 * Database Utilities (Supabase)
 * 
 * Utilidades comunes para operaciones de base de datos.
 * Incluye caché en memoria, helpers de paginación y mapeo de tipos.
 * 
 * @module services/supabase/utils
 */

import { PostgrestError } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { logger } from '../../utils/logger';

// ============================================================
// CACHÉ EN MEMORIA OPTIMIZADO
// ============================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const MAX_CACHE_SIZE = 500; // Límite máximo de entradas
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60 * 1000; // Limpiar cada minuto

/**
 * Limpia entradas expiradas del caché
 */
const cleanupExpired = (): void => {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key);
    }
  }
};

/**
 * Obtiene un valor del caché si existe y no ha expirado
 */
export const getFromCache = <T>(key: string): T | null => {
  cleanupExpired();

  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }

  return entry.data;
};

/**
 * Guarda un valor en el caché con TTL
 * @param key - Clave única
 * @param data - Datos a cachear
 * @param ttlMs - Time to live en milisegundos (default: 5 minutos)
 */
export const setInCache = <T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void => {
  // Evitar crecimiento excesivo del caché
  if (cache.size >= MAX_CACHE_SIZE) {
    // Eliminar las entradas más antiguas
    const entries = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 4));
    toDelete.forEach(([key]) => cache.delete(key));
  }

  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
};

/**
 * Invalida una entrada del caché
 */
export const invalidateCache = (key: string): void => {
  cache.delete(key);
};

/**
 * Invalida entradas del caché que coincidan con un patrón
 */
export const invalidateCachePattern = (pattern: string): void => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

/**
 * Limpia todo el caché
 */
export const clearCache = (): void => {
  cache.clear();
};

/**
 * Obtiene estadísticas del caché
 */
export const getCacheStats = () => ({
  size: cache.size,
  maxSize: MAX_CACHE_SIZE,
  keys: Array.from(cache.keys()),
});

// ============================================================
// TIPOS DE BASE DE DATOS
// ============================================================

// Type aliases for database operations
export type DbTables = Database['public']['Tables'];
export type ProjectInsert = DbTables['projects']['Insert'];
export type ProjectRow = DbTables['projects']['Row'];
export type ProjectUpdate = DbTables['projects']['Update'];
export type ArticleInsert = DbTables['articles']['Insert'];
export type ArticleRow = DbTables['articles']['Row'];
export type ArticleUpdate = DbTables['articles']['Update'];
export type ThreadInsert = DbTables['forum_threads']['Insert'];
export type ThreadRow = DbTables['forum_threads']['Row'];
export type ThreadUpdate = DbTables['forum_threads']['Update'];
export type ReplyInsert = DbTables['forum_replies']['Insert'];
export type ReplyRow = DbTables['forum_replies']['Row'];
export type LikeInsert = DbTables['likes']['Insert'];
export type UserRow = DbTables['users']['Row'];
export type UserUpdate = DbTables['users']['Update'];

// Helper for pagination
export interface PaginatedResult<T> {
  data: T[];
  lastId: string | null;
  hasMore: boolean;
}

// Helper for timeouts
export const withTimeout = <T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms))
  ]);
};

// Sanitize data to remove undefined values
export const sanitizeData = <T extends Record<string, unknown>>(data: T): Partial<T> => {
  const sanitized: Partial<T> = {};
  for (const key in data) {
    if (data[key] !== undefined) {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
};

/**
 * Convierte nombres de campo de camelCase a snake_case
 */
export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Convierte nombres de campo de snake_case a camelCase
 */
export const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Convierte un objeto de snake_case a camelCase
 */
export const snakeToCamelObject = <T extends Record<string, unknown>>(obj: T): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const camelKey = toCamelCase(key);
    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[camelKey] = snakeToCamelObject(value as Record<string, unknown>);
    } else {
      result[camelKey] = value;
    }
  }
  return result;
};

/**
 * Convierte un objeto de camelCase a snake_case
 */
export const camelToSnakeObject = <T extends Record<string, unknown>>(obj: T): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const snakeKey = toSnakeCase(key);
    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[snakeKey] = camelToSnakeObject(value as Record<string, unknown>);
    } else {
      result[snakeKey] = value;
    }
  }
  return result;
};

/**
 * Mapea campos comunes de la respuesta de DB a la estructura esperada por la app
 */
export const mapDbUserToUser = (dbUser: Record<string, unknown>): Record<string, unknown> => {
  return {
    id: dbUser.id,
    uid: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    username: dbUser.username,
    photoURL: dbUser.avatar,
    avatar: dbUser.avatar,
    coverImage: dbUser.cover_image,
    role: dbUser.role,
    location: dbUser.location,
    country: dbUser.country,
    city: dbUser.city,
    bio: dbUser.bio,
    skills: dbUser.skills,
    socialLinks: dbUser.social_links,
    isProfileComplete: dbUser.is_profile_complete,
    isAdmin: dbUser.is_admin,
    experience: dbUser.experience,
    education: dbUser.education,
    stats: dbUser.stats,
    availableForWork: dbUser.available_for_work,
    notificationPreferences: dbUser.notification_preferences,
    createdAt: dbUser.created_at,
  };
};

/**
 * Mapea campos de User de la app a la estructura de DB
 */
export const mapUserToDbUser = (user: Record<string, unknown>): Record<string, unknown> => {
  return {
    id: user.id || user.uid,
    email: user.email,
    name: user.name,
    first_name: user.firstName,
    last_name: user.lastName,
    username: user.username,
    avatar: user.avatar || user.photoURL,
    cover_image: user.coverImage,
    role: user.role,
    location: user.location,
    country: user.country,
    city: user.city,
    bio: user.bio,
    skills: user.skills,
    social_links: user.socialLinks,
    is_profile_complete: user.isProfileComplete,
    is_admin: user.isAdmin,
    experience: user.experience,
    education: user.education,
    stats: user.stats,
    available_for_work: user.availableForWork,
    notification_preferences: user.notificationPreferences,
  };
};

/**
 * Mapea proyecto de DB a la estructura de la app
 */
export const mapDbProjectToProject = (dbProject: Record<string, unknown>): Record<string, unknown> => {
  return {
    id: dbProject.id,
    slug: dbProject.slug,
    title: dbProject.title,
    description: dbProject.description,
    domain: dbProject.domain,
    authorId: dbProject.author_id,
    // Legacy artist field for backward compatibility
    artist: dbProject.artist_username || '',
    artistUsername: dbProject.artist_username,
    image: dbProject.image,
    images: dbProject.images,
    gallery: dbProject.gallery,
    tags: dbProject.tags,
    category: dbProject.category,
    tools: dbProject.tools,
    software: dbProject.tools, // Alias for software
    availableForWork: dbProject.available_for_work,
    status: dbProject.status,
    scheduledAt: dbProject.scheduled_at,
    views: dbProject.views ?? 0,
    likes: dbProject.likes ?? 0,
    stats: dbProject.stats,
    createdAt: dbProject.created_at,
    updatedAt: dbProject.updated_at,
  };
};

/**
 * Mapea artículo de DB a la estructura de la app
 */
export const mapDbArticleToArticle = (dbArticle: Record<string, unknown>): Record<string, unknown> => {
  return {
    id: dbArticle.id,
    slug: dbArticle.slug,
    title: dbArticle.title,
    content: dbArticle.content,
    excerpt: dbArticle.excerpt,
    image: dbArticle.image,
    category: dbArticle.category,
    tags: dbArticle.tags,
    authorId: dbArticle.author_id,
    author: dbArticle.author,
    authorAvatar: dbArticle.author_avatar,
    status: dbArticle.status,
    scheduledAt: dbArticle.scheduled_at,
    views: dbArticle.views,
    likes: dbArticle.likes,
    comments: dbArticle.comments_count,
    date: dbArticle.date,
    createdAt: dbArticle.created_at,
    updatedAt: dbArticle.updated_at,
  };
};

/**
 * Maneja errores de Supabase de forma consistente
 */
export const handleSupabaseError = (error: PostgrestError | null, context: string): never => {
  if (error) {
    logger.error(`Error in ${context}:`, error);
    throw new Error(error.message || `Error en ${context}`);
  }
  throw new Error(`Error desconocido en ${context}`);
};

/**
 * Genera un ID único
 */
export const generateId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const timestamp = Date.now().toString(36);
  let result = timestamp;
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
