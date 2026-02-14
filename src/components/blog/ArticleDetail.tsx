'use client';

import { memo, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Eye, Heart, Share2, Bookmark } from 'lucide-react';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface ArticleDetailProps {
  article: Record<string, unknown>;
  author: Record<string, unknown> | null;
  relatedArticles: Record<string, unknown>[];
}

// Opciones de formato de fecha (constante fuera del componente)
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

function ArticleDetailComponent({
  article,
  author,
  relatedArticles,
}: ArticleDetailProps) {
  // Memoizar extracción de datos del artículo
  const articleData = useMemo(() => ({
    title: String(article.title || ''),
    category: String(article.category || 'Artículo'),
    excerpt: article.excerpt ? String(article.excerpt) : null,
    image: article.image ? String(article.image) : null,
    content: String(article.content || ''),
    tags: Array.isArray(article.tags) ? article.tags as string[] : [],
    views: Number(article.views || 0),
    likes: Number(article.likes || 0),
    date: String(article.date || article.created_at || ''),
  }), [article]);

  // Memoizar extracción de datos del autor
  const authorData = useMemo(() => ({
    name: author ? String(author.name || '') : '',
    avatar: author?.avatar ? String(author.avatar) : null,
    role: author ? String(author.role || 'Autor') : '',
    username: author?.username ? String(author.username) : null,
    id: author ? String(author.id || '') : '',
  }), [author]);

  // Formato de fecha memoizado
  const formattedDate = useMemo(() => {
    if (!articleData.date) return '';
    return new Date(articleData.date).toLocaleDateString('es-LA', DATE_FORMAT_OPTIONS);
  }, [articleData.date]);

  // Handler de compartir memoizado
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      await navigator.share({
        title: articleData.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('URL copiada al portapapeles');
    }
  }, [articleData.title]);

  return (
    <main className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-dark-950/80 backdrop-blur-lg border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver al blog</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              aria-label="Guardar"
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              aria-label="Compartir"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <span className="text-amber-500 font-medium">{articleData.category}</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white">
            {articleData.title}
          </h1>

          {articleData.excerpt && (
            <p className="mt-4 text-lg text-neutral-400">{articleData.excerpt}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-6">
            {/* Author */}
            {author && (
              <Link
                href={`/user/${authorData.username || authorData.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800">
                  {authorData.avatar ? (
                    <Image
                      src={authorData.avatar}
                      alt={authorData.name}
                      width={40}
                      height={40}
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                      {authorData.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium group-hover:text-amber-500 transition-colors">
                    {authorData.name}
                  </p>
                  <p className="text-xs text-neutral-500">{authorData.role}</p>
                </div>
              </Link>
            )}

            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {articleData.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {articleData.likes}
              </span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {articleData.image && (
          <div className="mb-8 aspect-video relative rounded-xl overflow-hidden animate-fade-in">
            <Image
              src={articleData.image}
              alt={articleData.title}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none animate-fade-in"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(articleData.content) }}
        />

        {/* Tags */}
        {articleData.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-neutral-800 animate-fade-in">
            <h3 className="text-sm font-medium text-neutral-400 mb-3">
              Etiquetas
            </h3>
            <div className="flex flex-wrap gap-2">
              {articleData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-neutral-800 text-neutral-300 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12 pt-8 border-t border-neutral-800 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6">
              Artículos relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => {
                const relatedId = String(related.id || '');
                const relatedSlug = String(related.slug || '');
                const relatedTitle = String(related.title || '');
                const relatedImage = related.image ? String(related.image) : null;

                return (
                  <Link
                    key={relatedId}
                    href={`/blog/${relatedSlug}`}
                    className="group"
                  >
                    <div className="aspect-video relative rounded-lg overflow-hidden bg-neutral-900">
                      {relatedImage ? (
                        <Image
                          src={relatedImage}
                          alt={relatedTitle}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
                      )}
                    </div>
                    <h3 className="mt-3 text-sm font-medium text-white group-hover:text-amber-500 transition-colors line-clamp-2">
                      {relatedTitle}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}

// Memoizar componente
export const ArticleDetail = memo(ArticleDetailComponent);
