/**
 * Image Utilities
 * 
 * Helper functions for image optimization and placeholder generation.
 * 
 * @module utils/imageUtils
 */

/**
 * Generate a blur placeholder data URL for images
 * Uses a simple gradient-based placeholder
 */
export function generateBlurPlaceholder(
    primaryColor: string = '#1a1a1a',
    secondaryColor: string = '#2a2a2a'
): string {
    // SVG-based blur placeholder (very small, ~200 bytes)
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5">
            <filter id="b" color-interpolation-filters="sRGB">
                <feGaussianBlur stdDeviation="1"/>
            </filter>
            <rect width="100%" height="100%" fill="${primaryColor}"/>
            <rect width="100%" height="100%" fill="${secondaryColor}" filter="url(#b)"/>
        </svg>
    `.trim().replace(/\s+/g, ' ');

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Default blur placeholder for dark theme
 */
export const DEFAULT_BLUR_PLACEHOLDER = generateBlurPlaceholder('#0d0d0f', '#1a1a1c');

/**
 * Blur placeholder variants
 */
export const BLUR_PLACEHOLDERS = {
    dark: generateBlurPlaceholder('#0d0d0f', '#1a1a1c'),
    light: generateBlurPlaceholder('#f5f5f5', '#e5e5e5'),
    amber: generateBlurPlaceholder('#1a1a1a', '#78350f'),
    purple: generateBlurPlaceholder('#1a1a1a', '#581c87'),
} as const;

/**
 * Get optimized image dimensions while maintaining aspect ratio
 */
export function getOptimizedDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number = 1200,
    maxHeight: number = 800
): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
    }

    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }

    return {
        width: Math.round(width),
        height: Math.round(height),
    };
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
    baseUrl: string,
    widths: number[] = [320, 640, 768, 1024, 1280, 1920]
): string {
    return widths
        .map(w => `${baseUrl}?w=${w} ${w}w`)
        .join(', ');
}

/**
 * Get image format based on browser support
 */
export function getPreferredImageFormat(): 'avif' | 'webp' | 'jpeg' {
    if (typeof window === 'undefined') return 'webp';

    // Check for AVIF support
    const canvas = document.createElement('canvas');
    if (canvas.toDataURL('image/avif').startsWith('data:image/avif')) {
        return 'avif';
    }

    // Check for WebP support
    if (canvas.toDataURL('image/webp').startsWith('data:image/webp')) {
        return 'webp';
    }

    return 'jpeg';
}
