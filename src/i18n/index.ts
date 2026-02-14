/**
 * Internationalization Configuration
 * 
 * Simple i18n setup without external dependencies
 * Supports Spanish (default) and English
 * 
 * @module i18n
 */

import esMessages from './messages/es.json';
import enMessages from './messages/en.json';

export type Locale = 'es' | 'en';
export type TranslationKey = string;

const messages: Record<Locale, typeof esMessages> = {
    es: esMessages,
    en: enMessages,
};

// Default locale
let currentLocale: Locale = 'es';

/**
 * Set the current locale
 */
export function setLocale(locale: Locale): void {
    if (messages[locale]) {
        currentLocale = locale;
        // Store in localStorage for persistence
        if (typeof window !== 'undefined') {
            localStorage.setItem('locale', locale);
        }
    }
}

/**
 * Get the current locale
 */
export function getLocale(): Locale {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('locale') as Locale | null;
        if (stored && messages[stored]) {
            currentLocale = stored;
        }
    }
    return currentLocale;
}

/**
 * Get a translation by key path (with caching)
 * @param key - Dot-notation key path (e.g., 'common.loading')
 * @param params - Optional parameters for interpolation
 * @returns Translated string
 */

// Translation cache for performance
const translationCache = new Map<string, string>();

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
    // Check cache first (only for non-parameterized calls)
    const cacheKey = `${currentLocale}:${key}`;
    if (!params && translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey)!;
    }

    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = messages[currentLocale];

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            // Fallback to key if translation not found
            console.warn(`Translation not found: ${key}`);
            return key;
        }
    }

    if (typeof value !== 'string') {
        return key;
    }

    // Cache the result (only for non-parameterized calls)
    if (!params) {
        translationCache.set(cacheKey, value);
    }

    // Simple interpolation: replace {param} with value
    if (params) {
        return value.replace(/\{(\w+)\}/g, (_, param) =>
            String(params[param] ?? `{${param}}`)
        );
    }

    return value;
}

/**
 * Clear translation cache (call when locale changes)
 */
export function clearTranslationCache(): void {
    translationCache.clear();
}

/**
 * Get all messages for the current locale
 */
export function getMessages(): typeof esMessages {
    return messages[currentLocale];
}

/**
 * Available locales
 */
export const availableLocales: { code: Locale; name: string }[] = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
];
