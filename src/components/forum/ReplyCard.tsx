'use client';

/**
 * ReplyCard Component
 * 
 * Card para mostrar una respuesta dentro de un hilo del foro.
 * Incluye contenido, autor, likes, y acciones (editar, eliminar, reportar).
 */
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Heart,
    MoreVertical,
    Edit2,
    Trash2,
    Flag,
    Award,
    Reply as ReplyIcon,
    Check
} from 'lucide-react';
import { ForumReply } from '../../types/forum';
import { useReplyLike } from '../../hooks/useForumHooks';
import { useAppStore } from '../../hooks/useAppStore';
import { useAuthorInfo } from '../../hooks/useAuthorInfo';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

interface ReplyCardProps {
    reply: ForumReply;
    threadAuthorId: string;
    isThreadAuthor: boolean;
    onEdit?: (replyId: string) => void;
    onDelete?: (replyId: string) => void;
    onReport?: (replyId: string) => void;
    onMarkBestAnswer?: (replyId: string, isBest: boolean) => void;
    onReply?: (replyId: string) => void;
}

/**
 * Calcula el tiempo transcurrido desde una fecha
 */
function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 30) return `hace ${diffDays}d`;
    return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
    });
}

/**
 * Detecta si el contenido es HTML (del editor WYSIWYG)
 */
function isHtmlContent(content: string): boolean {
    const trimmed = content.trim();
    return trimmed.startsWith('<') && (
        trimmed.includes('<p>') ||
        trimmed.includes('<div>') ||
        trimmed.includes('<h1>') ||
        trimmed.includes('<h2>') ||
        trimmed.includes('<h3>') ||
        trimmed.includes('<ul>') ||
        trimmed.includes('<ol>') ||
        trimmed.includes('<blockquote>') ||
        trimmed.includes('<pre>')
    );
}

/**
 * Renderiza contenido HTML (del editor WYSIWYG)
 */
function renderHtmlContent(content: string): React.ReactNode {
    return (
        <div
            className="prose prose-invert prose-sm max-w-none
                       prose-p:text-gray-300 prose-p:my-2
                       prose-strong:text-white prose-strong:font-semibold
                       prose-em:text-gray-300 prose-em:italic
                       prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
                       prose-code:bg-black/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-amber-400 prose-code:text-sm prose-code:font-mono
                       prose-pre:bg-black/40 prose-pre:rounded-lg prose-pre:p-4
                       prose-blockquote:border-l-amber-500 prose-blockquote:bg-amber-500/5 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg
                       prose-ul:text-gray-300 prose-ol:text-gray-300
                       prose-img:rounded-xl prose-img:max-w-full"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
        />
    );
}

/**
 * Renderiza contenido con soporte de Markdown
 */
