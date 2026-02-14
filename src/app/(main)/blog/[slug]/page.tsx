import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ArticleDetail } from '@/components/blog/ArticleDetail';
import type { Metadata } from 'next';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('articles')
    .select('title, excerpt, image, category, tags, author')
    .eq('slug', slug)
    .single();

  const article = data as {
    title: string;
    excerpt: string | null;
    image: string | null;
    category: string | null;
    tags: string[] | null;
    author: string | null;
  } | null;

  if (!article) {
    return { title: 'Artículo no encontrado' };
  }

  return {
    title: article.title,
    description: article.excerpt || `Artículo sobre ${article.category || 'creatividad'}`,
    keywords: article.tags || [],
    authors: article.author ? [{ name: article.author }] : [],
    openGraph: {
      title: `${article.title} | LatamCreativa`,
      description: article.excerpt || 'Artículo en LatamCreativa',
      type: 'article',
      images: article.image ? [{ url: article.image, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || 'Artículo en LatamCreativa',
      images: article.image ? [article.image] : [],
    },
  };
}

// Dynamic rendering - pages generated on-demand
export const dynamic = 'force-dynamic';

async function getArticle(slug: string) {
  const supabase = await createClient();

  const { data: articleData, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  const article = articleData as Record<string, unknown> | null;

  if (error || !article) return null;

  // Get author info
  const { data: authorData } = await supabase
    .from('users')
    .select('id, name, username, avatar, role, bio')
    .eq('id', article.author_id as string)
    .single();

  // Get related articles
  const { data: relatedData } = await supabase
    .from('articles')
    .select('id, slug, title, image, category, excerpt')
    .eq('status', 'published')
    .eq('category', article.category as string)
    .neq('id', article.id as string)
    .limit(3);

  return {
    article,
    author: authorData as Record<string, unknown> | null,
    relatedArticles: (relatedData || []) as Record<string, unknown>[],
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const data = await getArticle(slug);

  if (!data) {
    notFound();
  }

  return (
    <ArticleDetail
      article={data.article}
      author={data.author}
      relatedArticles={data.relatedArticles}
    />
  );
}
