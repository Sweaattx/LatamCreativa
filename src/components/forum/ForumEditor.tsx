/**
 * ForumEditor Component - Smart Editor with Image Upload & Delete
 * 
 * Editor adaptativo que cambia según la categoría:
 * - Categorías de programación: Editor Markdown con bloques de código
 * - Otras categorías: Editor WYSIWYG simple y visual
 * 
 * Incluye subida y eliminación de imágenes.
 */
import React, { useRef, useCallback, useState } from 'react';
import '../../styles/tiptap.css';
import { useEditor, EditorContent, NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    Code,
    Link2,
    Image as ImageIcon,
    List,
    Quote,
    Send,
    FileCode,
    ListOrdered,
    Heading2,
    Loader2,
    X
} from 'lucide-react';
import { storageService } from '../../services/supabase/storage';
import imageCompression from 'browser-image-compression';

// Opciones de compresión de imagen
const COMPRESSION_OPTIONS = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp' as const
};

// Categorías que usan Markdown
const PROGRAMMING_CATEGORIES = ['programacion', 'gamedev'];

interface ForumEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
    maxLength?: number;
    onSubmit?: () => void;
    submitLabel?: string;
    isSubmitting?: boolean;
    showToolbar?: boolean;
    autoFocus?: boolean;
    category?: string;
}

