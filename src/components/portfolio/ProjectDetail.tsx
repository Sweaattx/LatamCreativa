'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Share2,
  Bookmark,
  MessageCircle,
  ArrowLeft,
  MapPin,
  UserPlus,
  UserCheck,
  MessageSquare,
  Users,
  Send,
  Trash2,
  Loader2,
  Eye,
  ThumbsUp,
} from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { interactionsService } from '@/services/supabase/interactions';
import { usersSocial } from '@/services/supabase/users/social';
import type { PortfolioItem } from '@/types/content';

interface ProjectAuthor {
  id: string;
  username?: string;
  name?: string;
  avatar?: string;
  role?: string;
  location?: string;
}

interface Comment {
  id: string;
  text: string;
  authorName: string;
  authorAvatar: string | null;
  createdAt: string;
}

interface ProjectDetailProps {
  project: PortfolioItem;
  author: ProjectAuthor | null;
  relatedProjects: PortfolioItem[];
}

export function ProjectDetail({ project, author, relatedProjects }: ProjectDetailProps) {
  const { state, actions } = useAppStore();
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(typeof project.likes === 'number' ? project.likes : 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const saved = state.savedItems.some(s => s.id === project.id);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  useEffect(() => {
    if (!state.user) return;
    interactionsService.isLiked('project', project.id, state.user.id).then(setLiked).catch(() => { });
    if (author) usersSocial.isFollowing(state.user.id, author.id).then(setFollowing).catch(() => { });
  }, [state.user, project.id, author]);

  const loadComments = useCallback(async () => {
    try {
      const data = await interactionsService.getComments('project', project.id);
      setComments(data);
    } catch { /* */ }
    setCommentsLoaded(true);
  }, [project.id]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const handleLike = async () => {
    if (!state.user) { router.push('/login'); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const nowLiked = await interactionsService.toggleLike('project', project.id, state.user.id);
      setLiked(nowLiked);
      setLikeCount(p => nowLiked ? p + 1 : p - 1);
    } catch { /* */ }
    setLikeLoading(false);
  };

  const handleFollow = async () => {
    if (!state.user || !author) { router.push('/login'); return; }
    if (followLoading) return;
    setFollowLoading(true);
    const sb = (await import('@/lib/supabase/client')).getSupabaseClient();
    try {
      if (following) {
        const { error } = await (sb as any).from('followers').delete().eq('follower_id', state.user.id).eq('following_id', author.id);
        if (error) throw error;
        setFollowing(false);
        actions.showToast(`Dejaste de seguir a ${author.name || 'este usuario'}`, 'success');
      } else {
        const { error } = await (sb as any).from('followers').insert({ follower_id: state.user.id, following_id: author.id });
        if (error) throw error;
        setFollowing(true);
        actions.showToast(`Ahora sigues a ${author.name || 'este usuario'}`, 'success');
      }
    } catch (err: any) {
      console.error('Follow error details:', JSON.stringify(err));
      actions.showToast('Error al seguir. Intenta de nuevo.', 'error');
    }
    setFollowLoading(false);
  };

  const handleContact = () => {
    if (!state.user) { router.push('/login'); return; }
    if (author) {
      const authorName = encodeURIComponent(author.name || 'Usuario');
      router.push(`/messages?to=${author.id}&name=${authorName}`);
    }
  };
  const handleShare = async () => { try { if (navigator.share) await navigator.share({ title: project.title, url: window.location.href }); else { await navigator.clipboard.writeText(window.location.href); actions.showToast('URL copiada al portapapeles', 'success'); } } catch { /* */ } };
  const handleSave = () => { actions.toggleSave({ id: project.id, title: project.title, image: project.image || '', slug: project.slug || '' }); actions.showToast(saved ? 'Eliminado de guardados' : 'Guardado en tu colección', 'success'); };

  const handleComment = async () => {
    if (!state.user || !commentText.trim() || commentLoading) return;
    setCommentLoading(true);
    try { await interactionsService.addComment('project', project.id, state.user.id, commentText.trim()); setCommentText(''); await loadComments(); }
    catch { actions.showToast('Error al comentar', 'error'); }
    setCommentLoading(false);
  };

  const handleDeleteComment = async (id: string) => {
    if (!state.user) return;
    try { await interactionsService.deleteComment(id, state.user.id); setComments(prev => prev.filter(c => c.id !== id)); } catch { /* */ }
  };

  const mainImg = project.image || '';
  const allMedia = (project.gallery || []).length > 0
    ? (project.gallery || []).filter(i => i.url !== mainImg).map(i => ({ url: i.url, caption: i.caption || '' }))
    : (project.images || []).filter(u => u !== mainImg).map(u => ({ url: u, caption: '' }));

  const badges = [...(project.category ? [project.category] : []), ...(project.tools || [])].filter((v, i, a) => a.indexOf(v) === i);

  const pubDate = project.createdAt ? new Date(project.createdAt).toLocaleDateString('es-LA', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
  const viewsNum = typeof project.views === 'number' ? project.views : 0;
  const viewsStr = viewsNum >= 1000 ? `${(viewsNum / 1000).toFixed(1)}K` : String(viewsNum);

  const timeAgo = (date: string) => { const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000); if (m < 60) return `hace ${m}m`; const h = Math.floor(m / 60); if (h < 24) return `hace ${h}h`; return `hace ${Math.floor(h / 24)}d`; };

  const sideCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: '14px 16px',
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: '0 0 10px 0',
  };

  return (
    <div>
      {/* ══════ STICKY TOP BAR ══════ */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(10,10,15,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <Link href="/portfolio" style={{ flexShrink: 0, padding: 8, color: 'rgba(255,255,255,0.35)', borderRadius: 10, display: 'flex', background: 'rgba(255,255,255,0.03)' }}>
              <ArrowLeft style={{ width: 18, height: 18 }} />
            </Link>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{project.title}</p>
              {author && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>{author.name} &middot; {project.category || 'Proyecto'}</p>}
            </div>
          </div>
          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={handleLike} disabled={likeLoading} className="topbar-btn" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: liked ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)', color: liked ? '#f87171' : 'rgba(255,255,255,0.5)', transition: 'all 0.25s' }}>
              <Heart style={{ width: 15, height: 15, fill: liked ? 'currentColor' : 'none', transition: 'all 0.25s' }} />
              {liked ? 'Te gusta' : 'Me gusta'}
            </button>
            <button onClick={handleSave} className="topbar-btn" style={{ padding: 9, borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', color: saved ? '#fbbf24' : 'rgba(255,255,255,0.4)', transition: 'all 0.25s' }}>
              <Bookmark style={{ width: 17, height: 17, fill: saved ? 'currentColor' : 'none' }} />
            </button>
            <button onClick={handleShare} className="topbar-btn" style={{ padding: 9, borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', transition: 'all 0.25s' }}>
              <Share2 style={{ width: 17, height: 17 }} />
            </button>
          </div>
        </div>
      </div>

      {/* ══════ CONTENT BODY ══════ */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 28 }} className="pd-grid">

          {/* ══════ LEFT COLUMN ══════ */}
          <div style={{ minWidth: 0, overflow: 'hidden' }} className="pd-main">

            {/* Title block */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1.15, margin: 0, letterSpacing: '-0.02em' }}>
                {project.title}
              </h1>
              {pubDate && (
                <p style={{ marginTop: 10, fontSize: 13, color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>
                  Publicado el {pubDate}
                </p>
              )}
            </motion.div>

            {/* Badges */}
            {badges.length > 0 && project.description && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {badges.map(b => (
                  <span key={b} style={{ padding: '6px 16px', fontSize: 12, fontWeight: 600, borderRadius: 9999, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>{b}</span>
                ))}
              </motion.div>
            )}

            {/* Description */}
            {project.description && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ marginTop: 16 }}>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', whiteSpace: 'pre-wrap', margin: 0 }}>{project.description}</p>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginTop: 20, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', aspectRatio: '16/9', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
              {project.image ? (
                <Image src={project.image} alt={project.title} fill style={{ objectFit: 'cover' }} priority unoptimized />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a1a,#0d0d0d)' }} />
              )}
            </motion.div>

            {/* Gallery */}
            {allMedia.length > 0 && allMedia.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }} style={{ marginTop: 16 }}>
                <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', aspectRatio: '16/9', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
                  <Image src={item.url} alt={`${project.title} - ${i + 1}`} fill style={{ objectFit: 'cover' }} unoptimized />
                </div>
                {item.caption && (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 3, height: 18, borderRadius: 2, background: '#f59e0b' }} />
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', margin: 0 }}>{item.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}

            {/* ─── Comments ─── */}
            <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 14px' }}>
                <MessageCircle style={{ width: 18, height: 18, color: '#f59e0b' }} />
                Comentarios
                <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.25)' }}>({comments.length})</span>
              </h2>

              {state.user ? (

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {state.user.avatar ? <Image src={state.user.avatar} alt="" width={38} height={38} style={{ borderRadius: '50%', objectFit: 'cover' }} unoptimized /> : <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>{state.user.name?.charAt(0) || '?'}</span>}
                  </div>
                  <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                    <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleComment()} placeholder="Escribe un comentario..." style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '11px 16px', fontSize: 14, color: '#fff', outline: 'none', transition: 'border 0.2s' }} />
                    <button onClick={handleComment} disabled={!commentText.trim() || commentLoading} style={{ padding: '11px 16px', borderRadius: 12, border: 'none', cursor: commentText.trim() ? 'pointer' : 'default', background: commentText.trim() ? '#f59e0b' : 'rgba(255,255,255,0.04)', color: commentText.trim() ? '#000' : 'rgba(255,255,255,0.15)', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}>
                      {commentLoading ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: 16, height: 16 }} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', textAlign: 'center', marginBottom: 24 }}>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}><Link href="/login" style={{ color: '#f59e0b', fontWeight: 600, textDecoration: 'none' }}>Inicia sesión</Link> para comentar</p>
                </div>
              )}

              <div>
                {!commentsLoaded ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 28 }}>
                    <Loader2 style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.2)', animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>Cargando...</span>
                  </div>
                ) : comments.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.15)', textAlign: 'center', padding: '12px 0' }}>Sé el primero en comentar</p>
                ) : (
                  <AnimatePresence>
                    {comments.map(c => (
                      <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: 12, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {c.authorAvatar ? <Image src={c.authorAvatar} alt="" width={34} height={34} style={{ borderRadius: '50%', objectFit: 'cover' }} unoptimized /> : <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>{c.authorName.charAt(0)}</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{c.authorName}</span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>{timeAgo(c.createdAt)}</span>
                          </div>
                          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '6px 0 0', lineHeight: 1.5 }}>{c.text}</p>
                        </div>
                        {state.user?.id && (
                          <button onClick={() => handleDeleteComment(c.id)} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.1)', flexShrink: 0, alignSelf: 'flex-start', borderRadius: 6 }}>
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>

          {/* ══════ RIGHT SIDEBAR ══════ */}
          <div className="pd-side">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Author Card */}
              {author && (
                <div style={sideCard}>
                  <Link href={`/user/${author.username || author.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#1a1a1a', border: '2px solid rgba(255,255,255,0.08)' }}>
                      {author.avatar
                        ? <Image src={author.avatar} alt={author.name || ''} width={44} height={44} style={{ objectFit: 'cover', width: '100%', height: '100%' }} unoptimized />
                        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#f59e0b,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>{author.name?.charAt(0) || '?'}</div>
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>{author.name || 'Anónimo'}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>{author.role || 'Creativo'}</p>
                    </div>
                  </Link>

                  {author.location && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, marginLeft: 2 }}>
                      <MapPin style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.2)' }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{author.location}</span>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                    <button onClick={handleFollow} disabled={followLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', background: following ? 'rgba(255,255,255,0.05)' : '#f59e0b', color: following ? 'rgba(255,255,255,0.6)' : '#000', fontSize: 12, fontWeight: 600, borderRadius: 8, border: following ? '1px solid rgba(255,255,255,0.08)' : 'none', cursor: 'pointer', transition: 'all 0.25s' }}>
                      {followLoading ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : following ? <><UserCheck style={{ width: 14, height: 14 }} /> Siguiendo</> : <><UserPlus style={{ width: 14, height: 14 }} /> Seguir</>}
                    </button>
                    <button onClick={handleContact} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.25s' }}>
                      <MessageSquare style={{ width: 14, height: 14 }} /> Contactar
                    </button>
                  </div>
                </div>
              )}

              <div style={sideCard}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
                  <div><p style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>{viewsStr}</p><p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Vistas</p></div>
                  <div><p style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>{likeCount}</p><p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Likes</p></div>
                  <div><p style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>{comments.length}</p><p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Coment.</p></div>
                </div>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div style={sideCard}>
                  <h3 style={sectionLabel}>Etiquetas</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {project.tags.map(t => (
                      <span key={t} style={{ padding: '5px 12px', fontSize: 12, fontWeight: 500, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>#{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={sideCard}>
                <h3 style={sectionLabel}>Colaboradores</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.06)' }}>
                  <Users style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.15)' }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Sin colaboradores</span>
                </div>
              </div>

              {/* More from author */}
              {author && (
                <div style={sideCard}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h3 style={{ ...sectionLabel, margin: 0 }}>Más de {author.name?.split(' ')[0] || 'este autor'}</h3>
                    <Link href={`/user/${author.username || author.id}`} style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, textDecoration: 'none' }}>Ver todo →</Link>
                  </div>
                  {relatedProjects.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {relatedProjects.slice(0, 4).map(r => (
                        <Link key={r.id} href={`/portfolio/${r.slug}`} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden', display: 'block', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.04)' }}>
                          {r.image ? <Image src={r.image} alt={r.title} fill style={{ objectFit: 'cover' }} unoptimized /> : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#2a2a2a,#1a1a1a)' }} />}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.06)', textAlign: 'center' }}>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.18)', margin: 0 }}>Sin más proyectos por ahora</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .topbar-btn:hover { background: rgba(255,255,255,0.08) !important; }
        @media (min-width: 1024px) {
          .pd-grid { grid-template-columns: 1fr 340px !important; }
          .pd-side { grid-column: 2 !important; grid-row: 1 !important; position: sticky !important; top: 84px !important; align-self: start !important; }
          .pd-main { grid-column: 1 !important; grid-row: 1 !important; }
        }
      `}</style>
    </div>
  );
}
