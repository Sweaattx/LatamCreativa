/**
 * Number Utilities
 * 
 * Consistent number formatting functions for the application.
 * Handles views, likes, followers, currency, etc.
 * 
 * @module utils/numberUtils
 */

/**
 * Format number with compact notation (e.g., 1K, 2.5M)
 * @param num - Number to format
 * @param locale - Locale for formatting (default: 'es-LA')
 */
export function formatCompact(num: number | string, locale = 'es-LA'): string {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0';

    return new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
    }).format(n);
}

/**
 * Format number with thousands separators
 */
export function formatNumber(num: number | string, locale = 'es-LA'): string {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0';

    return new Intl.NumberFormat(locale).format(n);
}

/**
 * Format as currency
 * @param num - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'es-LA')
 */
export function formatCurrency(
    num: number | string,
    currency = 'USD',
    locale = 'es-LA'
): string {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '$0';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(n);
}

/**
 * Format percentage
 */
export function formatPercentage(
    num: number | string,
    decimals = 0,
    locale = 'es-LA'
): string {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0%';

    return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(n / 100);
}

/**
 * Format views/likes with appropriate suffix
 * Smart formatting: 999 → "999", 1000 → "1K", 1500 → "1.5K"
 */
export function formatCount(num: number | string): string {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0';

    if (n < 1000) return n.toString();
    if (n < 1000000) {
        const k = n / 1000;
        return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
    }
    const m = n / 1000000;
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = bytes / Math.pow(k, i);

    return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Format duration in seconds to human readable
 * @param seconds - Duration in seconds
 * @returns String like "5m 30s", "1h 25m", "2h 30m 15s"
 */
export function formatDuration(seconds: number): string {
    if (seconds < 0) return '0s';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
}

/**
 * Format reading time
 * @param wordCount - Number of words
 * @param wordsPerMinute - Reading speed (default: 200)
 * @returns String like "5 min de lectura"
 */
export function formatReadingTime(wordCount: number, wordsPerMinute = 200): string {
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min de lectura`;
}

/**
 * Clamp a number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
}

/**
 * Round to specified decimal places
 */
export function roundTo(num: number, decimals = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}

/**
 * Get ordinal suffix for a number (Spanish)
 */
export function getOrdinal(num: number): string {
    if (num === 1) return '1°';
    if (num === 2) return '2°';
    if (num === 3) return '3°';
    return `${num}°`;
}
