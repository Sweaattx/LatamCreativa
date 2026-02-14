import { createClient } from '@/lib/supabase/server';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';
import type { Metadata } from 'next';
import { Sparkles, Eye, Heart, Palette } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Portafolio',
  description:
    'Explora los mejores proyectos creativos de artistas latinoamericanos. Diseño, 3D, ilustración, animación y más.',
  openGraph: {
    title: 'Portafolio | LatamCreativa',
    description: 'Los mejores proyectos creativos de Latinoamérica',
  },
};

export const dynamic = 'force-dynamic';

interface PortfolioPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

async function getProjects(category?: string, sort?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('projects')
    .select('*')
    .eq('status', 'published');

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  switch (sort) {
    case 'likes':
      query = query.order('likes', { ascending: false });
      break;
    case 'views':
      query = query.order('views', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  query = query.limit(24);

  const { data, error } = await query;
  return data || [];
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const params = await searchParams;
  const projects = await getProjects(params.category, params.sort);

  return (
    <div className="min-h-screen bg-dark-1">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-dark-5/50">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-dev-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 rounded-full text-accent-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Descubre talento latinoamericano
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-content-1 mb-4">
              Portafolio
            </h1>
            <p className="text-xl text-content-3 max-w-2xl mx-auto">
              Explora los mejores proyectos creativos de artistas y estudios de toda la región.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
                <Palette className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">{projects.length || '500'}+</p>
                <p className="text-sm text-content-3">Proyectos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-dev-500/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-dev-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">50K+</p>
                <p className="text-sm text-content-3">Vistas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">10K+</p>
                <p className="text-sm text-content-3">Me gusta</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <PortfolioGrid
          initialProjects={projects}
          initialCategory={params.category}
          initialSort={params.sort}
        />
      </div>
    </div>
  );
}
