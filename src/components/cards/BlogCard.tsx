'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { ArticleItem } from '../../types';

interface BlogCardProps {
  article: ArticleItem;
  variant?: 'default' | 'horizontal' | 'featured';
}

const DATE_OPTIONS: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

const BlogCardComponent: React.FC<BlogCardProps> = ({ article, variant = 'default' }) => {
  const router = useRouter();

  const handleClick = useCallback(() => {
    router.push(`/blog/${article.slug || article.id}`);
  }, [router, article.slug, article.id]);

  const formattedDate = useMemo(() => {
    if (!article.date) return '';
    return new Date(article.date).toLocaleDateString('es-ES', DATE_OPTIONS);
  }, [article.date]);

  if (variant === 'featured') {
    return (
      <article onClick={handleClick} className="group cursor-pointer">
        <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-dark-2">
          {article.image && (
            <Image
              src={article.image}
              alt={article.title}
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-0/90 via-dark-0/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-accent-500 text-white rounded mb-2">
              {article.category}
            </span>
            <h2 className="text-xl font-medium text-content-1 line-clamp-2">{article.title}</h2>
            <div className="flex items-center gap-3 mt-3 text-sm text-content-2">
              {article.authorAvatar && (
                <Image
                  src={article.authorAvatar}
                  alt=""
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              )}
              <span>{article.author}</span>
              <span className="text-content-3">·</span>
              <span className="text-content-3">{formattedDate}</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <article onClick={handleClick} className="group flex gap-3 cursor-pointer">
        <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-dark-2">
          {article.image && (
            <Image
              src={article.image}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
              loading="lazy"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xs text-accent-500 font-medium">{article.category}</p>
          <h3 className="text-sm font-medium text-content-1 line-clamp-2 group-hover:text-accent-400 transition-colors">
            {article.title}
          </h3>
        </div>
      </article>
    );
  }

  return (
    <article onClick={handleClick} className="group cursor-pointer">
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-dark-2 mb-3">
        {article.image && (
          <Image
            src={article.image}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        )}
      </div>
      <p className="text-xs text-accent-500 font-medium mb-1.5">{article.category}</p>
      <h3 className="text-sm font-medium text-content-1 line-clamp-2 group-hover:text-accent-400 transition-colors">
        {article.title}
      </h3>
      <div className="flex items-center gap-2 mt-2.5 text-xs text-content-3">
        <span>{article.author}</span>
        {article.readTime && (
          <>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.readTime} min
            </span>
          </>
        )}
      </div>
    </article>
  );
};

export const BlogCard = memo(BlogCardComponent);
export default BlogCard;
