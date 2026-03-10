'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
    Calendar, ArrowRight, TrendingUp, UserPlus,
    Hash, Clock, Users, Sparkles, Image as ImageIcon,
    Flame, Zap, Star, Send, X, Check, Eye,
    Palette, Moon, Rocket, FileText, Layers,
    AlertTriangle, EyeOff, Link2, Edit3, Trash2, Loader2,
} from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { getFeed, getSuggestedUsers, getTrendingTags, type FeedItem } from '@/services/supabase/feed';
import { friendsService } from '@/services/supabase/friends';
import { reportsService } from '@/services/supabase/reports';

/* ─── mock data (fallback when DB is empty) ─── */
const MOCK_POSTS: FeedItem[] = [
    {
        id: 'mock-1', type: 'project', slug: 'diseno-ui-sistema',
        title: 'Nuevo Design System para app fintech',
        content: null, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
        tags: ['DiseñoUI', 'Figma', 'DesignSystem'], category: 'Diseño', likes: 1234, views: 5600, commentsCount: 178, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        author: { id: 'mock-u1', name: 'María García', username: 'mariagarcia', avatar: 'https://ui-avatars.com/api/?name=MG&background=ec4899&color=fff&size=128', role: 'Diseñadora UI/UX' },
    },
    {
        id: 'mock-2', type: 'article', slug: 'hito-opensource',
        title: 'Hito alcanzado: +1000 estrellas en GitHub',
        content: 'Nuestro proyecto opensource ya tiene +1000 estrellas en GitHub. Gracias a toda la comunidad que ha contribuido. Esto apenas comienza.', image: null,
        tags: ['OpenSource', 'GitHub', 'Community'], category: 'Desarrollo', likes: 892, views: 3400, commentsCount: 67, createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
        author: { id: 'mock-u2', name: 'Pedro UX', username: 'pedroux', avatar: 'https://ui-avatars.com/api/?name=PU&background=6366f1&color=fff&size=128', role: 'Product Designer' },
    },
    {
        id: 'mock-3', type: 'project', slug: 'plataforma-nft-latam',
        title: 'Proyecto colaborativo: Plataforma NFT para artistas latinos',
        content: 'Buscamos desarrolladores y diseñadores para crear una plataforma de NFTs para artistas latinos.\n\nQuién se suma? DM abierto.', image: null,
        tags: ['NFT', 'Web3', 'Colaboración', 'Hiring'], category: 'Desarrollo', likes: 621, views: 2100, commentsCount: 94, createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        author: { id: 'mock-u3', name: 'Laura 3D', username: 'laura3d', avatar: 'https://ui-avatars.com/api/?name=L3&background=f59e0b&color=fff&size=128', role: '3D Artist' },
    },
    {
        id: 'mock-4', type: 'article', slug: 'ia-diseno-interfaces',
        title: 'IA y diseño de interfaces',
        content: 'Alguien más siente que la IA va a cambiar completamente cómo diseñamos interfaces? Acabo de probar las nuevas herramientas de generación y estoy impresionado.', image: null,
        tags: ['AIArt', 'DesignTools', 'FutureOfDesign'], category: 'Tecnología', likes: 567, views: 1800, commentsCount: 143, createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        author: { id: 'mock-u4', name: 'Carlos Dev', username: 'carlosdev', avatar: 'https://ui-avatars.com/api/?name=CD&background=3b82f6&color=fff&size=128', role: 'Full-Stack Dev' },
    },
];

const MOCK_SUGGESTED = [
    { id: 's1', name: 'Diego Motion', role: 'Motion Designer', username: 'diegomotion', avatar: 'https://ui-avatars.com/api/?name=DM&background=FF4D00&color=fff&size=128' },
    { id: 's2', name: 'Sofia Code', role: 'Software Engineer', username: 'sofiacode', avatar: 'https://ui-avatars.com/api/?name=SC&background=8b5cf6&color=fff&size=128' },
    { id: 's3', name: 'Ana Branding', role: 'Brand Strategist', username: 'anabranding', avatar: 'https://ui-avatars.com/api/?name=AB&background=06b6d4&color=fff&size=128' },
];