function renderMarkdownContent(content: string): React.ReactNode {
    // Simple markdown-like rendering
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent = '';

    lines.forEach((line, index) => {
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                // End code block
                elements.push(
                    <pre key={`code-${index}`} className="bg-black/40 rounded-lg p-3 my-2 overflow-x-auto">
                        <code className="text-sm text-gray-300 font-mono">
                            {codeContent.trim()}
                        </code>
                    </pre>
                );
                codeContent = '';
                inCodeBlock = false;
            } else {
                // Start code block (language hint ignored for now)
                inCodeBlock = true;
            }
        } else if (inCodeBlock) {
            codeContent += line + '\n';
        } else {
            // Regular line - handle inline code
            const parts = line.split(/(`[^`]+`)/g);
            const formattedParts = parts.map((part, partIndex) => {
                if (part.startsWith('`') && part.endsWith('`')) {
                    return (
                        <code
                            key={partIndex}
                            className="bg-black/30 px-1.5 py-0.5 rounded text-amber-400 text-sm font-mono"
                        >
                            {part.slice(1, -1)}
                        </code>
                    );
                }
                return part;
            });

            if (line.trim()) {
                elements.push(
                    <p key={index} className="text-gray-300 mb-2">
                        {formattedParts}
                    </p>
                );
            } else {
                elements.push(<br key={index} />);
            }
        }
    });

    return elements;
}

/**
 * Renderiza contenido - detecta automáticamente HTML vs Markdown
 */
function renderContent(content: string): React.ReactNode {
    if (!content) return null;

    if (isHtmlContent(content)) {
        return renderHtmlContent(content);
    }

    return renderMarkdownContent(content);
}

export const ReplyCard: React.FC<ReplyCardProps> = ({
    reply,
    threadAuthorId,
    isThreadAuthor,
    onEdit,
    onDelete,
    onReport,
    onMarkBestAnswer,
    onReply
}) => {
    const router = useRouter();
    const { state } = useAppStore();
    const [showMenu, setShowMenu] = useState(false);
    const { liked, toggleLike, loading: likeLoading } = useReplyLike(
        reply.threadId,
        reply.id,
        state.user?.uid
    );

    const isAuthor = state.user?.uid === reply.authorId;
    const canMarkBest = isThreadAuthor && !reply.isBestAnswer;
    const canUnmarkBest = isThreadAuthor && reply.isBestAnswer;

    // Live author lookup - fetches current name/avatar from user profile
    const { authorName, authorAvatar, authorUsername } = useAuthorInfo(
        reply.authorId,
        reply.authorName,
        reply.authorAvatar
    );

    const handleAuthorClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (authorUsername || reply.authorUsername) {
            router.push(`/user/${authorUsername || reply.authorUsername}`);
        }
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!state.user) {
            // Could show login modal here
            return;
        }
        await toggleLike();
    };

    return (
        <article
            className={`relative bg-[#1a1a2e]/40 border rounded-xl p-4 transition-all duration-200 ${reply.isBestAnswer
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-white/5 hover:border-white/10'
                }`}
        >
            {/* Best Answer Badge */}
            {reply.isBestAnswer && (
                <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                    <Award className="w-3.5 h-3.5" />
                    Mejor Respuesta
                </div>
            )}

            {/* Header: Author + Actions */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Image
                        src={authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=6366f1&color=fff`}
                        alt={authorName}
                        onClick={handleAuthorClick}
                        width={40}
                        height={40}
                        className="rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all"
                        unoptimized
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <span
                                onClick={handleAuthorClick}
                                className="text-white font-medium hover:text-amber-400 cursor-pointer transition-colors"
                            >
                                {authorName}
                            </span>
                            {reply.authorId === threadAuthorId && (
                                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded">
                                    OP
                                </span>
                            )}
                            {reply.authorRole && (
                                <span className="text-xs text-gray-500">
                                    {reply.authorRole}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{getTimeAgo(reply.createdAt)}</span>
                            {reply.isEdited && (
                                <span>(editado)</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Menu */}
                {state.user && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 top-8 z-20 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                                    {isAuthor && onEdit && (
                                        <button
                                            onClick={() => { onEdit(reply.id); setShowMenu(false); }}
                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Editar
                                        </button>
                                    )}
                                    {isAuthor && onDelete && (
                                        <button
                                            onClick={() => { onDelete(reply.id); setShowMenu(false); }}
                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Eliminar
                                        </button>
                                    )}
                                    {canMarkBest && onMarkBestAnswer && (
                                        <button
                                            onClick={() => { onMarkBestAnswer(reply.id, true); setShowMenu(false); }}
                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-green-400 hover:bg-green-500/10 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                            Marcar como mejor
                                        </button>
                                    )}
                                    {canUnmarkBest && onMarkBestAnswer && (
                                        <button
                                            onClick={() => { onMarkBestAnswer(reply.id, false); setShowMenu(false); }}
                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-400 hover:bg-white/5 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                            Desmarcar respuesta
                                        </button>
                                    )}
                                    {!isAuthor && onReport && (
                                        <button
                                            onClick={() => { onReport(reply.id); setShowMenu(false); }}
                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                                        >
                                            <Flag className="w-4 h-4" />
                                            Reportar
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none text-gray-300">
                {renderContent(reply.content)}
            </div>

            {/* Footer: Actions */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
                <button
                    onClick={handleLike}
                    disabled={likeLoading || !state.user}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${liked
                        ? 'bg-pink-500/20 text-pink-400'
                        : 'text-gray-500 hover:text-pink-400 hover:bg-pink-500/10'
                        } ${!state.user ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                    <span>{reply.likes}</span>
                </button>

                {onReply && state.user && (
                    <button
                        onClick={() => onReply(reply.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                    >
                        <ReplyIcon className="w-4 h-4" />
                        Responder
                    </button>
                )}
            </div>
        </article>
    );
};

export default ReplyCard;