// =============================================
// Custom Image Component with Delete Button
// =============================================
const ImageWithDelete: React.FC<NodeViewProps> = ({ node, deleteNode, selected }) => {
    const [showDelete, setShowDelete] = useState(false);

    return (
        <NodeViewWrapper
            className="relative inline-block my-2"
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={node.attrs.src}
                alt={node.attrs.alt || ''}
                draggable={false}
                className={`max-w-full rounded-lg transition-all select-none ${selected ? 'ring-2 ring-amber-500' : ''}`}
            />
            {(showDelete || selected) && (
                <button
                    type="button"
                    onClick={deleteNode}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all"
                    title="Eliminar imagen"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </NodeViewWrapper>
    );
};

// Custom Image Extension with React Node View - Drag disabled
const CustomImage = TiptapImage.extend({
    draggable: false,
    addNodeView() {
        return ReactNodeViewRenderer(ImageWithDelete);
    },
});

// =============================================
// WYSIWYG EDITOR
// =============================================
const WysiwygEditor: React.FC<Omit<ForumEditorProps, 'category'>> = ({
    value,
    onChange,
    placeholder = 'Escribe tu mensaje...',
    minHeight = '150px',
    onSubmit,
    submitLabel = 'Publicar',
    isSubmitting = false,
    showToolbar = true,
    autoFocus = false
}) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-amber-400 underline' }
            }),
            CustomImage.configure({
                HTMLAttributes: { class: 'max-w-full rounded-lg my-2' }
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content: value,
        autofocus: autoFocus,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'tiptap prose prose-invert prose-sm max-w-none focus:outline-none p-4',
                style: `min-height: ${minHeight}`,
            },
        },
    });

    // Sync editor content when value prop changes (for edit mode)
    React.useEffect(() => {
        if (editor && value && editor.getHTML() !== value) {
            editor.commands.setContent(value);
        }
    }, [editor, value]);

    if (!editor) return null;

    const addLink = () => {
        const url = prompt('URL del enlace:', 'https://');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona una imagen válida');
            return;
        }

        setUploading(true);
        try {
            const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);

            const timestamp = Date.now();
            const path = `forum/content/${timestamp}.webp`;
            const url = await storageService.uploadImage(compressedFile, path);
            editor.chain().focus().setImage({ src: url }).run();
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir la imagen. Intenta de nuevo.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="bg-[#1a1a2e]/60 border border-white/10 rounded-xl overflow-hidden">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />

            {showToolbar && (
                <div className="flex items-center px-3 py-2 border-b border-white/10 bg-black/20 gap-1 flex-wrap">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2 rounded transition-colors ${editor.isActive('bold') ? 'bg-amber-500/30 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        title="Negrita"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2 rounded transition-colors ${editor.isActive('italic') ? 'bg-amber-500/30 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        title="Cursiva"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 bg-white/10" />
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-2 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-amber-500/30 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        title="Título"
                    >
                        <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-2 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-amber-500/30 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        title="Lista"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-2 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-amber-500/30 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        title="Lista numerada"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 bg-white/10" />
                    <button
                        type="button"
                        onClick={addLink}
                        className={`p-2 rounded transition-colors ${editor.isActive('link') ? 'bg-amber-500/30 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        title="Enlace"
                    >
                        <Link2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                        title="Subir imagen"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-2 rounded transition-colors ${editor.isActive('blockquote') ? 'bg-amber-500/30 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        title="Cita"
                    >
                        <Quote className="w-4 h-4" />
                    </button>
                </div>
            )}

            {uploading && (
                <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-sm text-amber-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subiendo imagen...
                </div>
            )}

            <EditorContent editor={editor} className="min-h-[150px]" />

            <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-black/20">
                <div className="text-xs text-gray-500">
                    Editor visual • Haz clic en una imagen para eliminarla
                </div>

                {onSubmit && (
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting || !editor.getText().trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Publicando...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                {submitLabel}
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

// =============================================
// MARKDOWN EDITOR
// =============================================
const MarkdownEditor: React.FC<Omit<ForumEditorProps, 'category'>> = ({
    value,
    onChange,
    placeholder = 'Escribe tu mensaje con Markdown...',
    minHeight = '150px',
    maxLength = 10000,
    onSubmit,
    submitLabel = 'Publicar',
    isSubmitting = false,
    showToolbar = true,
    autoFocus = false
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const insertAtCursor = useCallback((text: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentValue = textarea.value;

        const newValue =
            currentValue.substring(0, start) +
            text +
            currentValue.substring(end);

        onChange(newValue);

        requestAnimationFrame(() => {
            textarea.focus();
            const newPos = start + text.length;
            textarea.setSelectionRange(newPos, newPos);
        });
    }, [onChange]);

    const insertFormat = useCallback((before: string, after: string = '', placeholderText: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentValue = textarea.value;
        const selectedText = currentValue.substring(start, end);
        const textToInsert = selectedText || placeholderText;

        const newValue =
            currentValue.substring(0, start) +
            before + textToInsert + after +
            currentValue.substring(end);

        onChange(newValue);

        requestAnimationFrame(() => {
            textarea.focus();
            if (selectedText) {
                const newPos = start + before.length + selectedText.length + after.length;
                textarea.setSelectionRange(newPos, newPos);
            } else {
                const selectStart = start + before.length;
                const selectEnd = selectStart + textToInsert.length;
                textarea.setSelectionRange(selectStart, selectEnd);
            }
        });
    }, [onChange]);

    const handleBold = () => insertFormat('**', '**', 'texto');
    const handleItalic = () => insertFormat('*', '*', 'texto');
    const handleCode = () => insertFormat('`', '`', 'código');
    const handleCodeBlock = () => insertFormat('\n```javascript\n', '\n```\n', '// tu código aquí');
    const handleLink = () => {
        const url = prompt('URL:', 'https://');
        if (url) insertFormat(`[`, `](${url})`, 'texto');
    };
    const handleList = () => insertFormat('\n- ', '', 'elemento');
    const handleQuote = () => insertFormat('\n> ', '', 'cita');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona una imagen válida');
            return;
        }

        setUploading(true);
        try {
            const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);

            const timestamp = Date.now();
            const path = `forum/content/${timestamp}.webp`;
            const url = await storageService.uploadImage(compressedFile, path);
            insertAtCursor(`\n![imagen](${url})\n`);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir la imagen. Intenta de nuevo.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Render markdown preview with clickable images to delete
    const renderPreview = (text: string) => {
        if (!text.trim()) return '<span class="text-gray-600 italic">Vista previa...</span>';

        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-black/50 rounded p-2 my-1 overflow-x-auto"><code class="text-green-400 text-xs whitespace-pre-wrap">$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code class="bg-black/40 px-1 rounded text-amber-400 text-sm">$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-amber-400 underline">$1</a>')
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-1 max-h-48" />')
            .replace(/^&gt; (.+)$/gm, '<span class="border-l-2 border-amber-500 pl-2 text-gray-400 italic block">$1</span>')
            .replace(/^- (.+)$/gm, '<span class="ml-3 block">• $1</span>')
            .replace(/\n/g, '<br />');
    };

    return (
        <div className="bg-[#1a1a2e]/60 border border-white/10 rounded-xl overflow-hidden">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />

            {showToolbar && (
                <div className="flex items-center px-3 py-2 border-b border-white/10 bg-black/20 gap-1 flex-wrap">
                    <button type="button" onClick={handleBold} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Negrita"><Bold className="w-4 h-4" /></button>
                    <button type="button" onClick={handleItalic} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Cursiva"><Italic className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-white/10" />
                    <button type="button" onClick={handleCode} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Código inline"><Code className="w-4 h-4" /></button>
                    <button type="button" onClick={handleCodeBlock} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Bloque de código"><FileCode className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-white/10" />
                    <button type="button" onClick={handleLink} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Enlace"><Link2 className="w-4 h-4" /></button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded disabled:opacity-50"
                        title="Subir imagen"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    </button>
                    <div className="w-px h-5 bg-white/10" />
                    <button type="button" onClick={handleList} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Lista"><List className="w-4 h-4" /></button>
                    <button type="button" onClick={handleQuote} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Cita"><Quote className="w-4 h-4" /></button>
                    <span className="ml-auto text-xs text-yellow-500/70 bg-yellow-500/10 px-2 py-1 rounded">Markdown</span>
                </div>
            )}

            {uploading && (
                <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-sm text-amber-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subiendo imagen...
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-white/10">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    maxLength={maxLength}
                    className="w-full p-4 bg-transparent text-gray-200 placeholder-gray-500 resize-none focus:outline-none font-mono text-sm"
                    style={{ minHeight }}
                />
                <div
                    className="p-4 text-gray-300 text-sm overflow-auto bg-black/10 hidden md:block"
                    style={{ minHeight }}
                    dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
                />
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-black/20">
                <div className="text-xs text-gray-500">
                    {value.length.toLocaleString()} caracteres • Para eliminar imagen, borra el texto ![imagen](url)
                </div>

                {onSubmit && (
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting || !value.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Publicando...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                {submitLabel}
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

// =============================================
// MAIN SMART EDITOR
// =============================================
export const ForumEditor: React.FC<ForumEditorProps> = (props) => {
    const { category = '' } = props;
    const useMarkdown = PROGRAMMING_CATEGORIES.includes(category.toLowerCase());

    if (useMarkdown) {
        return <MarkdownEditor {...props} />;
    }

    return <WysiwygEditor {...props} />;
};

export default ForumEditor;
