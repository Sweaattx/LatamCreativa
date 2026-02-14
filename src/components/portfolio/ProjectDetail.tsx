'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Heart,
  Eye,
  Share2,
  Bookmark,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { PortfolioItem } from '@/types/content';

// Tipos específicos para el componente
interface ProjectAuthor {
  id: string;
  username?: string;
  name?: string;
  avatar?: string;
  role?: string;
}

interface ProjectDetailProps {
  project: PortfolioItem;
  author: ProjectAuthor | null;
  relatedProjects: PortfolioItem[];
}

export function ProjectDetail({
  project,
  author,
  relatedProjects,
}: ProjectDetailProps) {
  const { state } = useAppStore();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    typeof project.likes === 'number' ? project.likes : 0
  );

  const handleLike = async () => {
    if (!state.user) return;

    const supabase = getSupabaseClient();

    if (liked) {
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', state.user.id)
        .eq('target_id', project.id)
        .eq('target_type', 'project');
      setLikeCount((prev) => prev - 1);
    } else {
      await supabase.from('likes').insert({
        user_id: state.user.id,
        target_id: project.id,
        target_type: 'project',
      } as never);
      setLikeCount((prev) => prev + 1);
    }
    setLiked(!liked);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: project.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('URL copiada al portapapeles');
    }
  };

  // Preparar galería de medios
  const gallery = project.gallery || [];
  const images = project.images || [];
  const allMedia = gallery.length > 0
    ? gallery.map(item => ({ type: item.type || 'image', url: item.url, caption: item.caption || '' }))
    : images.map(url => ({ type: 'image', url, caption: '' }));

  const hasGallery = allMedia.length > 0;

  return (
    <main className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-dark-950/80 backdrop-blur-lg border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/portfolio"
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`p-2 rounded-lg transition-colors ${liked
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              aria-label={liked ? 'Quitar me gusta' : 'Dar me gusta'}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-video relative rounded-xl overflow-hidden bg-neutral-900"
            >
              {project.image ? (
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
              )}
            </motion.div>

            {/* Gallery */}
            {hasGallery && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {allMedia.map((item, index) => (
                  <div
                    key={index}
                    className="aspect-video relative rounded-lg overflow-hidden bg-neutral-900 cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all"
                  >
                    <Image
                      src={item.url}
                      alt={`${project.title} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-white mb-4">Descripción</h2>
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-neutral-300 whitespace-pre-wrap">
                  {project.description || 'Sin descripción disponible.'}
                </p>
              </div>
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-white mb-4">Etiquetas</h2>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
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
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Project Info */}
            <div className="bg-neutral-900 rounded-xl p-6">
              <h1 className="text-xl font-bold text-white mb-2">
                {project.title}
              </h1>
              <p className="text-sm text-amber-500 mb-4">
                {project.category || 'Proyecto'}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-neutral-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {project.views || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />0
                </span>
              </div>
            </div>

            {/* Author */}
            {author && (
              <div className="bg-neutral-900 rounded-xl p-6">
                <h2 className="text-sm font-medium text-neutral-400 mb-4">
                  Creado por
                </h2>
                <Link
                  href={`/user/${author.username || author.id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800">
                    {author.avatar ? (
                      <Image
                        src={author.avatar}
                        alt={author.name || 'Autor'}
                        width={48}
                        height={48}
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                        {author.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium group-hover:text-amber-500 transition-colors">
                      {author.name || 'Anónimo'}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {author.role || 'Creativo'}
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* Tools */}
            {project.tools && project.tools.length > 0 && (
              <div className="bg-neutral-900 rounded-xl p-6">
                <h2 className="text-sm font-medium text-neutral-400 mb-4">
                  Herramientas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1 bg-neutral-800 text-neutral-300 text-sm rounded-lg"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Projects */}
            {relatedProjects.length > 0 && (
              <div className="bg-neutral-900 rounded-xl p-6">
                <h2 className="text-sm font-medium text-neutral-400 mb-4">
                  Proyectos relacionados
                </h2>
                <div className="space-y-3">
                  {relatedProjects.map((related) => (
                    <Link
                      key={related.id}
                      href={`/portfolio/${related.slug}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-16 h-12 rounded-md overflow-hidden bg-neutral-800 flex-shrink-0">
                        {related.image ? (
                          <Image
                            src={related.image}
                            alt={related.title}
                            width={64}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-800" />
                        )}
                      </div>
                      <p className="text-sm text-white group-hover:text-amber-500 transition-colors line-clamp-2">
                        {related.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
