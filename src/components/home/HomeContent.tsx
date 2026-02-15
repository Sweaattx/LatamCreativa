'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/hooks/useAppStore';
import { HeroSection } from './HeroSection';
import { CategoriesSection } from './CategoriesSection';
import { TrendingProjects } from './TrendingProjects';
import { StatsBar } from './StatsBar';

// Below-the-fold components loaded via dynamic import for code splitting
const TopCreators = dynamic(() => import('./TopCreators').then(m => ({ default: m.TopCreators })));
const ArticlesSection = dynamic(() => import('./ArticlesSection').then(m => ({ default: m.ArticlesSection })));
const JobsSection = dynamic(() => import('./JobsSection').then(m => ({ default: m.JobsSection })));
const CTASection = dynamic(() => import('./CTASection').then(m => ({ default: m.CTASection })));

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
