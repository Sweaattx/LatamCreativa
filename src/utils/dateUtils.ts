/**
 * Date Utilities
 * 
 * Consistent date formatting functions for the application.
 * Supports Spanish locale by default.
 * 
 * @module utils/dateUtils
 */

type DateInput = Date | string | number;

/**
 * Parse date input to Date object
 */
function parseDate(date: DateInput): Date {
    if (date instanceof Date) return date;
    return new Date(date);
}

/**
 * Format date to localized string
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @param locale - Locale string (default: 'es-LA')
 */
export function formatDate(
    date: DateInput,
    options: Intl.DateTimeFormatOptions = {},
    locale = 'es-LA'
): string {
    const d = parseDate(date);
    if (isNaN(d.getTime())) return 'Fecha inválida';

    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
}

/**
 * Format date as short (e.g., "15 ene 2024")
 */
export function formatDateShort(date: DateInput, locale = 'es-LA'): string {
    return formatDate(date, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }, locale);
}

/**
 * Format date as numeric (e.g., "15/01/2024")
 */
export function formatDateNumeric(date: DateInput, locale = 'es-LA'): string {
    return formatDate(date, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }, locale);
}

/**
 * Format date with time (e.g., "15 ene 2024, 14:30")
 */
export function formatDateTime(date: DateInput, locale = 'es-LA'): string {
    return formatDate(date, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }, locale);
}

/**
 * Get relative time string (e.g., "hace 5 minutos", "hace 2 días")
 */
export function getRelativeTime(date: DateInput, locale = 'es'): string {
    const d = parseDate(date);
    if (isNaN(d.getTime())) return 'Fecha inválida';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Use Intl.RelativeTimeFormat for proper localization
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffSeconds < 60) return rtf.format(-diffSeconds, 'second');
    if (diffMinutes < 60) return rtf.format(-diffMinutes, 'minute');
    if (diffHours < 24) return rtf.format(-diffHours, 'hour');
    if (diffDays < 7) return rtf.format(-diffDays, 'day');
    if (diffWeeks < 4) return rtf.format(-diffWeeks, 'week');
    if (diffMonths < 12) return rtf.format(-diffMonths, 'month');
    return rtf.format(-diffYears, 'year');
}

/**
 * Get time ago string (simpler version)
 * @returns String like "5m", "2h", "3d", "1w"
 */
export function getTimeAgo(date: DateInput): string {
    const d = parseDate(date);
    if (isNaN(d.getTime())) return '?';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return `${diffSeconds}s`;
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffWeeks < 4) return `${diffWeeks}sem`;
    if (diffMonths < 12) return `${diffMonths}mes`;
    return `${diffYears}año`;
}

/**
 * Check if date is today
 */
export function isToday(date: DateInput): boolean {
    const d = parseDate(date);
    const today = new Date();
    return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
    );
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: DateInput): boolean {
    const d = parseDate(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear()
    );
}

/**
 * Get smart date label (returns "Hoy", "Ayer", or formatted date)
 */
export function getSmartDateLabel(date: DateInput): string {
    if (isToday(date)) return 'Hoy';
    if (isYesterday(date)) return 'Ayer';
    return formatDateShort(date);
}
