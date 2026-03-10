'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Upload, X, Image as ImageIcon, Plus, Loader2,
    Send, Save, Clock, ChevronDown, ChevronUp, Youtube, Box, Users, Tag, Wrench
} from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { getSupabaseClient } from '@/lib/supabase/client';
import { TagInput } from '@/components/ui/TagInput';
import { COMMON_TAGS } from '@/data/tags';

const CATEGORIES = [
    'Modelado 3D', 'Concept Art', 'Animación', 'Ilustración',
    'UI/UX Design', 'Environment Art', 'Character Design',
];

const SOFTWARE_OPTIONS = [
    'Photoshop', 'Illustrator', 'Figma', 'Blender',
    'After Effects', 'Cinema 4D', 'Maya', 'ZBrush',
    'Premiere Pro', 'Unity', 'Unreal Engine', 'Procreate'
];

export default function CreatePortfolioPage() {
    const router = useRouter();
    const { state, actions } = useAppStore();
    const user = state.user;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [software, setSoftware] = useState<string[]>([]);
    const [coverImage, setCoverImage] = useState<string>('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<{ file: File; preview: string }[]>([]);
    const [embeds, setEmbeds] = useState<{ type: 'youtube' | 'model3d'; url: string; embedUrl: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'published' | 'draft'>('published');
    const [collaborators, setCollaborators] = useState<string[]>([]);
    const [showYoutubeInput, setShowYoutubeInput] = useState(false);
    const [showModelInput, setShowModelInput] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [activeEmbeds, setActiveEmbeds] = useState<Set<number>>(new Set());
    const coverInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    if (!user) {
        return (
            <div className="min-h-screen bg-dark-0 flex flex-col items-center justify-center p-4">
                <ImageIcon className="w-16 h-16 text-accent-400 mb-4" />
                <h1 className="text-2xl font-bold text-content-1 mb-2">Inicia sesión</h1>
                <p className="text-content-3 mb-6 text-center">
                    Necesitas iniciar sesión para publicar un proyecto.
                </p>
                <Link
                    href="/login"
                    className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-xl transition-colors"
                >
                    Iniciar Sesión
                </Link>
            </div>
        );
    }

    const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            setCoverImage(URL.createObjectURL(file));
        }
    };

    const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newFiles = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setGalleryFiles(prev => [...prev, ...newFiles]);
    };

    const removeGalleryImage = (index: number) => {
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    };

    const moveGalleryImage = (index: number, dir: -1 | 1) => {
        setGalleryFiles(prev => {
            const arr = [...prev];
            const target = index + dir;
            if (target < 0 || target >= arr.length) return arr;
            [arr[index], arr[target]] = [arr[target], arr[index]];
            return arr;
        });
    };

    const removeEmbed = (index: number) => {
        setEmbeds(prev => prev.filter((_, i) => i !== index));
    };

    const moveEmbed = (index: number, dir: -1 | 1) => {
        setEmbeds(prev => {
            const arr = [...prev];
            const target = index + dir;
            if (target < 0 || target >= arr.length) return arr;
            [arr[index], arr[target]] = [arr[target], arr[index]];
            return arr;
        });
    };

    const extractYoutubeId = (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
            /(?:youtu\.be\/)([\w-]{11})/,
            /(?:youtube\.com\/embed\/)([\w-]{11})/,
            /(?:youtube\.com\/shorts\/)([\w-]{11})/,
        ];
        for (const p of patterns) {
            const m = url.match(p);
            if (m) return m[1];
        }
        return null;
    };

    const addYoutubeEmbed = () => {
        const videoId = extractYoutubeId(urlInput.trim());
        if (!videoId) return;
        setEmbeds(prev => [...prev, {
            type: 'youtube',
            url: urlInput.trim(),
            embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`,
        }]);
        setUrlInput('');
        setShowYoutubeInput(false);
    };

    const extractSketchfabId = (url: string): string | null => {
        const m = url.match(/sketchfab\.com\/3d-models\/[\w-]+-([a-f0-9]{32})/);
        return m ? m[1] : null;
    };

    const addModelEmbed = () => {
        const url = urlInput.trim();
        if (!url) return;
        const sketchfabId = extractSketchfabId(url);
        const embedUrl = sketchfabId
            ? `https://sketchfab.com/models/${sketchfabId}/embed`
            : url;
        setEmbeds(prev => [...prev, {
            type: 'model3d',
            url,
            embedUrl,
        }]);
        setUrlInput('');
        setShowModelInput(false);
    };

    const fileToDataUrl = (file: File): Promise<string> =>
        new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });

    const handleSubmit = async () => {
        if (!title.trim() || !category || (!coverFile && !coverImage)) return;
        setIsSubmitting(true);

        try {
            const supabase = getSupabaseClient();
            let imageUrl = coverImage;

            if (coverFile) {
                imageUrl = await fileToDataUrl(coverFile);
            }

            const galleryUrls: string[] = [];
            for (const item of galleryFiles) {
                const dataUrl = await fileToDataUrl(item.file);
                galleryUrls.push(dataUrl);
            }

            const newProject = {
                id: Date.now().toString(),
                title: title.trim(),
                description: description.trim(),
                image: imageUrl,
                images: galleryUrls,
                category,
                tags,
                software,
                authorId: user.id,
                artist: user.name,
                artistAvatar: user.avatar,
                artistRole: user.role,
                artistUsername: user.username,
                views: 0,
                likes: 0,
                createdAt: new Date().toISOString(),
                status: status as 'published' | 'draft',
            };

            const { data: inserted, error: insertError } = await supabase
                .from('projects')
                .insert({
                    title: newProject.title,
                    description: newProject.description,
                    image: newProject.image,
                    images: newProject.images,
                    category: newProject.category,
                    tags: newProject.tags,
                    software: newProject.software,
                    author_id: newProject.authorId,
                    artist: newProject.artist,
                    artist_avatar: newProject.artistAvatar,
                    artist_role: newProject.artistRole,
                    artist_username: newProject.artistUsername,
                    slug: `${newProject.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`,
                    status: newProject.status,
                } as never)
                .select()
                .single();

            if (insertError) {
                console.warn('Supabase insert error:', insertError);
            }

            const finalId = (inserted as unknown as { id: string })?.id ?? newProject.id;
            actions.addCreatedItem({ ...newProject, id: finalId });
            actions.showToast(
                status === 'draft' ? 'Borrador guardado' : 'Proyecto publicado exitosamente',
                'success'
            );

            router.refresh();
            router.push('/portfolio');
        } catch (error) {
            console.error('Error publishing project:', error);
            actions.showToast('Error al publicar el proyecto', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-0">
            {/* Header */}
            <div className="border-b border-dark-5/40">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center gap-4">
                    <Link
                        href="/portfolio"
                        className="flex items-center gap-2 text-content-3 hover:text-content-1 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Cancelar
                    </Link>
                    <span className="text-content-3">/</span>
                    <span className="text-content-1 font-semibold text-sm">Publicar en Portafolio</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

                    {/* ═══════════ LEFT COLUMN ═══════════ */}
                    <div className="space-y-8">

                        {/* Project Info Card */}
                        <div className="bg-dark-1 border border-dark-5/50 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1 h-5 rounded-full bg-accent-500" />
                                <span className="text-[11px] font-bold text-accent-400 uppercase tracking-wider">
                                    Información del Proyecto
                                </span>
                            </div>

                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Título del Proyecto"
                                className="w-full text-3xl font-bold text-content-1 bg-transparent placeholder:text-content-3/40 focus:outline-none mb-4"
                            />

                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe tu proceso, herramientas y objetivo..."
                                rows={3}
                                className="w-full text-sm text-content-2 bg-transparent placeholder:text-content-3/50 focus:outline-none resize-none leading-relaxed"
                            />
                        </div>

                        {/* Content / Media Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 rounded-full bg-accent-500" />
                                    <span className="text-[11px] font-bold text-accent-400 uppercase tracking-wider">
                                        Contenido del Proyecto
                                    </span>
                                </div>
                                <span className="text-xs text-content-3">
                                    {galleryFiles.length + embeds.length} {(galleryFiles.length + embeds.length) === 1 ? 'item' : 'items'}
                                </span>
                            </div>

                            {/* Gallery + Embeds preview */}
                            {(galleryFiles.length > 0 || embeds.length > 0) && (
                                <div className="space-y-4 mb-4">
                                    {/* Embeds — full width */}
                                    {embeds.map((embed, index) => (
                                        <div key={`embed-${index}`} className="relative rounded-xl overflow-hidden group aspect-video bg-dark-2 w-full">
                                            {embed.type === 'youtube' || activeEmbeds.has(index) ? (
                                                <iframe
                                                    src={embed.embedUrl}
                                                    className="w-full h-full border-0"
                                                    loading="lazy"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                                    allowFullScreen
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => setActiveEmbeds(prev => new Set(prev).add(index))}
                                                    className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-dark-2 to-dark-3 hover:from-dark-3 hover:to-dark-4 transition-colors cursor-pointer"
                                                >
                                                    <div className="w-16 h-16 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center">
                                                        <Box className="w-7 h-7 text-green-400" />
                                                    </div>
                                                    <span className="text-sm font-medium text-content-2">Click para cargar modelo 3D</span>
                                                    <span className="text-[10px] text-content-3">Sketchfab</span>
                                                </button>
                                            )}
                                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 rounded-lg text-[11px] font-bold text-white/90 uppercase tracking-wide">
                                                {embed.type === 'youtube' ? '▶ YouTube' : '🧊 3D'}
                                            </div>
                                            <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all z-10">
                                                {index > 0 && (
                                                    <button onClick={() => moveEmbed(index, -1)} className="p-1.5 bg-black/70 hover:bg-white/20 text-white rounded-lg" title="Subir">
                                                        <ChevronUp className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {index < embeds.length - 1 && (
                                                    <button onClick={() => moveEmbed(index, 1)} className="p-1.5 bg-black/70 hover:bg-white/20 text-white rounded-lg" title="Bajar">
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => removeEmbed(index)} className="p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-lg">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Images — grid */}
                                    {galleryFiles.length > 0 && (
                                        <div className="grid grid-cols-3 gap-3">
                                            {galleryFiles.map((item, index) => (
                                                <div key={`img-${index}`} className="relative rounded-xl overflow-hidden group aspect-video bg-dark-2">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={item.preview} alt="" className="w-full h-full object-cover" />
                                                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                                                        {index > 0 && (
                                                            <button onClick={() => moveGalleryImage(index, -1)} className="p-1 bg-black/70 hover:bg-white/20 text-white rounded" title="Mover izquierda">
                                                                <ChevronUp className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                        {index < galleryFiles.length - 1 && (
                                                            <button onClick={() => moveGalleryImage(index, 1)} className="p-1 bg-black/70 hover:bg-white/20 text-white rounded" title="Mover derecha">
                                                                <ChevronDown className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                        <button onClick={() => removeGalleryImage(index)} className="p-1 bg-black/70 hover:bg-red-600 text-white rounded">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* YouTube URL Input */}
                            {showYoutubeInput && (
                                <div className="bg-dark-1 border border-red-500/30 rounded-xl p-4 mb-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Youtube className="w-4 h-4 text-red-400" />
                                        <span className="text-sm font-medium text-content-1">Añadir video de YouTube</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            placeholder="https://youtube.com/watch?v=..."
                                            className="flex-1 h-9 px-3 text-sm bg-dark-2 border border-dark-5 rounded-lg text-content-1 placeholder:text-content-3 focus:outline-none focus:border-red-500/50"
                                            onKeyDown={(e) => e.key === 'Enter' && addYoutubeEmbed()}
                                            autoFocus
                                        />
                                        <button onClick={addYoutubeEmbed} className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-500">Añadir</button>
                                        <button onClick={() => { setShowYoutubeInput(false); setUrlInput(''); }} className="px-3 py-1.5 bg-dark-3 text-content-3 text-sm rounded-lg hover:text-content-1">Cancelar</button>
                                    </div>
                                </div>
                            )}

                            {/* 3D Model URL Input */}
                            {showModelInput && (
                                <div className="bg-dark-1 border border-green-500/30 rounded-xl p-4 mb-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Box className="w-4 h-4 text-green-400" />
                                        <span className="text-sm font-medium text-content-1">Añadir Modelo 3D</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            placeholder="https://sketchfab.com/3d-models/..."
                                            className="flex-1 h-9 px-3 text-sm bg-dark-2 border border-dark-5 rounded-lg text-content-1 placeholder:text-content-3 focus:outline-none focus:border-green-500/50"
                                            onKeyDown={(e) => e.key === 'Enter' && addModelEmbed()}
                                            autoFocus
                                        />
                                        <button onClick={addModelEmbed} className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500">Añadir</button>
                                        <button onClick={() => { setShowModelInput(false); setUrlInput(''); }} className="px-3 py-1.5 bg-dark-3 text-content-3 text-sm rounded-lg hover:text-content-1">Cancelar</button>
                                    </div>
                                </div>
                            )}

                            {/* Upload area */}
                            <div className="bg-dark-1 border border-dashed border-dark-5 rounded-2xl p-10 flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-dark-3 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-content-3" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-content-1">Añadir recursos multimedia</p>
                                    <p className="text-xs text-content-3 mt-0.5">Imágenes, Videos de YouTube o Modelos 3D</p>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <button
                                        onClick={() => galleryInputRef.current?.click()}
                                        className="px-4 py-2 text-sm font-medium bg-dark-2 border border-dark-5 rounded-lg text-content-1 hover:bg-dark-3 transition-colors flex items-center gap-2"
                                    >
                                        <ImageIcon className="w-4 h-4" /> Subir Imágenes
                                    </button>
                                    <button
                                        onClick={() => { setShowYoutubeInput(true); setShowModelInput(false); setUrlInput(''); }}
                                        className="px-4 py-2 text-sm font-medium bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-600/30 transition-colors flex items-center gap-2"
                                    >
                                        <Youtube className="w-4 h-4" /> YouTube
                                    </button>
                                    <button
                                        onClick={() => { setShowModelInput(true); setShowYoutubeInput(false); setUrlInput(''); }}
                                        className="px-4 py-2 text-sm font-medium bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-600/30 transition-colors flex items-center gap-2"
                                    >
                                        <Box className="w-4 h-4" /> Modelo 3D
                                    </button>
                                </div>
                            </div>

                            <input
                                ref={galleryInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleGallerySelect}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* ═══════════ RIGHT SIDEBAR ═══════════ */}
                    <div className="space-y-6">

                        {/* Publish Options */}
                        <div className="bg-dark-1 border border-dark-5/50 rounded-2xl p-5">
                            <h3 className="text-[11px] font-bold text-content-3 uppercase tracking-wider mb-4">
                                Opciones de Publicación
                            </h3>

                            {/* Status select */}
                            <label className="block text-[11px] font-semibold text-content-3 uppercase tracking-wider mb-1.5">
                                Estado
                            </label>
                            <div className="relative mb-4">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                                    className="w-full h-10 px-3 pr-8 bg-dark-2 border border-dark-5 rounded-lg text-sm text-content-1 appearance-none focus:outline-none focus:border-accent-500/50"
                                >
                                    <option value="published">Publicado</option>
                                    <option value="draft">Borrador</option>
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                                    {status === 'published' && <span className="w-2 h-2 rounded-full bg-green-500" />}
                                    <ChevronDown className="w-4 h-4 text-content-3" />
                                </div>
                            </div>

                            {/* Buttons */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !title.trim() || !category}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm mb-2"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
                                ) : (
                                    <><Send className="w-4 h-4" /> Publicar</>
                                )}
                            </button>
                            <button
                                onClick={() => { setStatus('draft'); handleSubmit(); }}
                                disabled={isSubmitting || !title.trim()}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-2 border border-dark-5 hover:bg-dark-3 disabled:opacity-50 text-content-1 font-medium rounded-xl transition-colors text-sm mb-3"
                            >
                                <Save className="w-4 h-4" /> Guardar Borrador
                            </button>
                            <div className="flex items-center justify-center gap-2 text-xs text-content-3">
                                <Clock className="w-3.5 h-3.5" /> Programar
                                <span className="px-1.5 py-0.5 bg-accent-500/20 text-accent-400 rounded text-[10px] font-bold">PRO</span>
                            </div>
                        </div>

                        {/* Cover / Thumbnail */}
                        <div className="bg-dark-1 border border-dark-5/50 rounded-2xl p-5">
                            <h3 className="text-[11px] font-bold text-content-3 uppercase tracking-wider mb-4">
                                Miniatura del Feed
                            </h3>
                            <div
                                onClick={() => thumbnailInputRef.current?.click()}
                                className="relative aspect-[4/3] rounded-xl overflow-hidden bg-dark-2 border border-dashed border-dark-5 cursor-pointer hover:border-accent-500/40 transition-colors group"
                            >
                                {coverImage ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={coverImage} alt="" className="w-full h-full object-cover" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setCoverImage(''); setCoverFile(null); }}
                                            className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                        <ImageIcon className="w-6 h-6 text-content-3/60" />
                                        <span className="text-xs text-content-3">Subir Cover</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-content-3/60 mt-3 leading-relaxed">
                                Esta imagen se usará como &quot;Portada&quot; cuando se muestre en
                                el Feed. Recomendado: <strong className="text-content-3">1600×900px</strong>. Es el balance ideal entre calidad y peso para el feed.
                            </p>
                            <input
                                ref={thumbnailInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleCoverSelect}
                                className="hidden"
                            />
                        </div>

                        {/* Category */}
                        <div className="bg-dark-1 border border-dark-5/50 rounded-2xl p-5">
                            <h3 className="text-[11px] font-bold text-content-3 uppercase tracking-wider mb-4">
                                Categoría
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(category === cat ? '' : cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${category === cat
                                            ? 'bg-accent-500/20 text-accent-400 border border-accent-500/40'
                                            : 'bg-dark-2 text-content-3 border border-dark-5 hover:text-content-1 hover:border-dark-6'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Software */}
                        <div className="bg-dark-1 border border-dark-5/50 rounded-2xl p-5">
                            <h3 className="text-[11px] font-bold text-content-3 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Wrench className="w-3.5 h-3.5" /> Software Usado
                            </h3>
                            <TagInput
                                tags={software}
                                onAddTag={(tag) => setSoftware(prev => [...prev, tag])}
                                onRemoveTag={(tag) => setSoftware(prev => prev.filter(t => t !== tag))}
                                suggestions={SOFTWARE_OPTIONS}
                                placeholder="+ Añadir Software"
                            />
                        </div>

                        {/* Tags */}
                        <div className="bg-dark-1 border border-dark-5/50 rounded-2xl p-5">
                            <h3 className="text-[11px] font-bold text-content-3 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" /> Etiquetas
                            </h3>
                            <TagInput
                                tags={tags}
                                onAddTag={(tag) => setTags(prev => [...prev, tag])}
                                onRemoveTag={(tag) => setTags(prev => prev.filter(t => t !== tag))}
                                suggestions={COMMON_TAGS}
                                placeholder="+ Añadir Etiquetas"
                            />
                        </div>

                        {/* Collaborators */}
                        <div className="bg-dark-1 border border-dark-5/50 rounded-2xl p-5">
                            <h3 className="text-[11px] font-bold text-content-3 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" /> Colaboradores
                            </h3>
                            <TagInput
                                tags={collaborators}
                                onAddTag={(tag) => setCollaborators(prev => [...prev, tag])}
                                onRemoveTag={(tag) => setCollaborators(prev => prev.filter(t => t !== tag))}
                                suggestions={[]}
                                placeholder="+ Etiquetar perfil"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
