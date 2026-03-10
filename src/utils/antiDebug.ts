/**
 * Anti-Debugging & Source Protection Utilities
 * 
 * Production-only deterrents to discourage casual inspection of client-side code.
 * These measures are NOT security barriers — determined users can always bypass them.
 * They serve as a UX-level deterrent for curious non-technical users.
 * 
 * @module utils/antiDebug
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Initialize all anti-debugging protections.
 * Only active in production builds.
 */
export function initAntiDebug(): void {
    if (!isProduction || typeof window === 'undefined') return;

    disableContextMenu();
    blockDevToolsShortcuts();
    clearConsolePeriodically();
}

/**
 * Disable right-click context menu with a custom message.
 * Users can still access DevTools via browser menu.
 */
function disableContextMenu(): void {
    document.addEventListener('contextmenu', (e: MouseEvent) => {
        e.preventDefault();
    }, { passive: false });
}

/**
 * Intercept common DevTools keyboard shortcuts.
 * Blocks: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
 */
function blockDevToolsShortcuts(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            return;
        }

        // Ctrl+Shift+I (Inspector), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element picker)
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
            e.preventDefault();
            return;
        }

        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key.toUpperCase() === 'U') {
            e.preventDefault();
            return;
        }
    }, { passive: false });
}

/**
 * Periodically clear the console to discourage inspection.
 * Runs every 5 seconds in production.
 */
function clearConsolePeriodically(): void {
    const clearConsole = () => {
        try {
            console.clear();
            // Overwrite console methods with no-ops to suppress output
            // (preserving error for critical runtime issues)
        } catch {
            // Silently fail if console is not available
        }
    };

    // Initial clear after a short delay
    setTimeout(clearConsole, 2000);

    // Periodic clearing
    setInterval(clearConsole, 10000);
}
