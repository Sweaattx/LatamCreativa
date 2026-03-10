'use client';

import dynamic from 'next/dynamic';
import { useAppStore } from '@/hooks/useAppStore';
import { HomeContent } from '@/components/home/HomeContent';

// Lazy-load FeedPage with SSR disabled to prevent hydration mismatch.
// Since useAppStore is client-only (zustand), the server can never know
// the auth state. By disabling SSR on FeedPage, we avoid rendering it
// on the server at all — the server always renders the loading spinner,
// and the client picks the right component after hydration.
const FeedPage = dynamic(() => import('@/components/feed/FeedPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-dark-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

/**
 * Home Page
 * 
 * - Guest users → Landing page (HomeContent)
 * - Authenticated users → Social Feed (FeedPage)
 *
 * IMPORTANT: HomeContent is SSR-safe (always renders the same on server/client).
 * FeedPage is client-only (ssr: false) so it never causes hydration mismatch.
 * The auth check uses useAppStore which is client-side zustand state.
 */
export default function HomePage() {
  const { state } = useAppStore();
  const isLoggedIn = !!state.user;

  if (isLoggedIn) {
    return <FeedPage />;
  }

  return <HomeContent />;
}
