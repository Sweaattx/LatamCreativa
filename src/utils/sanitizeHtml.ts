/**
 * HTML Sanitization Utility
 * 
 * Uses DOMPurify to prevent XSS attacks when rendering user-generated HTML content.
 * Always use sanitizeHtml() before passing content to dangerouslySetInnerHTML.
 */
import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Allows safe HTML tags (formatting, links, images) while stripping scripts and event handlers.
 *
 * @param dirty - Raw HTML string from user input or database
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string): string {
    if (typeof window === 'undefined') {
        // Server-side: strip all HTML tags as a safe fallback
        return dirty.replace(/<[^>]*>/g, '');
    }

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'hr',
            'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins',
            'a', 'img',
            'ul', 'ol', 'li',
            'blockquote', 'pre', 'code',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'span', 'div', 'sub', 'sup',
        ],
        ALLOWED_ATTR: [
            'href', 'target', 'rel', 'src', 'alt', 'width', 'height',
            'class', 'id', 'title',
        ],
        ALLOW_DATA_ATTR: false,
        ADD_ATTR: ['target'],
        FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'textarea', 'select', 'button', 'object', 'embed'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    });
}
