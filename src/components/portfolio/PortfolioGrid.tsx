'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Grid, List } from 'lucide-react';

const categories = [
  { id: 'all', label: 'Todos' },
  { id: '3d', label: '3D' },
  { id: 'illustration', label: 'Ilustración' },
  { id: 'animation', label: 'Animación' },
  { id: 'design', label: 'Diseño' },
  { id: 'photography', label: 'Fotografía' },
  { id: 'video', label: 'Video' },
];

const sortOptions = [
  { id: 'date', label: 'Más recientes' },
  { id: 'likes', label: 'Más populares' },
  { id: 'views', label: 'Más vistos' },
];

interface PortfolioGridProps {
  initialProjects: Record<string, unknown>[];
  initialCategory?: string;
  initialSort?: string;
}

export function PortfolioGrid({
  initialProjects,
  initialCategory = 'all',
  initialSort = 'date',
}: PortfolioGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory === 'all') {
      params.delete('category');
    } else {
      params.set('category', newCategory);
    }
    router.push(`/portfolio?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === 'date') {
      params.delete('sort');
    } else {
      params.set('sort', newSort);
    }
    router.push(`/portfolio?${params.toString()}`);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${category === cat.id
                  ? 'bg-accent-500 text-white'
                  : 'bg-dark-3 text-content-2 hover:bg-dark-4 hover:text-content-1'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort & View */}
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="h-11 px-4 bg-dark-2 border border-dark-5 rounded-xl text-sm text-content-1 focus:outline-none focus:border-accent-500/50"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex items-center bg-dark-3 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'text-accent-500' : 'text-content-3'
                }`}
              aria-label="Vista de cuadrícula"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'text-accent-500' : 'text-content-3'
                }`}
              aria-label="Vista de lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {initialProjects.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {initialProjects.map((project) => (
            <Link
              key={project.id as string}
              href={`/portfolio/${project.slug}`}
              className={`group ${viewMode === 'list'
                  ? 'flex items-center gap-4 p-4 bg-dark-2/50 rounded-xl border border-dark-5 hover:border-accent-500/30 transition-all'
                  : 'bg-dark-2/50 rounded-xl border border-dark-5 overflow-hidden hover:border-accent-500/30 transition-all hover:-translate-y-1'
                }`}
            >
              <div
                className={`relative overflow-hidden bg-dark-2 ${viewMode === 'grid'
                    ? 'aspect-[4/3] rounded-t-xl'
                    : 'w-32 h-24 rounded-lg flex-shrink-0'
                  }`}
              >
                {project.image ? (
                  <Image
                    src={project.image as string}
                    alt={project.title as string}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-dark-3 to-dark-2" />
                )}
              </div>
              <div className={viewMode === 'grid' ? 'p-4' : 'flex-1'}>
                <span className="text-xs text-accent-500 font-medium">
                  {(project.category as string) || 'Proyecto'}
                </span>
                <h3 className="text-sm font-medium text-content-1 mt-1 group-hover:text-accent-400 transition-colors truncate">
                  {project.title as string}
                </h3>
                {viewMode === 'list' &&
                  typeof project.description === 'string' &&
                  project.description && (
                    <p className="text-sm text-content-2 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Filter className="w-16 h-16 mx-auto text-content-3 mb-4" />
          <p className="text-content-2">No se encontraron proyectos</p>
          <p className="text-sm text-content-3 mt-1">
            Intenta cambiar los filtros o la categoría
          </p>
        </div>
      )}
    </div>
  );
}
