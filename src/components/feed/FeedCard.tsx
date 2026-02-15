'use client';

import React, { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, Eye, MessageCircle, Bookmark } from 'lucide-react';
import { FeedItem } from '@/hooks/useFeed';
import { PortfolioItem, ArticleItem } from '@/types';

interface FeedCardProps {
    item: FeedItem;
    onSave?: (id: string, image: string) => void;
}

const fmt = (n: number | string | undefined): string => {
    const num = typeof n === 'string' ? parseInt(n, 10) : (n || 0);
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
};

const timeAgo = (date: string): string => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'ahora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}sem`;
    const months = Math.floor(days / 30);
    return months < 12 ? `${months}mes` : `${Math.floor(days / 365)}a`;
};

// Masonry card heights based on content
const MASONRY_HEIGHTS = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-square', 'aspect-[3/2]', 'aspect-[4/3]'];

function getRandomHeight(id: string): string {
    // Deterministic "random" based on ID so it's consistent across re-renders
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
    }
    return MASONRY_HEIGHTS[Math.abs(hash) % MASONRY_HEIGHTS.length];
}

const FeedCardComponent: React.FC<FeedCardProps> = ({ item, onSave }) => {
    const router = useRouter();
    const isProject = item.type === 'project';
    const data = item.data;

    const image = isProject
        ? (data as PortfolioItem).image
        : (data as ArticleItem).image;

    const title = data.title;
    const category = isProject
        ? (data as PortfolioItem).category
        : (data as ArticleItem).category;

    const authorName = isProject
        ? (data as PortfolioItem).artist || 'Creador'
        : (data as ArticleItem).author;

    const authorAvatar = isProject
        ? (data as PortfolioItem).artistAvatar
        : (data as ArticleItem).authorAvatar;

    const likes = isProject
        ? (data as PortfolioItem).likes
        : (data as ArticleItem).likes;

    const views = isProject
        ? (data as PortfolioItem).views
        : (data as ArticleItem).views;

    const comments = !isProject ? (data as ArticleItem).comments : 0;

    const slug = data.slug || data.id;
    const aspectClass = getRandomHeight(item.id);

    const handleClick = useCallback(() => {
        if (isProject) {
            router.push(`/portfolio/${slug}`);
        } else {
            router.push(`/blog/${slug}`);
        }
    }, [isProject, slug, router]);

    const handleSave = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (onSave && image) {
            onSave(data.id, image);
        }
    }, [onSave, image, data.id]);

    return (
        <article
            onClick={handleClick}
            className="group cursor-pointer break-inside-avoid mb-4"
        >
            <div className={`relative ${aspectClass} rounded-xl overflow-hidden bg-dark-2 border border-white/[0.04]`}>
                {image && (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                    />
                )}

                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category badge */}
                {category && (
                    <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white/80 rounded-full uppercase tracking-wider">
                            {category}
                        </span>
                    </div>
                )}

                {/* Type badge */}
                <div className="absolute top-3 right-3">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wider backdrop-blur-sm ${isProject
                            ? 'bg-accent-500/80 text-white'
                            : 'bg-blue-500/80 text-white'
                        }`}>
                        {isProject ? 'Proyecto' : 'Artículo'}
                    </span>
                </div>

                {/* Save button on hover */}
                <button
                    onClick={handleSave}
                    className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all z-10"
                    aria-label="Guardar"
                    style={{ display: onSave ? undefined : 'none' }}
                >
                    <Bookmark className="w-4 h-4 text-white" />
                </button>

                {/* Bottom info on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">
                        {title}
                    </h3>

                    <div className="flex items-center justify-between">
                        {/* Author */}
                        <div className="flex items-center gap-2">
                            {authorAvatar && (
                                <Image
                                    src={authorAvatar}
                                    alt=""
                                    width={20}
                                    height={20}
                                    className="rounded-full object-cover"
                                />
                            )}
                            <span className="text-xs text-white/70 truncate max-w-[100px]">{authorName}</span>
                            <span className="text-[10px] text-white/40">{timeAgo(item.createdAt)}</span>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-white/60">
                            <span className="flex items-center gap-1 text-xs">
                                <Heart className="w-3.5 h-3.5" /> {fmt(likes)}
                            </span>
                            {views !== undefined && (
                                <span className="flex items-center gap-1 text-xs">
                                    <Eye className="w-3.5 h-3.5" /> {fmt(views)}
                                </span>
                            )}
                            {comments > 0 && (
                                <span className="flex items-center gap-1 text-xs">
                                    <MessageCircle className="w-3.5 h-3.5" /> {fmt(comments)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export const FeedCard = memo(FeedCardComponent);
export default FeedCard;
