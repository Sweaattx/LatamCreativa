import { Suspense } from 'react';
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

/**
 * Home Page — Server Component
 * 
 * Wraps the client-side HomeContent in a Suspense boundary
 * so the shell streams instantly while interactive sections load.
 */
export default function HomePage() {
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
