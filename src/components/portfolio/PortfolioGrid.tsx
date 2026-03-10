'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Grid, List, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/hooks/useAppStore';

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

/* Cinematic spring config for smooth movement */
const smoothSpring = { type: 'spring' as const, stiffness: 120, damping: 20 };
const gentleSpring = { type: 'spring' as const, stiffness: 100, damping: 18 };

/* ---- Individual Card with Framer Motion ---- */
function PortfolioCard({ project }: { project: Record<string, unknown> }) {
  const [hovered, setHovered] = useState(false);
  const { state, actions } = useAppStore();
  const saved = state.savedItems.some(s => s.id === String(project.id));

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    actions.toggleSave({
      id: String(project.id),
      title: String(project.title || ''),
      image: String(project.image || ''),
      slug: String(project.slug || ''),
    });
  };

  return (
    <motion.div
      className="relative rounded-xl overflow-hidden cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/portfolio/${project.slug}`} className="block">
        <div className="relative aspect-[4/5] bg-dark-2 overflow-hidden rounded-xl">
          {/* Image with cinematic zoom */}
          {project.image ? (
            <motion.div
              className="absolute inset-0"
              animate={{ scale: hovered ? 1.06 : 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Image
                src={project.image as string}
                alt={project.title as string}
                fill
                className="object-cover"
                unoptimized
              />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-dark-3 to-dark-2" />
          )}

          {/* Gradient overlay — fades in on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.05) 70%, transparent 100%)',
            }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          {/* Bookmark button — slides down from top */}
          <motion.button
            onClick={handleSave}
            className={`absolute top-3 right-3 z-20 p-2.5 rounded-full backdrop-blur-md transition-colors ${saved ? 'bg-amber-500/80 text-white' : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/60'}`}
            animate={{
              opacity: hovered || saved ? 1 : 0,
              y: hovered || saved ? 0 : -10,
            }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: hovered ? 0.1 : 0 }}
            aria-label={saved ? 'Quitar de guardados' : 'Guardar en colección'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </motion.button>

          {/* Title — slides up from bottom with spring */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-5">
            <motion.h3
              className="text-base font-semibold text-white leading-snug truncate"
              animate={{
                y: hovered ? 0 : 24,
                opacity: hovered ? 1 : 0,
              }}
              transition={{
                ...smoothSpring,
                delay: hovered ? 0.05 : 0,
                opacity: { duration: 0.3, ease: 'easeOut', delay: hovered ? 0.05 : 0 },
              }}
            >
              {project.title as string}
            </motion.h3>

            {/* Author — slides up with slight delay for stagger */}
            <motion.div
              className="flex items-center gap-2 mt-2"
              animate={{
                y: hovered ? 0 : 20,
                opacity: hovered ? 1 : 0,
              }}
              transition={{
                ...gentleSpring,
                delay: hovered ? 0.12 : 0,
                opacity: { duration: 0.3, ease: 'easeOut', delay: hovered ? 0.12 : 0 },
              }}
            >
              <div className="w-6 h-6 rounded-full bg-white/20 overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                {project.artist_avatar ? (
                  <Image
                    src={project.artist_avatar as string}
                    alt={(project.artist as string) || ''}
                    width={24}
                    height={24}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] text-white font-medium">
                    {(project.artist as string)?.charAt(0) || 'A'}
                  </div>
                )}
              </div>
              <span className="text-sm text-white/80 truncate">
                {(project.artist as string) || 'Artista'}
              </span>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ---- Main Grid ---- */
export function PortfolioGrid({
  initialProjects,
  initialCategory = 'all',
  initialSort = 'date',
}: PortfolioGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state } = useAppStore();

  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const allProjects = useMemo(() => {
    const localItems = (state.createdItems || []).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      image: item.image,
      images: item.images,
      category: item.category,
      tags: item.tags,
      slug: `${item.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${item.id}`,
      artist: item.artist,
      artist_avatar: item.artistAvatar,
      likes: item.likes || 0,
      views: item.views || 0,
      created_at: item.createdAt,
      status: 'published',
    }));

    const existingIds = new Set(initialProjects.map((p) => String(p.id)));
    const uniqueLocal = localItems.filter((p) => !existingIds.has(String(p.id)));
    return [...uniqueLocal, ...initialProjects];
  }, [initialProjects, state.createdItems]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory === 'all') params.delete('category');
    else params.set('category', newCategory);
    router.push(`/portfolio?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === 'date') params.delete('sort');
    else params.set('sort', newSort);
    router.push(`/portfolio?${params.toString()}`);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
      {allProjects.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
              : 'space-y-4'
          }
        >
          {allProjects.map((project) =>
            viewMode === 'grid' ? (
              <PortfolioCard key={project.id as string} project={project} />
            ) : (
              <Link
                key={project.id as string}
                href={`/portfolio/${project.slug}`}
                className="flex items-center gap-4 p-4 bg-dark-2/50 rounded-xl border border-dark-5 hover:border-accent-500/30 transition-all"
              >
                <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-dark-2">
                  {project.image ? (
                    <Image
                      src={project.image as string}
                      alt={project.title as string}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-dark-3 to-dark-2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-accent-500 font-medium">
                    {(project.category as string) || 'Proyecto'}
                  </span>
                  <h3 className="text-sm font-medium text-content-1 mt-1 hover:text-accent-400 transition-colors truncate">
                    {project.title as string}
                  </h3>
                  {typeof project.description === 'string' && project.description && (
                    <p className="text-sm text-content-2 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
              </Link>
            )
          )}
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
