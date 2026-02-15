'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  ArrowLeft, MessageSquare, Eye, Heart, Share2,
  Clock, Send, Bookmark
} from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { useForumThread, useForumReplies, useAddReply } from '@/hooks/useForumHooks';
import { ReplyCard } from '@/components/forum/ReplyCard';
import { getCategoryById, CATEGORY_COLOR_CLASSES } from '@/data/forumCategories';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

// Heavy TipTap editor loaded on demand (only when user clicks Reply)
const ForumEditor = dynamic(
  () => import('@/components/forum/ForumEditor').then(m => ({ default: m.ForumEditor })),
  { ssr: false, loading: () => <div className="h-[120px] bg-neutral-800/50 rounded-lg animate-pulse" /> }
);

export default function ThreadDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { state } = useAppStore();

  const { thread, loading: threadLoading, error: threadError } = useForumThread(slug);
  const { replies, loading: repliesLoading, refresh: refreshReplies } = useForumReplies(thread?.id);
  const { addReply, loading: replyLoading } = useAddReply();

  const [replyContent, setReplyContent] = useState('');
  const [showEditor, setShowEditor] = useState(false);

  const handleSubmitReply = async () => {
    if (!thread || !replyContent.trim() || !state.user) return;

    const success = await addReply(thread.id, replyContent);
    if (success) {
      setReplyContent('');
      setShowEditor(false);
      refreshReplies();
    }
  };

  if (threadLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (threadError || !thread) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <MessageSquare className="w-16 h-16 text-neutral-600 mb-4" />
        <p className="text-neutral-400 mb-4">Tema no encontrado</p>
        <Link href="/forum" className="text-indigo-400 hover:underline">
          Volver al foro
        </Link>
      </div>
    );
  }

  const category = getCategoryById(thread.category);
  const colorClasses = CATEGORY_COLOR_CLASSES[category?.color || 'gray'];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-white/5 bg-neutral-900/30">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-4">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al foro
          </Link>

          {/* Category Badge */}
          {category && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses.bg} ${colorClasses.text} mb-4`}>
              {category.name}
            </span>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {thread.title}
          </h1>

          {/* Author & Stats */}
          <div className="flex items-center gap-4 text-sm text-neutral-400">
            <div className="flex items-center gap-2">
              <Image
                src={thread.authorAvatar || `https://ui-avatars.com/api/?name=${thread.authorName}`}
                alt={thread.authorName}
                width={32}
                height={32}
                className="rounded-full"
                unoptimized
              />
              <span className="text-white">{thread.authorName}</span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(thread.createdAt).toLocaleDateString('es-LA')}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {thread.views}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {thread.replyCount || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        {/* Thread Content */}
        <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6 mb-8">
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(thread.content) }}
          />

          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-neutral-800">
              {thread.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-neutral-800 text-neutral-400 text-xs rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-neutral-800">
            <button className="flex items-center gap-2 text-neutral-400 hover:text-red-400 transition-colors">
              <Heart className="w-5 h-5" />
              <span>{thread.likes}</span>
            </button>
            <button className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
              Compartir
            </button>
            <button className="flex items-center gap-2 text-neutral-400 hover:text-amber-400 transition-colors">
              <Bookmark className="w-5 h-5" />
              Guardar
            </button>
          </div>
        </div>

        {/* Replies Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Respuestas ({replies.length})
            </h2>
          </div>

          {/* Reply Input */}
          {state.user ? (
            <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-4">
              {showEditor ? (
                <div className="space-y-4">
                  <ForumEditor
                    value={replyContent}
                    onChange={setReplyContent}
                    placeholder="Escribe tu respuesta..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowEditor(false)}
                      className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmitReply}
                      disabled={!replyContent.trim() || replyLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      {replyLoading ? 'Enviando...' : 'Responder'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowEditor(true)}
                  className="w-full text-left p-3 text-neutral-500 hover:text-neutral-300 bg-neutral-800/50 rounded-lg transition-colors"
                >
                  Escribe una respuesta...
                </button>
              )}
            </div>
          ) : (
            <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6 text-center">
              <p className="text-neutral-400 mb-4">Inicia sesión para responder</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
          )}

          {/* Replies List */}
          {repliesLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              No hay respuestas aún. ¡Sé el primero en responder!
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => (
                <ReplyCard
                  key={reply.id}
                  reply={reply}
                  threadAuthorId={thread.authorId}
                  isThreadAuthor={state.user?.uid === thread.authorId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