const MOCK_TRENDING = [
    { tag: '#DiseñoUI', count: 2345 },
    { tag: '#ReactJS', count: 1890 },
    { tag: '#AIArt', count: 1567 },
    { tag: '#Freelance', count: 1234 },
    { tag: '#OpenSource', count: 987 },
];

const CHALLENGES = [
    { id: '1', title: 'Ilustración Cyberpunk', desc: 'Crea una ilustración con temática cyberpunk', Icon: Palette, gradient: 'from-fuchsia-500/20 to-purple-600/20', iconColor: 'text-fuchsia-400', left: 14, people: 234 },
    { id: '2', title: 'Logo en 60 min', desc: 'Diseña un logo completo en una hora', Icon: Zap, gradient: 'from-amber-500/20 to-orange-600/20', iconColor: 'text-amber-400', left: 7, people: 189 },
    { id: '3', title: 'UI Dark Mode', desc: 'Rediseña una app popular en modo oscuro', Icon: Moon, gradient: 'from-blue-500/20 to-indigo-600/20', iconColor: 'text-blue-400', left: 10, people: 456 },
];

const EVENTS = [
    { id: '1', title: 'Portfolio Review Night', day: 20, month: 'FEB', tag: 'En vivo', tagBg: 'bg-gradient-to-r from-red-500 to-rose-600', time: '19:00 hrs', host: 'María García', going: 45 },
    { id: '2', title: 'Workshop: Blender para principiantes', day: 22, month: 'FEB', tag: 'Workshop', tagBg: 'bg-gradient-to-r from-blue-500 to-indigo-600', time: '15:00 hrs', host: 'Laura 3D', going: 156 },
    { id: '3', title: 'Meetup Devs CDMX', day: 25, month: 'FEB', tag: 'Meetup', tagBg: 'bg-gradient-to-r from-emerald-500 to-teal-600', time: '18:00 hrs', host: 'Carlos Dev', going: 89 },
];

/* ─── helpers ─── */
const fmtK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return 'ahora';
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
};

/* ─── small UI pieces ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
    return (
        <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/[0.1] rounded-xl text-sm text-white shadow-subtle">
            <Check className="w-4 h-4 text-emerald-400" />{message}
            <button onClick={onClose} className="ml-2 p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"><X className="w-3.5 h-3.5" /></button>
        </motion.div>
    );
}

function Badge({ type }: { type: string }) {
    if (type === 'project') return (
        <span className="ml-1 px-1.5 py-px text-[9px] font-bold tracking-wider rounded-md bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border border-emerald-400/20 inline-flex items-center gap-0.5">
            <Layers className="w-2.5 h-2.5" /> PROYECTO
        </span>
    );
    if (type === 'article') return (
        <span className="ml-1 px-1.5 py-px text-[9px] font-bold tracking-wider rounded-md bg-gradient-to-r from-blue-500/25 to-indigo-500/25 text-blue-300 border border-blue-400/20 inline-flex items-center gap-0.5">
            <FileText className="w-2.5 h-2.5" /> ARTÍCULO
        </span>
    );
    const m: Record<string, [string, string]> = {};
    const [label, cls] = m[type] || ['', ''];
    if (!label) return null;
    return <span className={`ml-1 px-1.5 py-px text-[9px] font-bold tracking-wider rounded-md ${cls}`}>{label}</span>;
}

function IconBox({ children, gradient }: { children: React.ReactNode; gradient: string }) {
    return (
        <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />{children}
        </div>
    );
}

function SectionHead({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-white/[0.04]">
            <div className="w-7 h-7 rounded-lg bg-accent-500/15 flex items-center justify-center">{icon}</div>
            <h3 className="text-[13px] font-bold text-white/85 tracking-tight">{label}</h3>
        </div>
    );
}

/* ─── POST CARD ─── */
interface LocalComment {
    id: string;
    text: string;
    authorName: string;
    authorAvatar: string;
    createdAt: Date;
}

