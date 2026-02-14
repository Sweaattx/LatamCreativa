import { createClient } from '@/lib/supabase/server';
import { BlogGrid } from '@/components/blog/BlogGrid';
import type { Metadata } from 'next';
import { Sparkles, BookOpen, Users, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Artículos, tutoriales y noticias sobre diseño, arte y creatividad en Latinoamérica.',
  openGraph: {
    title: 'Blog | LatamCreativa',
    description: 'Artículos y tutoriales para creativos',
  },
};

export const dynamic = 'force-dynamic';

async function getArticles() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20);

  return articles || [];
}

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-dark-1">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-dark-5/50">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-dev-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 rounded-full text-accent-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Últimas publicaciones
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-content-1 mb-4">
              Blog
            </h1>
            <p className="text-xl text-content-3 max-w-2xl mx-auto">
              Artículos, tutoriales y noticias de la comunidad creativa latinoamericana.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">{articles.length || '100'}+</p>
                <p className="text-sm text-content-3">Artículos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-dev-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-dev-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">30+</p>
                <p className="text-sm text-content-3">Autores</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">25K+</p>
                <p className="text-sm text-content-3">Lecturas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <BlogGrid articles={articles} />
      </div>
    </div>
  );
}
