'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

interface CommentButtonProps {
    itemId: string;
    itemType: 'project' | 'article';
    commentCount: number;
    slug?: string;
    size?: 'sm' | 'md';
    className?: string;
}

/**
 * Interactive comment button that navigates to the detail page.
 * Designed for use in FeedCard and similar card components.
 */
function CommentButtonComponent({
    itemId,
    itemType,
    commentCount,
    slug,
    size = 'sm',
    className = ''
}: CommentButtonProps) {
    const router = useRouter();

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const path = itemType === 'project'
            ? `/portfolio/${slug || itemId}`
            : `/blog/${slug || itemId}`;

        router.push(`${path}#comments`);
    }, [router, itemId, itemType, slug]);

    const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n;

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-1 transition-colors duration-200 group/comment text-white/60 hover:text-dev-400 ${className}`}
            aria-label={`${commentCount} comentarios`}
        >
            <MessageCircle
                className={`${iconSize} transition-transform duration-200 group-hover/comment:scale-110`}
            />
            <span className={textSize}>{fmt(commentCount)}</span>
        </button>
    );
}

export const CommentButton = React.memo(CommentButtonComponent);
