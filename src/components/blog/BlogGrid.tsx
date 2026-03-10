'use client';

import { memo, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, Heart } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';

interface BlogGridProps {
  articles: Record<string, unknown>[];
}

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

function BlogGridComponent({ articles }: BlogGridProps) {
  const { state } = useAppStore();

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-LA', DATE_OPTIONS);
  }, []);

  // Merge locally created blog posts with Supabase articles
  const allArticles = useMemo(() => {
    const localPosts = (state.blogPosts || []).map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      image: post.image,
      author: post.author,
      category: post.category,
      tags: post.tags,
      date: post.date,
      slug: `${post.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${post.id}`,
      likes: post.likes || 0,
      views: 0,
      comments: post.comments || 0,
      created_at: post.date,
      status: 'published',
    }));

    const existingIds = new Set(articles.map((a) => String(a.id)));
    const uniqueLocal = localPosts.filter((p) => !existingIds.has(String(p.id)));

    return [...uniqueLocal, ...articles];
  }, [articles, state.blogPosts]);

  const { featured, rest } = useMemo(() => {
    if (allArticles.length === 0) return { featured: null, rest: [] };
    const [first, ...others] = allArticles;
    return { featured: first, rest: others };
  }, [allArticles]);

  if (!featured) {
    return (
      <div className="text-center py-20">
        <p className="text-content-2">No hay artículos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Article */}
      {featured && (
        <Link href={`/blog/${featured.slug}`} className="group block">
          <article className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-dark-2/50 rounded-2xl border border-dark-5 overflow-hidden hover:border-accent-500/30 transition-all">
            <div className="aspect-video lg:aspect-auto lg:h-full relative">
              {featured.image ? (
                <Image
                  src={featured.image as string}
                  alt={featured.title as string}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-dark-3 to-dark-2" />
              )}
            </div>
            <div className="p-8 flex flex-col justify-center">
              <span className="text-accent-500 text-sm font-medium">
                {(featured.category as string) || 'Artículo'}
              </span>
              <h2 className="mt-2 text-2xl font-medium text-content-1 group-hover:text-accent-400 transition-colors">
                {featured.title as string}
              </h2>
              {typeof featured.excerpt === 'string' && featured.excerpt && (
                <p className="mt-3 text-content-2 line-clamp-3">
                  {featured.excerpt}
                </p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-content-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate((featured.date as string) || (featured.created_at as string))}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {(featured.views as number) || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {(featured.likes as number) || 0}
                </span>
              </div>
            </div>
          </article>
        </Link>
      )}

      {/* Rest of articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rest.map((article) => (
          <Link
            key={article.id as string}
            href={`/blog/${article.slug}`}
            className="group"
          >
            <article className="bg-dark-2/50 rounded-xl border border-dark-5 overflow-hidden hover:border-accent-500/30 transition-all hover:-translate-y-1">
              <div className="aspect-video relative">
                {article.image ? (
                  <Image
                    src={article.image as string}
                    alt={article.title as string}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-dark-3 to-dark-2" />
                )}
              </div>
              <div className="p-4">
                <span className="text-accent-500 text-xs font-medium">
                  {(article.category as string) || 'Artículo'}
                </span>
                <h3 className="mt-1 text-base font-medium text-content-1 group-hover:text-accent-400 transition-colors line-clamp-2">
                  {article.title as string}
                </h3>
                {typeof article.excerpt === 'string' && article.excerpt && (
                  <p className="mt-2 text-sm text-content-2 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-content-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate((article.date as string) || (article.created_at as string))}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {(article.views as number) || 0}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const BlogGrid = memo(BlogGridComponent);
