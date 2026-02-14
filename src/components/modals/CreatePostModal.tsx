import React, { useState, useRef } from 'react';
import { X, FileText, Upload, Loader2 } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { ArticleItem } from '../../types';
import { TagInput } from '../ui/TagInput';
import { COMMON_TAGS } from '../../data/tags';
import { supabase } from '../../lib/supabase';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OFFICIAL_PROFILE = {
  name: 'Latam Creativa',
  id: 'latam-creativa-official',
  avatar:
    'https://ui-avatars.com/api/?name=Latam+Creativa&background=0D0D0F&color=F59E0B&bold=true',
  role: 'Official Account',
};

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { state, actions } = useAppStore();
  const user = state.user;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isOfficialPost, setIsOfficialPost] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImage(previewUrl);
    }
  };

  const handlePublish = async () => {
    if (!title || !content) return;
    setIsSubmitting(true);

    try {
      let imageUrl = image;

      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('blog-covers')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('blog-covers').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      } else if (!image) {
        imageUrl =
          'https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=1000&auto=format&fit=crop';
      }

      const author = isOfficialPost
        ? OFFICIAL_PROFILE
        : {
          name: user?.name || 'Anónimo',
          id: user?.id || 'anon',
          authorId: user?.id || 'anon',
          avatar: user?.avatar || '',
          role: user?.role || 'Miembro',
        };

      const newPost: ArticleItem = {
        id: Date.now().toString(),
        title,
        excerpt: content.substring(0, 120) + '...',
        content,
        author: author.name,
        authorId: author.id,
        authorAvatar: author.avatar,
        role: author.role,
        date: new Date().toISOString(),
        readTime: `${Math.max(1, Math.ceil(content.split(' ').length / 200))} min`,
        likes: 0,
        comments: 0,
        image: imageUrl,
        tags,
        category: 'General',
      };

      const { data: insertedPost, error: insertError } = await supabase
        .from('articles')
        .insert({
          title: newPost.title,
          content: newPost.content,
          excerpt: newPost.excerpt,
          author: newPost.author,
          author_id: newPost.authorId,
          author_avatar: newPost.authorAvatar,
          date: newPost.date,
          image: newPost.image,
          tags: newPost.tags,
          category: newPost.category,
          slug: `${newPost.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        } as never)
        .select()
        .single();

      if (insertError) throw insertError;

      const finalId = (insertedPost as unknown as { id: string })?.id ?? newPost.id;
      actions.addBlogPost({ ...newPost, id: finalId });
      actions.showToast('Artículo publicado exitosamente', 'success');

      setTitle('');
      setContent('');
      setImage('');
      setImageFile(null);
      setTags([]);
      setIsOfficialPost(false);
      onClose();
    } catch (error) {
      console.error('Error publishing post:', error);
      actions.showToast('Error al publicar el artículo', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-semibold text-white">Crear Artículo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del artículo"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Contenido</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu artículo..."
              rows={8}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 resize-none"
            />
          </div>

          {/* Image */}
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Imagen de portada</label>
            {image ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setImage('');
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video border border-dashed border-neutral-700 rounded-lg flex flex-col items-center justify-center gap-2 text-neutral-500 hover:text-neutral-400 hover:border-neutral-600 transition-colors"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm">Subir imagen</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Etiquetas</label>
            <TagInput
              tags={tags}
              onAddTag={(tag) => setTags(prev => [...prev, tag])}
              onRemoveTag={(tag) => setTags(prev => prev.filter(t => t !== tag))}
              suggestions={COMMON_TAGS}
              placeholder="Agregar etiqueta..."
            />
          </div>

          {/* Official Post Toggle */}
          {user?.role === 'admin' && (
            <label className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={isOfficialPost}
                onChange={(e) => setIsOfficialPost(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${isOfficialPost ? 'bg-amber-500' : 'bg-neutral-700'
                  }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isOfficialPost ? 'translate-x-4' : ''
                    }`}
                />
              </div>
              <span className="text-sm text-white">Publicar como Latam Creativa</span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handlePublish}
            disabled={!title || !content || isSubmitting}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
};
