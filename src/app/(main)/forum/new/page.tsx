'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { useCreateThread } from '@/hooks/useForumHooks';
import { FORUM_CATEGORIES } from '@/data/forumCategories';

// Heavy TipTap editor loaded on demand
const ForumEditor = dynamic(
  () => import('@/components/forum/ForumEditor').then(m => ({ default: m.ForumEditor })),
  { ssr: false, loading: () => <div className="h-[250px] bg-neutral-800/50 rounded-lg animate-pulse" /> }
);

export default function NewThreadPage() {
  const router = useRouter();
  const { state } = useAppStore();
  const { create: createThread, loading, error } = useCreateThread();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !category) return;

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

    const result = await createThread({
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tagList
    });

    if (result) {
      router.push(`/forum/${result.slug || result.id}`);
    }
  };

  if (!state.user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-amber-400 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Inicia sesión</h1>
        <p className="text-neutral-400 mb-6 text-center">
          Necesitas iniciar sesión para crear un nuevo tema en el foro.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-xl transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al foro
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8">Crear nuevo tema</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Título del tema *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escribe un título descriptivo..."
              className="w-full h-12 px-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Categoría *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-12 px-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              required
            >
              <option value="">Selecciona una categoría</option>
              {FORUM_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Tags (separados por coma)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="blender, modelado, tutorial..."
              className="w-full h-12 px-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Contenido *
            </label>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <ForumEditor
                value={content}
                onChange={setContent}
                placeholder="Describe tu pregunta o tema en detalle..."
                minHeight="250px"
                category={category}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Link
              href="/forum"
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim() || !category}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Publicando...' : 'Publicar tema'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
