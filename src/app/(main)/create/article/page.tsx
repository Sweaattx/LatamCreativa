'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, FileText, Loader2, Send } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { getSupabaseClient } from '@/lib/supabase/client';
import { TagInput } from '@/components/ui/TagInput';
import { COMMON_TAGS } from '@/data/tags';

const ARTICLE_CATEGORIES = [
    'Tutorial', 'Opinión', 'Recursos', 'Inspiración',
    'Noticias', 'Entrevista', 'Proceso Creativo', 'Tecnología',
    'Diseño', 'Desarrollo', 'Carrera Profesional', 'General'
];

export default function CreateArticlePage() {
    const router = useRouter();
    const { state, actions } = useAppStore();
    const user = state.user;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('General');
    const [tags, setTags] = useState<string[]>([]);
    const [coverImage, setCoverImage] = useState<string>('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
                <FileText className="w-16 h-16 text-amber-400 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Inicia sesión</h1>
                <p className="text-neutral-400 mb-6 text-center">
                    Necesitas iniciar sesión para publicar un artículo.
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

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) return;
        setIsSubmitting(true);

        try {
            const supabase = getSupabaseClient();
            let imageUrl = coverImage;

            // Upload cover image if provided
            if (coverFile) {
                const fileName = `blog-covers/${Date.now()}_${coverFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('blog-covers')
                    .upload(fileName, coverFile);

                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('blog-covers').getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
            } else if (!coverImage) {
                imageUrl = 'https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=1000&auto=format&fit=crop';
            }

            const newArticle = {
                id: Date.now().toString(),
                title: title.trim(),
                content: content.trim(),
                excerpt: content.substring(0, 120) + '...',
                image: imageUrl,
                author: user.name,
                authorId: user.id,
                authorAvatar: user.avatar || '',
                role: user.role || 'Miembro',
                date: new Date().toISOString(),
                readTime: `${Math.max(1, Math.ceil(content.split(' ').length / 200))} min`,
                likes: 0,
                comments: 0,
                tags,
                category,
            };

            // Save to Supabase
            const { data: inserted, error: insertError } = await supabase
                .from('articles')
                .insert({
                    title: newArticle.title,
                    content: newArticle.content,
                    excerpt: newArticle.excerpt,
                    author: newArticle.author,
                    author_id: newArticle.authorId,
                    author_avatar: newArticle.authorAvatar,
                    date: newArticle.date,
                    image: newArticle.image,
                    tags: newArticle.tags,
                    category: newArticle.category,
                    slug: `${newArticle.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`,
                } as never)
                .select()
                .single();

            if (insertError) throw insertError;

            const finalId = (inserted as unknown as { id: string })?.id ?? newArticle.id;
            actions.addBlogPost({ ...newArticle, id: finalId });
            actions.showToast('Artículo publicado exitosamente', 'success');

            router.push('/blog');
        } catch (error) {
            console.error('Error publishing article:', error);
            actions.showToast('Error al publicar el artículo', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al blog
                </Link>

                <h1 className="text-3xl font-bold text-white mb-8">Escribir artículo</h1>

                <div className="space-y-6">
                    {/* Cover Image */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Imagen de portada
                        </label>
                        {coverImage ? (
                            <div className="relative rounded-xl overflow-hidden group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={coverImage} alt="Cover" className="w-full h-52 object-cover" />
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
                                className="w-full h-52 border-2 border-dashed border-neutral-700 hover:border-amber-500/50 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors"
                            >
                                <Upload className="w-8 h-8 text-neutral-500" />
                                <span className="text-neutral-400 text-sm">Arrastra o haz clic para subir</span>
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
                            Título *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="El título de tu artículo..."
                            className="w-full h-12 px-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-lg placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Categoría
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full h-12 px-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                        >
                            {ARTICLE_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Contenido *
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Escribe tu artículo aquí..."
                            rows={12}
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors resize-none leading-relaxed"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                            {content.split(' ').filter(Boolean).length} palabras · ~{Math.max(1, Math.ceil(content.split(' ').filter(Boolean).length / 200))} min de lectura
                        </p>
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

                    {/* Submit */}
                    <div className="flex gap-4 pt-4 border-t border-neutral-800">
                        <Link
                            href="/blog"
                            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !title.trim() || !content.trim()}
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
                                    Publicar artículo
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