function Post({ post, i, onToast }: { post: FeedItem; i: number; onToast: (msg: string) => void }) {
    const router = useRouter();
    const { state, actions } = useAppStore();
    const user = state.user;
    const [liked, setLiked] = useState(state.likedItems.includes(post.id));
    const [saved, setSaved] = useState(state.savedItems.some(s => s.id === post.id));
    const [likeCount, setLikeCount] = useState(post.likes);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [commentCount, setCommentCount] = useState(0);
    const [comments, setComments] = useState<LocalComment[]>([]);
    const [showMenu, setShowMenu] = useState(false);
    const [hidden, setHidden] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false); };
        if (showMenu) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showMenu]);

    if (hidden) return null;

    const handleLike = useCallback(() => {
        actions.toggleLike(post.id);
        setLiked(prev => { setLikeCount(c => prev ? c - 1 : c + 1); return !prev; });
    }, [actions, post.id]);

    const handleSave = useCallback(() => {
        setSaved(prev => !prev);
        actions.toggleSave({
            id: post.id,
            title: post.title,
            image: post.image || '',
            slug: post.slug,
        });
    }, [post, actions]);

    const handleShare = useCallback(() => {
        navigator.clipboard?.writeText(`https://latamcreativa.com/${post.type === 'project' ? 'portfolio' : 'blog'}/${post.slug}`);
        onToast('Enlace copiado al portapapeles');
    }, [post.slug, post.type, onToast]);

    const submitComment = useCallback(() => {
        if (!commentText.trim()) return;
        const newComment: LocalComment = {
            id: `comment-${Date.now()}`,
            text: commentText.trim(),
            authorName: user?.name || 'Tú',
            authorAvatar: user?.avatar || `https://ui-avatars.com/api/?name=T&background=FF4D00&color=fff&size=128`,
            createdAt: new Date(),
        };
        setComments(prev => [...prev, newComment]);
        setCommentCount(c => c + 1);
        setCommentText('');
        setShowComments(true);
        onToast('Comentario publicado');
    }, [commentText, onToast, user]);

    const detailHref = post.type === 'project' ? `/portfolio/${post.slug}` : `/blog/${post.slug}`;

    return (
        <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.3 }}
            className="rounded-2xl border border-white/[0.06] bg-[#0f0f11] hover:border-white/[0.1] transition-colors duration-300">
            {/* author */}
            <div className="flex items-start gap-3 px-5 pt-4 pb-2">
                <Link href={`/user/${post.author.username || post.author.id}`} className="relative flex-shrink-0 group/avatar">
                    <Image src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=FF4D00&color=fff&size=128`}
                        alt="" width={42} height={42} className="rounded-full ring-2 ring-white/[0.08] group-hover/avatar:ring-accent-400/40 transition-all" unoptimized />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0f0f11]" />
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-x-1">
                        <Link href={`/user/${post.author.username || post.author.id}`}
                            className="text-[13px] font-semibold text-white/90 hover:text-accent-400 transition-colors">{post.author.name}</Link>
                        <Badge type={post.type} />
                    </div>
                    <p className="text-[11px] text-white/30 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        {post.author.role || 'Creador'} <span className="text-white/15">·</span> {timeAgo(post.createdAt)}
                        {post.category && <><span className="text-white/15">·</span>{post.category}</>}
                    </p>
                </div>
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setShowMenu(p => !p)} className="p-1 rounded-md text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-8 z-20 w-44 bg-[#1a1a1d] border border-white/[0.1] rounded-xl shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                            <button onClick={() => { handleShare(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-white/60 hover:text-white/90 hover:bg-white/[0.05] transition-colors">
                                <Link2 className="w-3.5 h-3.5" /> Copiar enlace
                            </button>
                            <button onClick={() => { setHidden(true); setShowMenu(false); onToast('Post oculto'); }} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-white/60 hover:text-white/90 hover:bg-white/[0.05] transition-colors">
                                <EyeOff className="w-3.5 h-3.5" /> Ocultar post
                            </button>
                            {user?.id && (user.id === post.author.id || user.username === post.author.username) && (
                                <>
                                    <div className="mx-2 h-px bg-white/[0.06] my-1" />
                                    <button onClick={() => { setShowMenu(false); router.push(post.type === 'project' ? `/create/portfolio?edit=${post.slug}` : `/create/article?edit=${post.slug}`); }} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-white/60 hover:text-white/90 hover:bg-white/[0.05] transition-colors">
                                        <Edit3 className="w-3.5 h-3.5" /> Editar
                                    </button>
                                    <button onClick={async () => { setShowMenu(false); if (confirm('¿Eliminar este post permanentemente?')) { setHidden(true); onToast('Post eliminado'); } }} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.05] transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                    </button>
                                </>
                            )}
                            <div className="mx-2 h-px bg-white/[0.06] my-1" />
                            <button onClick={async () => {
                                setShowMenu(false);
                                if (!user?.id) { onToast('Inicia sesi\u00f3n para reportar'); return; }
                                await reportsService.createReport({ reporterId: user.id, reporterName: user.name || 'Usuario', contentType: post.type === 'project' ? 'project' : 'article', contentId: post.id, reason: 'inappropriate' });
                                onToast('Reporte enviado. Gracias.');
                            }} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.05] transition-colors">
                                <AlertTriangle className="w-3.5 h-3.5" /> Reportar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* title + content */}
            <Link href={detailHref} className="block px-5 pb-2 group/title">
                <h3 className="text-[14px] font-semibold text-white/90 group-hover/title:text-accent-400 transition-colors">{post.title}</h3>
            </Link>
            {post.content && <p className="px-5 pb-3 text-[13px] text-white/60 leading-[1.65] whitespace-pre-line line-clamp-3">{post.content}</p>}

            {/* tags */}
            {post.tags.length > 0 && (
                <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                    {post.tags.map(t => (
                        <button key={t} onClick={() => router.push(`/discover/all?q=${encodeURIComponent(t)}`)}
                            className="px-2 py-0.5 rounded-md bg-accent-500/[0.08] text-[11px] font-medium text-accent-400/80 hover:bg-accent-500/[0.15] hover:text-accent-300 transition-all border border-accent-500/10 cursor-pointer">
                            #{t}
                        </button>
                    ))}
                </div>
            )}

            {/* image */}
            {post.image && (
                <Link href={detailHref} className="block relative aspect-[16/9] mx-1.5 mb-1.5 rounded-xl overflow-hidden bg-white/[0.02]">
                    <Image src={post.image} alt={post.title} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/[0.06] rounded-xl" />
                </Link>
            )}

            {/* stats */}
            <div className="flex items-center justify-between px-5 py-2 text-[11px] text-white/25">
                <span className="flex items-center gap-1.5">
                    <span className="flex items-center gap-0.5"><Heart className="w-3 h-3 text-red-400/60 fill-red-400/60" />{fmtK(likeCount)}</span>
                    <span className="text-white/15">·</span>
                    <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{fmtK(post.views)}</span>
                </span>
                <span>{commentCount} comentarios</span>
            </div>

            <div className="mx-4 h-px bg-white/[0.04]" />

            {/* actions */}
            <div className="flex items-stretch px-1">
                <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg mx-0.5 my-1 text-xs font-medium transition-all active:scale-95 ${liked ? 'text-red-400 bg-red-500/[0.08]' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'}`}>
                    <Heart className={`w-[15px] h-[15px] transition-transform ${liked ? 'fill-current scale-110' : ''}`} /><span className="hidden sm:inline">Me gusta</span>
                </button>
                <button onClick={() => setShowComments(p => !p)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg mx-0.5 my-1 text-xs font-medium transition-all active:scale-95 ${showComments ? 'text-blue-400 bg-blue-500/[0.08]' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'}`}>
                    <MessageCircle className="w-[15px] h-[15px]" /><span className="hidden sm:inline">Comentar</span>
                </button>
                <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg mx-0.5 my-1 text-xs font-medium text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all active:scale-95">
                    <Share2 className="w-[15px] h-[15px]" /><span className="hidden sm:inline">Compartir</span>
                </button>
                <button onClick={handleSave} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg mx-0.5 my-1 text-xs font-medium transition-all active:scale-95 ${saved ? 'text-accent-400 bg-accent-500/[0.08]' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'}`}>
                    <Bookmark className={`w-[15px] h-[15px] ${saved ? 'fill-current' : ''}`} /><span className="hidden sm:inline">Guardar</span>
                </button>
            </div>

            {/* comments expandable */}
            <AnimatePresence>
                {showComments && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="mx-4 h-px bg-white/[0.04]" />
                        <div className="p-4 space-y-3">
                            {/* Existing comments list */}
                            {comments.length > 0 ? (
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                    {comments.map(c => (
                                        <div key={c.id} className="flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            <Image src={c.authorAvatar} alt="" width={28} height={28} className="rounded-full flex-shrink-0 ring-1 ring-white/10" unoptimized />
                                            <div className="flex-1 min-w-0 bg-white/[0.03] rounded-xl px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px] font-semibold text-white/80">{c.authorName}</span>
                                                    <span className="text-[10px] text-white/20">{c.createdAt.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-[12px] text-white/60 leading-relaxed mt-0.5">{c.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[11px] text-white/20 text-center py-2">Sé el primero en comentar</p>
                            )}

                            {/* Comment input */}
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 text-[10px] font-bold flex-shrink-0 overflow-hidden">
                                    {user?.avatar ? (
                                        <Image src={user.avatar} alt="" width={28} height={28} className="rounded-full" unoptimized />
                                    ) : (
                                        <span>{(user?.name || 'T').charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="flex-1 flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 focus-within:border-accent-500/30 transition-colors">
                                    <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitComment()}
                                        placeholder="Escribe un comentario..." className="flex-1 bg-transparent text-[12px] text-white/80 placeholder-white/20 outline-none" />
                                    <button onClick={submitComment} disabled={!commentText.trim()} className={`p-1 rounded-md transition-all ${commentText.trim() ? 'text-accent-400 hover:bg-accent-500/10' : 'text-white/15'}`}>
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
}

/* ─── LEFT SIDEBAR ─── */
function LeftCol() {
    const router = useRouter();
    return (
        <div className="space-y-4">
            <section className="rounded-2xl border border-white/[0.06] bg-[#0f0f11] overflow-hidden">
                <SectionHead icon={<Star className="w-3.5 h-3.5 text-accent-400" />} label="Retos Creativos" />
                <div className="p-2 space-y-1">
                    {CHALLENGES.map(c => (
                        <button key={c.id} onClick={() => router.push('/concursos')} className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-all text-left">
                            <IconBox gradient={c.gradient}><c.Icon className={`w-4.5 h-4.5 relative z-10 ${c.iconColor}`} /></IconBox>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12.5px] font-semibold text-white/80 truncate group-hover:text-white transition-colors">{c.title}</p>
                                <p className="text-[10.5px] text-white/30 truncate">{c.desc}</p>
                                <div className="flex items-center gap-2.5 mt-1 text-[10px] text-white/20">
                                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {c.left}d</span>
                                    <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" /> {c.people}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                <Link href="/concursos" className="flex items-center justify-center gap-1 py-2.5 text-[11px] text-accent-400/70 font-medium hover:text-accent-400 transition-colors border-t border-white/[0.04]">
                    Ver todos los retos <ArrowRight className="w-3 h-3" />
                </Link>
            </section>

            <section className="rounded-2xl border border-white/[0.06] bg-[#0f0f11] overflow-hidden">
                <SectionHead icon={<Calendar className="w-3.5 h-3.5 text-accent-400" />} label="Próximos Eventos" />
                <div className="p-2 space-y-1">
                    {EVENTS.map(e => (
                        <button key={e.id} onClick={() => router.push('/forum')} className="w-full group flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.03] transition-all text-left">
                            <div className="w-12 h-14 rounded-xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] flex flex-col items-center justify-center flex-shrink-0">
                                <span className="text-[9px] font-extrabold text-accent-400 uppercase leading-none tracking-wider">{e.month}</span>
                                <span className="text-lg font-bold text-white/90 leading-tight">{e.day}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12.5px] font-semibold text-white/80 truncate group-hover:text-white transition-colors">{e.title}</p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className={`px-2 py-0.5 text-[9px] font-bold text-white rounded-md shadow-md ${e.tagBg}`}>{e.tag}</span>
                                    <span className="text-[10px] text-white/25">{e.time}</span>
                                </div>
                                <p className="text-[10px] text-white/20 mt-1.5"><Star className="w-2.5 h-2.5 text-accent-400/50 inline" /> {e.host} · {e.going} asistentes</p>
                            </div>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}

/* ─── RIGHT SIDEBAR ─── */
function RightCol({ onToast }: { onToast: (msg: string) => void }) {
    const router = useRouter();
    const { state } = useAppStore();
    const [following, setFollowing] = useState<Record<string, boolean>>({});
    const [suggested, setSuggested] = useState<Array<{ id: string; name: string; role: string | null; username: string | null; avatar: string | null }>>(MOCK_SUGGESTED);
    const [trending, setTrending] = useState(MOCK_TRENDING);

    useEffect(() => {
        // Fetch real data, fallback to mocks
        getSuggestedUsers(state.user?.id, 5).then(users => {
            if (users.length > 0) setSuggested(users as typeof suggested);
        });
        getTrendingTags(5).then(tags => {
            if (tags.length > 0) setTrending(tags.map(t => ({ tag: `#${t.tag}`, count: t.count })));
        });
    }, [state.user?.id]);

    const toggleFollow = async (userId: string, name: string) => {
        const currentUserId = state.user?.id;
        if (!currentUserId) {
            onToast('Inicia sesión para seguir usuarios');
            return;
        }
        const isFollowing = following[userId];
        setFollowing(prev => ({ ...prev, [userId]: !isFollowing }));
        onToast(!isFollowing ? `Siguiendo a ${name}` : `Dejaste de seguir a ${name}`);

        if (!isFollowing) {
            const ok = await friendsService.sendRequest(currentUserId, userId);
            if (!ok) setFollowing(prev => ({ ...prev, [userId]: false }));
        } else {
            const ok = await friendsService.removeFriend(currentUserId, userId);
            if (!ok) setFollowing(prev => ({ ...prev, [userId]: true }));
        }
    };

    return (
        <div className="space-y-4">
            <section className="rounded-2xl border border-white/[0.06] bg-[#0f0f11] overflow-hidden">
                <SectionHead icon={<TrendingUp className="w-3.5 h-3.5 text-accent-400" />} label="Tendencias" />
                <div className="p-1">
                    {trending.map((t, i) => (
                        <button key={i} onClick={() => router.push(`/discover/all?q=${encodeURIComponent(t.tag)}`)}
                            className="w-full flex items-start justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer text-left">
                            <div>
                                <p className="text-[13.5px] font-bold text-white/85">{t.tag}</p>
                                <p className="text-[10px] text-white/20 mt-0.5">{t.count.toLocaleString()} publicaciones</p>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="px-4 py-2.5 border-t border-white/[0.04]">
                    <Link href="/discover/all" className="text-[11px] text-accent-400/70 font-medium hover:text-accent-400 transition-colors">Ver más</Link>
                </div>
            </section>

            <section className="rounded-2xl border border-white/[0.06] bg-[#0f0f11] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-accent-500/15 flex items-center justify-center"><UserPlus className="w-3.5 h-3.5 text-accent-400" /></div>
                        <h3 className="text-[13px] font-bold text-white/85 tracking-tight">Sugeridos para ti</h3>
                    </div>
                    <Link href="/discover/all" className="text-[11px] text-accent-400/70 font-medium hover:text-accent-400 transition-colors">Ver todos</Link>
                </div>
                <div className="p-2 space-y-0.5">
                    {suggested.map((u, i) => (
                        <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-all">
                            <Image src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=FF4D00&color=fff&size=128`}
                                alt="" width={38} height={38} className="rounded-full ring-2 ring-white/[0.08] flex-shrink-0" unoptimized />
                            <div className="flex-1 min-w-0">
                                <p className="text-[12.5px] font-semibold text-white/80 truncate">{u.name}</p>
                                <p className="text-[10px] text-white/30">{u.role}</p>
                            </div>
                            <button onClick={() => toggleFollow(u.id, u.name)}
                                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg active:scale-95 transition-all ${following[u.id]
                                    ? 'bg-white/[0.06] text-white/60 border border-white/[0.1] hover:border-red-500/30 hover:text-red-400'
                                    : 'bg-accent-500 text-white hover:bg-accent-600'
                                    }`}>
                                {following[u.id] ? 'Siguiendo' : 'Seguir'}
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

/* ─── MAIN FEED ─── */
function FeedPage() {
    const { state } = useAppStore();
    const router = useRouter();
    const name = state.user?.name?.split(' ')[0] || state.user?.username || 'Creador';
    const [activeTab, setActiveTab] = useState<'Para ti' | 'Siguiendo' | 'Trending'>('Para ti');
    const [toast, setToast] = useState<string | null>(null);
    const [posts, setPosts] = useState<FeedItem[]>(MOCK_POSTS);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [showCompose, setShowCompose] = useState(false);
    const [composeText, setComposeText] = useState('');
    const sentinelRef = useRef<HTMLDivElement>(null);
    const PAGE_SIZE = 10;

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    }, []);

    // Fetch feed data
    useEffect(() => {
        const tabMap = { 'Para ti': 'for-you' as const, 'Siguiendo': 'following' as const, 'Trending': 'trending' as const };
        setLoading(true);
        setPage(0);
        setHasMore(true);
        getFeed(tabMap[activeTab], state.user?.id, PAGE_SIZE)
            .then(result => {
                setPosts(result.items.length > 0 ? result.items : MOCK_POSTS);
                setHasMore(result.items.length >= PAGE_SIZE);
            })
            .catch(() => { setPosts(MOCK_POSTS); setHasMore(false); })
            .finally(() => setLoading(false));
    }, [activeTab, state.user?.id]);

    // Infinite scroll
    useEffect(() => {
        if (!sentinelRef.current || loading || !hasMore) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !loadingMore && hasMore) {
                setLoadingMore(true);
                const nextPage = page + 1;
                const tabMap = { 'Para ti': 'for-you' as const, 'Siguiendo': 'following' as const, 'Trending': 'trending' as const };
                getFeed(tabMap[activeTab], state.user?.id, PAGE_SIZE, nextPage * PAGE_SIZE)
                    .then(result => {
                        if (result.items.length > 0) {
                            setPosts(prev => [...prev, ...result.items]);
                            setPage(nextPage);
                            setHasMore(result.items.length >= PAGE_SIZE);
                        } else {
                            setHasMore(false);
                        }
                    })
                    .catch(() => setHasMore(false))
                    .finally(() => setLoadingMore(false));
            }
        }, { rootMargin: '200px' });
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [loading, loadingMore, hasMore, page, activeTab, state.user?.id]);

    const handleQuickPost = useCallback(() => {
        if (!composeText.trim()) return;
        showToast('¡Publicado!');
        setComposeText('');
        setShowCompose(false);
    }, [composeText, showToast]);

    return (
        <div className="min-h-screen bg-dark-0">
            <div className="max-w-[1180px] mx-auto px-4 lg:px-5 pt-5 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] gap-5">

                    {/* LEFT */}
                    <div className="hidden lg:block"><div className="sticky top-20"><LeftCol /></div></div>

                    {/* CENTER */}
                    <main className="space-y-3 min-w-0">
                        {/* Compose */}
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f11] p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                    {name.charAt(0)}
                                </div>
                                <button onClick={() => setShowCompose(true)}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[13px] text-white/25 text-left hover:bg-white/[0.05] hover:border-white/[0.1] transition-all">
                                    ¿Qué estás creando, {name}?
                                </button>
                            </div>
                            <div className="flex items-center gap-1 mt-3 ml-12">
                                {[
                                    { Icon: ImageIcon, label: 'Imagen', gradient: 'from-emerald-500 to-teal-600', href: '/create/portfolio' },
                                    { Icon: Zap, label: 'Proyecto', gradient: 'from-accent-500 to-orange-600', href: '/create/portfolio' },
                                    { Icon: Hash, label: 'Artículo', gradient: 'from-blue-500 to-indigo-600', href: '/create/article' },
                                ].map(a => (
                                    <button key={a.label} onClick={() => router.push(a.href)}
                                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all">
                                        <div className={`w-5 h-5 rounded bg-gradient-to-br ${a.gradient} flex items-center justify-center`}><a.Icon className="w-3 h-3 text-white" /></div>
                                        <span className="text-[11px] font-medium text-white/40 group-hover:text-white/60 transition-colors">{a.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Compose Modal */}
                        <AnimatePresence>
                            {showCompose && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCompose(false)}>
                                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }} onClick={e => e.stopPropagation()}
                                        className="w-full max-w-lg mx-4 bg-[#141416] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden">
                                        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                                            <h3 className="text-sm font-semibold text-white/90">Crear publicación</h3>
                                            <button onClick={() => setShowCompose(false)} className="p-1 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-all"><X className="w-4 h-4" /></button>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex gap-3">
                                                <div className="w-9 h-9 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{name.charAt(0)}</div>
                                                <textarea value={composeText} onChange={e => setComposeText(e.target.value)} placeholder={`¿Qué estás creando, ${name}?`}
                                                    className="flex-1 bg-transparent text-[13px] text-white/90 placeholder-white/25 resize-none outline-none min-h-[100px]" autoFocus />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                                            <div className="flex gap-1">
                                                <button onClick={() => { setShowCompose(false); router.push('/create/portfolio'); }} className="p-2 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-emerald-400 transition-all" title="Subir imagen"><ImageIcon className="w-4 h-4" /></button>
                                                <button onClick={() => { setShowCompose(false); router.push('/create/article'); }} className="p-2 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-blue-400 transition-all" title="Escribir artículo"><FileText className="w-4 h-4" /></button>
                                            </div>
                                            <button onClick={handleQuickPost} disabled={!composeText.trim()}
                                                className="px-4 py-1.5 rounded-lg bg-accent-500 hover:bg-accent-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[12px] font-semibold transition-all flex items-center gap-1.5">
                                                <Send className="w-3.5 h-3.5" /> Publicar
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Filter tabs */}
                        <div className="flex items-center gap-1 rounded-2xl border border-white/[0.06] bg-[#0f0f11] p-1">
                            {[
                                { Icon: Sparkles, label: 'Para ti' as const },
                                { Icon: Users, label: 'Siguiendo' as const },
                                { Icon: Flame, label: 'Trending' as const },
                            ].map(f => (
                                <button key={f.label} onClick={() => setActiveTab(f.label)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-all
                                    ${activeTab === f.label
                                            ? 'bg-gradient-to-r from-accent-500/15 to-orange-500/10 text-accent-400 border border-accent-500/20 shadow-inner'
                                            : 'text-white/25 hover:text-white/50 hover:bg-white/[0.03]'}`}>
                                    <f.Icon className="w-3.5 h-3.5" /> {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Posts */}
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {posts.map((p, i) => <Post key={p.id} post={p} i={i} onToast={showToast} />)}
                                {/* Infinite scroll sentinel */}
                                <div ref={sentinelRef} className="h-1" />
                                {loadingMore && (
                                    <div className="flex justify-center py-6">
                                        <Loader2 className="w-5 h-5 text-accent-500 animate-spin" />
                                    </div>
                                )}
                                {!hasMore && <p className="text-center text-[12px] text-white/15 py-6 flex items-center justify-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Has visto todo por ahora</p>}
                            </>
                        )}
                    </main>

                    {/* RIGHT */}
                    <div className="hidden lg:block"><div className="sticky top-20"><RightCol onToast={showToast} /></div></div>
                </div>
            </div>

            <AnimatePresence>{toast && <Toast message={toast} onClose={() => setToast(null)} />}</AnimatePresence>
        </div>
    );
}

export default FeedPage;
