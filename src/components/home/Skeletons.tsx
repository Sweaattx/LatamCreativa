'use client';

import React from 'react';

/* ========================================
   Skeleton Primitives
   Reusable loading placeholders for Suspense fallbacks.
   Uses the .shimmer class from globals.css.
   ======================================== */

export function SkeletonBox({ className = '' }: { className?: string }) {
    return <div className={`shimmer ${className}`} />;
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="shimmer h-3"
                    style={{ width: i === lines - 1 ? '60%' : '100%' }}
                />
            ))}
        </div>
    );
}

/* ========================================
   Section Skeletons
   Match the visual structure of each home section.
   ======================================== */

export function HeroSkeleton() {
    return (
        <section className="relative min-h-[70vh] bg-dark-0 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
                <SkeletonBox className="h-4 w-32 mx-auto" />
                <SkeletonBox className="h-12 w-3/4 mx-auto" />
                <SkeletonBox className="h-12 w-1/2 mx-auto" />
                <SkeletonBox className="h-5 w-2/3 mx-auto" />
                <div className="flex gap-4 justify-center pt-4">
                    <SkeletonBox className="h-12 w-40 rounded-xl" />
                    <SkeletonBox className="h-12 w-40 rounded-xl" />
                </div>
            </div>
        </section>
    );
}

export function StatsBarSkeleton() {
    return (
        <section className="py-12 bg-dark-0 border-y border-dark-5/30">
            <div className="max-w-5xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="text-center space-y-2">
                            <SkeletonBox className="h-8 w-20 mx-auto" />
                            <SkeletonBox className="h-3 w-16 mx-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function CategoriesSkeleton() {
    return (
        <section className="py-20 bg-dark-1">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-2">
                        <SkeletonBox className="h-3 w-16" />
                        <SkeletonBox className="h-7 w-32" />
                    </div>
                    <SkeletonBox className="h-4 w-20" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonBox key={i} className="aspect-[3/4] rounded-xl" />
                    ))}
                </div>
            </div>
        </section>
    );
}

export function ProjectsSkeleton() {
    return (
        <section className="py-20 bg-dark-1">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-2">
                        <SkeletonBox className="h-3 w-16" />
                        <SkeletonBox className="h-7 w-48" />
                    </div>
                    <SkeletonBox className="h-4 w-20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border border-dark-5/30">
                            <SkeletonBox className="aspect-video rounded-none" />
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <SkeletonBox className="h-6 w-6 rounded-full" />
                                    <SkeletonBox className="h-3 w-24" />
                                </div>
                                <SkeletonBox className="h-4 w-3/4" />
                                <SkeletonBox className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function CreatorsSkeleton() {
    return (
        <section className="py-20 bg-dark-0">
            <div className="max-w-6xl mx-auto px-6">
                <div className="space-y-2 mb-10">
                    <SkeletonBox className="h-3 w-16" />
                    <SkeletonBox className="h-7 w-40" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="text-center space-y-3 p-4">
                            <SkeletonBox className="h-16 w-16 rounded-full mx-auto" />
                            <SkeletonBox className="h-4 w-24 mx-auto" />
                            <SkeletonBox className="h-3 w-16 mx-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function ArticlesSkeleton() {
    return (
        <section className="py-20 bg-dark-1">
            <div className="max-w-6xl mx-auto px-6">
                <div className="space-y-2 mb-10">
                    <SkeletonBox className="h-3 w-16" />
                    <SkeletonBox className="h-7 w-40" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border border-dark-5/30">
                            <SkeletonBox className="aspect-video rounded-none" />
                            <div className="p-4 space-y-3">
                                <SkeletonBox className="h-4 w-3/4" />
                                <SkeletonText lines={2} />
                                <div className="flex items-center gap-2 pt-2">
                                    <SkeletonBox className="h-5 w-5 rounded-full" />
                                    <SkeletonBox className="h-3 w-20" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function JobsSkeleton() {
    return (
        <section className="py-20 bg-dark-0">
            <div className="max-w-6xl mx-auto px-6">
                <div className="space-y-2 mb-10">
                    <SkeletonBox className="h-3 w-16" />
                    <SkeletonBox className="h-7 w-40" />
                </div>
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-xl border border-dark-5/30 flex items-center gap-4">
                            <SkeletonBox className="h-10 w-10 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <SkeletonBox className="h-4 w-48" />
                                <SkeletonBox className="h-3 w-32" />
                            </div>
                            <SkeletonBox className="h-3 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function CTASkeleton() {
    return (
        <section className="py-24 bg-dark-1">
            <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
                <SkeletonBox className="h-8 w-2/3 mx-auto" />
                <SkeletonBox className="h-4 w-1/2 mx-auto" />
                <SkeletonBox className="h-12 w-40 mx-auto rounded-xl" />
            </div>
        </section>
    );
}
