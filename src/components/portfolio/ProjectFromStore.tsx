'use client';

import { useAppStore } from '@/hooks/useAppStore';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Eye, Heart, Share2, Bookmark, Tag } from 'lucide-react';

interface ProjectFromStoreProps {
    slug: string;
}

export function ProjectFromStore({ slug }: ProjectFromStoreProps) {
    const { state, actions } = useAppStore();

    const handleShare = async () => {
        try {
            const url = window.location.href;
            if (navigator.share) {
                await navigator.share({ title: project?.title || '', url });
            } else {
                await navigator.clipboard.writeText(url);
                actions.showToast('URL copiada al portapapeles', 'success');
            }
        } catch { /* cancelled */ }
    };

    // Find project in local store by matching slug pattern
    const project = (state.createdItems || []).find((item) => {
        const itemSlug = `${item.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${item.id}`;
        return itemSlug === slug || item.id === slug;
    });

    if (!project) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-dark-0">
            {/* Header */}
            <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-8">
                <Link
                    href="/portfolio"
                    className="inline-flex items-center gap-2 text-content-3 hover:text-content-1 transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al portafolio
                </Link>
            </div>

            {/* Main Image */}
            {project.image && (
                <div className="relative w-full max-w-6xl mx-auto aspect-video mb-8 rounded-2xl overflow-hidden">
                    <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
            )}

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-16">
                {/* Category */}
                {project.category && (
                    <span className="inline-block px-3 py-1 bg-accent-500/10 text-accent-400 text-sm font-medium rounded-full mb-4">
                        {project.category}
                    </span>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-content-1 mb-4 leading-tight">
                    {project.title}
                </h1>

                {/* Author */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 font-medium overflow-hidden">
                        {project.artistAvatar ? (
                            <Image src={project.artistAvatar} alt={project.artist || ''} width={40} height={40} className="object-cover" unoptimized />
                        ) : (
                            project.artist?.charAt(0) || 'A'
                        )}
                    </div>
                    <div>
                        <p className="text-content-1 font-medium">{project.artist || 'Artista'}</p>
                        <p className="text-sm text-content-3">{project.artistRole || 'Creativo'}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-dark-5/50">
                    <span className="flex items-center gap-2 text-sm text-content-3">
                        <Eye className="w-4 h-4" />
                        {project.views || 0} vistas
                    </span>
                    <span className="flex items-center gap-2 text-sm text-content-3">
                        <Heart className="w-4 h-4" />
                        {project.likes || 0} me gusta
                    </span>
                </div>

                {/* Description */}
                {project.description && (
                    <div className="mb-8">
                        <h2 className="text-lg font-medium text-content-1 mb-3">Descripción</h2>
                        <p className="text-content-2 leading-relaxed whitespace-pre-wrap">
                            {project.description}
                        </p>
                    </div>
                )}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                    <div className="mb-8">
                        <h3 className="flex items-center gap-2 text-sm font-medium text-content-1 mb-3">
                            <Tag className="w-4 h-4" />
                            Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-dark-3 text-content-3 text-sm rounded-lg"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Gallery */}
                {project.images && project.images.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-medium text-content-1 mb-4">Galería</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {project.images.map((img, i) => (
                                <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-dark-2">
                                    <Image src={img} alt={`${project.title} - ${i + 1}`} fill className="object-cover" unoptimized />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-8 border-t border-dark-5/50">
                    {(() => {
                        const isLiked = state.likedItems.includes(project.id);
                        const isSaved = state.savedItems.some(s => s.id === project.id);
                        return (
                            <>
                                <button
                                    onClick={() => actions.toggleLike(project.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${isLiked ? 'bg-red-500/10 text-red-500' : 'bg-dark-3 hover:bg-dark-4 text-content-2'}`}
                                >
                                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                    {isLiked ? 'Te gusta' : 'Me gusta'}
                                </button>
                                <button
                                    onClick={() => actions.toggleSave({ id: project.id, title: project.title || '', image: project.image || '', slug })}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${isSaved ? 'bg-amber-500/10 text-amber-500' : 'bg-dark-3 hover:bg-dark-4 text-content-2'}`}
                                >
                                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                    {isSaved ? 'Guardado' : 'Guardar'}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 px-4 py-2 bg-dark-3 hover:bg-dark-4 rounded-xl text-content-2 transition-colors ml-auto"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Compartir
                                </button>
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
