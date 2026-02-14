/**
 * Enhanced Skeleton Components
 * 
 * Content-specific skeleton loaders that match actual content dimensions.
 * 
 * @module components/common/skeletons
 */

'use client';

import React from 'react';

interface SkeletonProps {
    className?: string;
}

/**
 * Base skeleton component with shimmer animation
 */
export function SkeletonBase({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-neutral-800 rounded ${className}`}
            aria-hidden="true"
        />
    );
}

/**
 * Article card skeleton
 */
export function ArticleCardSkeleton() {
    return (
        <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
            <SkeletonBase className="h-48 w-full rounded-none" />
            <div className="p-4 space-y-3">
                <SkeletonBase className="h-4 w-20" />
                <SkeletonBase className="h-6 w-full" />
                <SkeletonBase className="h-6 w-3/4" />
                <SkeletonBase className="h-4 w-full" />
                <SkeletonBase className="h-4 w-2/3" />
                <div className="flex items-center gap-3 pt-2">
                    <SkeletonBase className="h-8 w-8 rounded-full" />
                    <SkeletonBase className="h-4 w-24" />
                </div>
            </div>
        </div>
    );
}

/**
 * Project card skeleton
 */
export function ProjectCardSkeleton() {
    return (
        <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
            <SkeletonBase className="aspect-[4/3] w-full rounded-none" />
            <div className="p-4 space-y-2">
                <SkeletonBase className="h-5 w-3/4" />
                <div className="flex items-center gap-2">
                    <SkeletonBase className="h-6 w-6 rounded-full" />
                    <SkeletonBase className="h-4 w-20" />
                </div>
                <div className="flex gap-2 pt-2">
                    <SkeletonBase className="h-6 w-16 rounded-full" />
                    <SkeletonBase className="h-6 w-12 rounded-full" />
                </div>
            </div>
        </div>
    );
}

/**
 * Comment skeleton
 */
export function CommentSkeleton() {
    return (
        <div className="flex gap-3 p-4">
            <SkeletonBase className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                    <SkeletonBase className="h-4 w-24" />
                    <SkeletonBase className="h-3 w-16" />
                </div>
                <SkeletonBase className="h-4 w-full" />
                <SkeletonBase className="h-4 w-4/5" />
                <div className="flex gap-4 pt-1">
                    <SkeletonBase className="h-4 w-12" />
                    <SkeletonBase className="h-4 w-16" />
                </div>
            </div>
        </div>
    );
}

/**
 * User profile header skeleton
 */
export function ProfileHeaderSkeleton() {
    return (
        <div className="flex flex-col items-center p-8 space-y-4">
            <SkeletonBase className="h-24 w-24 rounded-full" />
            <SkeletonBase className="h-6 w-32" />
            <SkeletonBase className="h-4 w-24" />
            <SkeletonBase className="h-4 w-48" />
            <div className="flex gap-6 pt-2">
                <div className="text-center">
                    <SkeletonBase className="h-6 w-12 mx-auto" />
                    <SkeletonBase className="h-4 w-16 mt-1" />
                </div>
                <div className="text-center">
                    <SkeletonBase className="h-6 w-12 mx-auto" />
                    <SkeletonBase className="h-4 w-16 mt-1" />
                </div>
            </div>
        </div>
    );
}

/**
 * Forum thread skeleton
 */
export function ThreadSkeleton() {
    return (
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <div className="flex items-start gap-3">
                <SkeletonBase className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <SkeletonBase className="h-5 w-3/4" />
                    <SkeletonBase className="h-4 w-full" />
                    <SkeletonBase className="h-4 w-2/3" />
                    <div className="flex gap-4 pt-2">
                        <SkeletonBase className="h-4 w-16" />
                        <SkeletonBase className="h-4 w-20" />
                        <SkeletonBase className="h-4 w-16" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Grid of skeleton cards
 */
export function SkeletonGrid({
    count = 6,
    Skeleton = ArticleCardSkeleton
}: {
    count?: number;
    Skeleton?: React.ComponentType;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <Skeleton key={i} />
            ))}
        </div>
    );
}
