/**
 * PWA Service Worker Registration
 * 
 * Basic service worker configuration for offline support.
 * 
 * @module lib/pwa
 */

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return null;
    }

    // Only register in production
    if (process.env.NODE_ENV !== 'production') {
        console.log('[PWA] Service worker disabled in development');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
        });

        console.log('[PWA] Service worker registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content is available
                        console.log('[PWA] New content available');
                        // Optionally notify user about update
                        dispatchEvent(new CustomEvent('sw-update-available'));
                    }
                });
            }
        });

        return registration;
    } catch (error) {
        console.error('[PWA] Service worker registration failed:', error);
        return null;
    }
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorkers(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return;
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(reg => reg.unregister()));
    console.log('[PWA] All service workers unregistered');
}

/**
 * Check if running as installed PWA
 */
export function isInstalledPWA(): boolean {
    if (typeof window === 'undefined') return false;

    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-expect-error - iOS Safari specific
        window.navigator.standalone === true
    );
}
