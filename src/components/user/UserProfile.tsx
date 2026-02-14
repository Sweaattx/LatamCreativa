'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MapPin,
  LinkIcon,
  Calendar,
  Users,
  Grid,
  FileText,
  Settings,
} from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';

interface UserProfileProps {
  user: Record<string, unknown>;
  projects: Record<string, unknown>[];
  articles: Record<string, unknown>[];
  stats: {
    followers: number;
    following: number;
    projects: number;
  };
}

export function UserProfile({
  user,
  projects,
  articles,
  stats,
}: UserProfileProps) {
  const { state } = useAppStore();
  const [activeTab, setActiveTab] = useState<'projects' | 'articles'>('projects');

  const isOwnProfile = state.user?.id === user.id;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-LA', {
      year: 'numeric',
      month: 'long',
    });
  };

  const socialLinks = (user.social_links as Record<string, string>) || {};

  return (
    <main className="min-h-screen bg-dark-950">
      {/* Cover Image */}
      <div className="h-48 sm:h-64 relative bg-gradient-to-br from-amber-500/20 to-orange-600/20">
        {typeof user.cover_image === 'string' && user.cover_image && (
          <Image
            src={user.cover_image}
            alt="Portada"
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative -mt-16 sm:-mt-20 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-end gap-4"
          >
            {/* Avatar */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden bg-neutral-800 ring-4 ring-dark-950">
              {user.avatar ? (
                <Image
                  src={user.avatar as string}
                  alt={user.name as string}
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-4xl font-bold">
                  {(user.name as string)?.charAt(0) || '?'}
                </div>
              )}
            </div>

            {/* Name & Actions */}
            <div className="flex-1 sm:pb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {user.name as string}
              </h1>
              {typeof user.username === 'string' && user.username && (
                <p className="text-neutral-500">@{user.username}</p>
              )}
              {typeof user.role === 'string' && user.role && (
                <p className="text-amber-500 font-medium mt-1">
                  {user.role}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <Link
                  href="/settings"
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Editar perfil
                </Link>
              ) : (
                <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium rounded-lg transition-colors">
                  Seguir
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-6 mb-6 text-sm"
        >
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Users className="w-4 h-4" />
            <span className="text-white font-medium">{stats.followers}</span>
            <span>seguidores</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="text-white font-medium">{stats.following}</span>
            <span>siguiendo</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Grid className="w-4 h-4" />
            <span className="text-white font-medium">{stats.projects}</span>
            <span>proyectos</span>
          </div>
        </motion.div>

        {/* Bio & Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
        >
          <div className="lg:col-span-2">
            {typeof user.bio === 'string' && user.bio && (
              <p className="text-neutral-300 whitespace-pre-wrap mb-4">
                {user.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
              {typeof user.location === 'string' && user.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </span>
              )}
              {typeof user.created_at === 'string' && user.created_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Se unió en {formatDate(user.created_at)}
                </span>
              )}
            </div>

            {/* Social Links */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    {platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Skills */}
          {Array.isArray(user.skills) && user.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-3">
                Habilidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {(user.skills as string[]).map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-neutral-800 text-neutral-300 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="border-b border-neutral-800 mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'projects'
                  ? 'text-amber-500 border-amber-500'
                  : 'text-neutral-400 border-transparent hover:text-white'
                }`}
            >
              <Grid className="w-4 h-4 inline-block mr-2" />
              Proyectos ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'articles'
                  ? 'text-amber-500 border-amber-500'
                  : 'text-neutral-400 border-transparent hover:text-white'
                }`}
            >
              <FileText className="w-4 h-4 inline-block mr-2" />
              Artículos ({articles.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={activeTab}
          className="pb-12"
        >
          {activeTab === 'projects' ? (
            projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Link
                    key={project.id as string}
                    href={`/portfolio/${project.slug}`}
                    className="group"
                  >
                    <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-neutral-900">
                      {project.image ? (
                        <Image
                          src={project.image as string}
                          alt={project.title as string}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
                      )}
                    </div>
                    <h3 className="mt-3 text-sm font-medium text-white group-hover:text-amber-500 transition-colors truncate">
                      {project.title as string}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {project.category as string || 'Proyecto'}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Grid className="w-12 h-12 mx-auto text-neutral-600 mb-4" />
                <p className="text-neutral-400">
                  {isOwnProfile
                    ? 'Aún no has publicado proyectos'
                    : 'Este usuario aún no tiene proyectos'}
                </p>
              </div>
            )
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <Link
                  key={article.id as string}
                  href={`/blog/${article.slug}`}
                  className="group flex gap-4"
                >
                  <div className="w-32 h-24 relative rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                    {article.image ? (
                      <Image
                        src={article.image as string}
                        alt={article.title as string}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-amber-500">
                      {article.category as string || 'Artículo'}
                    </span>
                    <h3 className="text-sm font-medium text-white group-hover:text-amber-500 transition-colors line-clamp-2">
                      {article.title as string}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-neutral-600 mb-4" />
              <p className="text-neutral-400">
                {isOwnProfile
                  ? 'Aún no has escrito artículos'
                  : 'Este usuario aún no tiene artículos'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
