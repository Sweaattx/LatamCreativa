'use client';

import React, { useState, useCallback, memo } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LikeButtonProps {
    itemId: string;
    itemType: 'project' | 'article';
    initialLikes: number;
    size?: 'sm' | 'md';
    className?: string;
}

function LikeButtonComponent({ itemId, itemType, initialLikes, size = 'sm', className = '' }: LikeButtonProps) {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(initialLikes);
    const [animating, setAnimating] = useState(false);

    const handleLike = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        // Optimistic update
        const newLiked = !liked;
        setLiked(newLiked);
        setCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
        setAnimating(true);
        setTimeout(() => setAnimating(false), 400);

        // Persist to DB
        try {
            const table = itemType === 'project' ? 'projects' : 'articles';
            const { data } = await supabase
                .from(table)
                .select('likes')
                .eq('id', itemId)
                .single();

            if (data) {
                const record = data as unknown as { likes?: number };
                const currentLikes = typeof record.likes === 'number' ? record.likes : 0;
                await supabase
                    .from(table)
                    .update({ likes: newLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1) } as never)
                    .eq('id', itemId);
            }
        } catch (err) {
            // Revert on error
            console.warn('Like update failed:', err);
            setLiked(!newLiked);
            setCount(prev => !newLiked ? prev + 1 : Math.max(0, prev - 1));
        }
    }, [liked, itemId, itemType]);

    const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

    return (
        <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors group ${className} ${liked ? 'text-red-400' : 'text-white/60 hover:text-red-400'
                }`}
            aria-label={liked ? 'Quitar like' : 'Dar like'}
        >
            <Heart
                className={`${iconSize} transition-transform ${liked ? 'fill-current' : ''
                    } ${animating ? 'scale-125' : 'scale-100'}`}
                style={{
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            />
            <span className={textSize}>{count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}</span>
        </button>
    );
}

export const LikeButton = memo(LikeButtonComponent);
export default LikeButton;
