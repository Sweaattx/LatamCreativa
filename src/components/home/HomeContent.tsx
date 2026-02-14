'use client';

import React from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { HeroSection } from './HeroSection';
import { CategoriesSection } from './CategoriesSection';
import { TrendingProjects } from './TrendingProjects';
import { StatsBar } from './StatsBar';
import { TopCreators } from './TopCreators';
import { ArticlesSection } from './ArticlesSection';
import { JobsSection } from './JobsSection';
import { CTASection } from './CTASection';

export function HomeContent() {
  const { state } = useAppStore();
  const isLoggedIn = !!state.user;

  return (
    <div className="min-h-screen bg-dark-1 bg-texture">
      <HeroSection isLoggedIn={isLoggedIn} />
      <StatsBar />
      <CategoriesSection />
      <TrendingProjects />
      <TopCreators />
      <ArticlesSection />
      <JobsSection />
      <CTASection isLoggedIn={isLoggedIn} />
    </div>
  );
}
