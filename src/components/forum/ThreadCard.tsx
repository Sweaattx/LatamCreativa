'use client';

/**
 * ThreadCard Component - Compact, well-organized thread preview
 */
import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    MessageSquare,
    Eye,
    Heart,
    Pin,
    Lock,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { ForumThread } from '../../types/forum';
import { getCategoryById, CATEGORY_COLOR_CLASSES } from '../../data/forumCategories';
import { useAuthorInfo } from '../../hooks/useAuthorInfo';

interface ThreadCardProps {
    thread: ForumThread;
    onClick?: () => void;
}

function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffWeeks < 4) return `${diffWeeks}sem`;
    return `${Math.floor(diffDays / 30)}mes`;
}

const ThreadCardComponent: React.FC<ThreadCardProps> = ({ thread, onClick }) => {
    const router = useRouter();
    const category = getCategoryById(thread.category);
    const colorClasses = CATEGORY_COLOR_CLASSES[category?.color || 'gray'];

    const { authorName, authorAvatar } = useAuthorInfo(
        thread.authorId,
        thread.authorName,
        thread.authorAvatar
    );

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.push(`/forum/${thread.slug || thread.id}`);
        }
    };

    return (
        <article
            onClick={handleClick}
            className="group flex gap-5 bg-dark-2/50 hover:bg-dark-2/80 border border-dark-5 hover:border-accent-500/30 rounded-xl p-5 cursor-pointer transition-all duration-200"
        >
            {/* Left: Avatar */}
            <div className="flex-shrink-0 pt-0.5">
                <Image
                    src={authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=6366f1&color=fff`}
                    alt={authorName}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                    unoptimized
                />
            </div>

            {/* Center: Content */}
            <div className="flex-1 min-w-0">
                {/* Title row with status icons */}
                <div className="flex items-center gap-2 mb-0.5">
                    {thread.isPinned && <Pin className="w-3.5 h-3.5 text-accent-400 flex-shrink-0" />}
                    {thread.isClosed && <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                    {thread.isResolved && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />}
                    <h3 className="text-content-1 font-medium text-base group-hover:text-accent-400 transition-colors truncate">
                        {thread.title}
                    </h3>
                </div>

                {/* Meta line: author · category · time */}
                <div className="flex items-center gap-2 text-xs text-content-3 mb-2">
                    <span className="text-content-2">{authorName}</span>
                    {thread.authorRole && (
                        <>
                            <span className="text-content-3/40">·</span>
                            <span>{thread.authorRole}</span>
                        </>
                    )}
                    <span className="text-content-3/40">·</span>
                    <span className={`px-1.5 py-0.5 rounded text-2xs font-medium ${colorClasses.bg} ${colorClasses.text}`}>
                        {category?.name || thread.category}
                    </span>
                    <span className="text-content-3/40">·</span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(thread.lastActivityAt)}
                    </span>
                </div>

                {/* Excerpt - single line */}
                {thread.excerpt && (
                    <p className="text-content-3 text-sm leading-relaxed line-clamp-1">
                        {thread.excerpt}
                    </p>
                )}

                {/* Tags inline - only show if there are tags */}
                {thread.tags && thread.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                        {thread.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-0.5 bg-dark-3/60 text-content-3 text-xs rounded"
                            >
                                #{tag}
                            </span>
                        ))}
                        {thread.tags.length > 3 && (
                            <span className="text-content-3/50 text-2xs">
                                +{thread.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Right: Stats column */}
            <div className="flex-shrink-0 flex items-center gap-5 text-content-3 text-sm">
                <span className="flex items-center gap-1" title="Respuestas">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-content-2">{thread.replies}</span>
                </span>
                <span className="flex items-center gap-1" title="Vistas">
                    <Eye className="w-4 h-4" />
                    {thread.views}
                </span>
                <span className="flex items-center gap-1" title="Me gusta">
                    <Heart className="w-4 h-4" />
                    {thread.likes}
                </span>
            </div>
        </article>
    );
};

export const ThreadCard = memo(ThreadCardComponent);
export default ThreadCard;
