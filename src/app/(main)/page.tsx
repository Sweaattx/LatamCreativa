'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/hooks/useAppStore';
import { HomeContent } from '@/components/home/HomeContent';
import {
  HeroSkeleton,
  StatsBarSkeleton,
  CategoriesSkeleton,
  ProjectsSkeleton,
  CreatorsSkeleton,
  ArticlesSkeleton,
  JobsSkeleton,
  CTASkeleton,
} from '@/components/home/Skeletons';

// Lazy-load FeedPage — only downloaded when user is authenticated
const FeedPage = dynamic(() => import('@/components/feed/FeedPage'), {
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
 */
export default function HomePage() {
  const { state } = useAppStore();
  const isLoggedIn = !!state.user;

  if (isLoggedIn) {
    return <FeedPage />;
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dark-1 bg-texture">
          <HeroSkeleton />
          <StatsBarSkeleton />
          <CategoriesSkeleton />
          <ProjectsSkeleton />
          <CreatorsSkeleton />
          <ArticlesSkeleton />
          <JobsSkeleton />
          <CTASkeleton />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
