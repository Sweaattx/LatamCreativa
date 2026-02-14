'use client';

/**
 * ForumCategoryCard Component
 * 
 * Card para mostrar una categoría en la página principal del foro.
 */
import React from 'react';
import { useRouter } from 'next/navigation';
import { getForumIcon } from '../../utils/forumIcons';
import { ForumCategory } from '../../types/forum';
import { CATEGORY_COLOR_CLASSES } from '../../data/forumCategories';

interface ForumCategoryCardProps {
    category: Omit<ForumCategory, 'threadCount' | 'lastActivity'> & {
        threadCount?: number;
        lastActivity?: {
            threadTitle: string;
            threadSlug: string;
            authorName: string;
            date: string;
        };
    };
    onClick?: () => void;
}

export const ForumCategoryCard: React.FC<ForumCategoryCardProps> = ({ category, onClick }) => {
    const router = useRouter();
    const colorClasses = CATEGORY_COLOR_CLASSES[category.color] || CATEGORY_COLOR_CLASSES.gray;

    const IconComponent = getForumIcon(category.icon);

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.push(`/forum/categoria/${category.slug}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="group relative bg-dark-2/60 hover:bg-dark-2 border border-dark-5/50 hover:border-dark-5 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.01]"
        >
            {/* Icon + Title */}
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${colorClasses.bg} ${colorClasses.border} border transition-all group-hover:scale-105`}>
                    <IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-content-1 font-medium text-lg mb-1 group-hover:text-accent-400 transition-colors">
                        {category.name}
                    </h3>
                    <p className="text-content-3 text-sm line-clamp-2">
                        {category.description}
                    </p>
                </div>
            </div>

            {/* Stats + Last Activity */}
            <div className="mt-4 pt-3 border-t border-dark-5/50">
                <div className="flex items-center justify-between">
                    <span className="text-content-3 text-sm">
                        {category.threadCount !== undefined ? (
                            <>{category.threadCount} {category.threadCount === 1 ? 'hilo' : 'hilos'}</>
                        ) : (
                            'Sin hilos aún'
                        )}
                    </span>

                    {category.lastActivity && (
                        <span className="text-content-3 text-xs truncate max-w-[60%]" title={category.lastActivity.threadTitle}>
                            Último: {category.lastActivity.authorName}
                        </span>
                    )}
                </div>
            </div>

            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-${category.color}-500/5 to-transparent`} />
            </div>
        </div>
    );
};

export default ForumCategoryCard;
