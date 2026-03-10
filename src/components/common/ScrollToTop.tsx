'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Scrolls the main content container to top on every route change.
 * Targets both window and the custom scroll container used in MainLayout.
 */
export function ScrollToTop() {
    const pathname = usePathname();

    useEffect(() => {
        // Scroll window (for pages outside MainLayout)
        window.scrollTo(0, 0);

        // Scroll the MainLayout custom scroll container
        // MainLayout uses a div with overflow-y-auto as the scroll parent
        const scrollContainer = document.querySelector('[data-scroll-container]');
        if (scrollContainer) {
            scrollContainer.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
}
