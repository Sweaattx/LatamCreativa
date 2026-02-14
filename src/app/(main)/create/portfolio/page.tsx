'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Image as ImageIcon, Plus, Loader2, Eye, Send } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { getSupabaseClient } from '@/lib/supabase/client';
import { TagInput } from '@/components/ui/TagInput';
import { COMMON_TAGS } from '@/data/tags';

const CATEGORIES = [
    'Ilustración', '3D', 'Diseño UI/UX', 'Motion Design',
    'Fotografía', 'Branding', 'Arte Conceptual', 'Tipografía',
    'Arte Digital', 'Videojuegos', 'Animación', 'Desarrollo Web'
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
                <ImageIcon className="w-16 h-16 text-amber-400 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Inicia sesión</h1>
                <p className="text-neutral-400 mb-6 text-center">
                    Necesitas iniciar sesión para publicar un proyecto.
                </p>
                <Link
                    href="/login"
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-xl transition-colors"
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
            const url = URL.createObjectURL(file);
            setCoverImage(url);
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

    const handleSubmit = async () => {
        if (!title.trim() || !category || (!coverFile && !coverImage)) return;
        setIsSubmitting(true);

        try {
            const supabase = getSupabaseClient();
            let imageUrl = coverImage;

            // Upload cover image
            if (coverFile) {
                const fileName = `portfolio/${user.id}/${Date.now()}_${coverFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('portfolio')
                    .upload(fileName, coverFile);

                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
            }

            // Upload gallery images
            const galleryUrls: string[] = [];
            for (const item of galleryFiles) {
                const fileName = `portfolio/${user.id}/gallery/${Date.now()}_${item.file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('portfolio')
                    .upload(fileName, item.file);

                if (!uploadError) {
                    const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(fileName);
                    galleryUrls.push(urlData.publicUrl);
                }
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
                status: 'published' as const,
            };

            // Try to save to Supabase
            const { data: inserted, error: insertError } = await supabase
                .from('portfolio')
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
                    status: 'published',
                } as never)
                .select()
                .single();

            if (insertError) {
                console.warn('Supabase insert error (portfolio table may not exist):', insertError);
            }

            const finalId = (inserted as unknown as { id: string })?.id ?? newProject.id;
            actions.addCreatedItem({ ...newProject, id: finalId });
            actions.showToast('Proyecto publicado exitosamente', 'success');

            router.push('/portfolio');
        } catch (error) {
            console.error('Error publishing project:', error);
            actions.showToast('Error al publicar el proyecto', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
                <Link
                    href="/portfolio"
                    className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al portafolio
                </Link>

                <h1 className="text-3xl font-bold text-white mb-8">Publicar proyecto</h1>

                <div className="space-y-6">
                    {/* Cover Image */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Imagen de portada *
                        </label>
                        {coverImage ? (
                            <div className="relative rounded-xl overflow-hidden group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={coverImage} alt="Cover" className="w-full h-64 object-cover" />
                                <button
                                    onClick={() => { setCoverImage(''); setCoverFile(null); }}
                                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => coverInputRef.current?.click()}
                                className="w-full h-64 border-2 border-dashed border-neutral-700 hover:border-amber-500/50 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors"
                            >
                                <Upload className="w-8 h-8 text-neutral-500" />
                                <span className="text-neutral-400 text-sm">Arrastra o haz clic para subir</span>
                                <span className="text-neutral-600 text-xs">JPG, PNG, WEBP — máx. 10MB</span>
                            </button>
                        )}
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Título del proyecto *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nombre de tu proyecto..."
                            className="w-full h-12 px-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Descripción
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe tu proyecto, proceso creativo, inspiración..."
                            rows={4}
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Categoría *
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === cat
                                            ? 'bg-amber-500 text-black'
                                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Etiquetas
                        </label>
                        <TagInput
                            tags={tags}
                            onAddTag={(tag) => setTags(prev => [...prev, tag])}
                            onRemoveTag={(tag) => setTags(prev => prev.filter(t => t !== tag))}
                            suggestions={COMMON_TAGS}
                            placeholder="Añade etiquetas..."
                        />
                    </div>

                    {/* Software */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Software utilizado
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {SOFTWARE_OPTIONS.map(sw => (
                                <button
                                    key={sw}
                                    onClick={() => {
                                        setSoftware(prev =>
                                            prev.includes(sw) ? prev.filter(s => s !== sw) : [...prev, sw]
                                        );
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${software.includes(sw)
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white border border-transparent'
                                        }`}
                                >
                                    {sw}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gallery */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Galería adicional
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {galleryFiles.map((item, index) => (
                                <div key={index} className="relative rounded-xl overflow-hidden group aspect-square">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.preview} alt="" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeGalleryImage(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => galleryInputRef.current?.click()}
                                className="aspect-square border-2 border-dashed border-neutral-700 hover:border-amber-500/50 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors"
                            >
                                <Plus className="w-5 h-5 text-neutral-500" />
                                <span className="text-neutral-500 text-xs">Agregar</span>
                            </button>
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

                    {/* Submit */}
                    <div className="flex gap-4 pt-4 border-t border-neutral-800">
                        <Link
                            href="/portfolio"
                            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !title.trim() || !category || (!coverFile && !coverImage)}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-colors"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Publicando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Publicar proyecto
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
