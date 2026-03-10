'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, LinkIcon, Calendar, Users, Grid, FileText,
    Heart, Bookmark, Settings, Share2, MoreHorizontal,
    Eye, MessageCircle, ExternalLink, Award, Layers,
    Github, Twitter, Instagram, Globe, Youtube, Linkedin,
    Music, Pin, Palette, UserPlus, UserCheck, Flag, Loader2,
} from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { CurriculumCard, CurriculumModal } from '@/components/modals/CurriculumModal';
import { friendsService } from '@/services/supabase/friends';
import { chatService } from '@/services/supabase/chat';
import { reportsService } from '@/services/supabase/reports';
import { ReportModal } from '@/components/modals/ReportModal';
import type { ExperienceItem, EducationItem } from '@/types/user';

interface UserProfileViewProps {
    user: Record<string, unknown>;
    projects: Record<string, unknown>[];
    articles: Record<string, unknown>[];
    stats: {
        followers: number;
        following: number;
        projects: number;
    };
}

type ProfileTab = 'portfolio' | 'blog' | 'collections';

const TABS: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
    { id: 'portfolio', label: 'Portafolio', icon: Layers },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'collections', label: 'Colecciones', icon: Bookmark },
];

function fmt(n: number): string {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-LA', { year: 'numeric', month: 'long' });
}

/* Social icon mapper */
function SocialIcon({ platform }: { platform: string }) {
    const p = platform.toLowerCase();
    if (p.includes('github')) return <Github className="w-4 h-4" />;
    if (p.includes('twitter') || p === 'x') return <Twitter className="w-4 h-4" />;
    if (p.includes('instagram')) return <Instagram className="w-4 h-4" />;
    if (p.includes('youtube')) return <Youtube className="w-4 h-4" />;
    if (p.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    if (p.includes('tiktok')) return <Music className="w-4 h-4" />;
    if (p.includes('pinterest')) return <Pin className="w-4 h-4" />;
    if (p.includes('behance') || p.includes('dribbble') || p.includes('artstation') || p.includes('vimeo')) return <Palette className="w-4 h-4" />;
    if (p.includes('website')) return <Globe className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
}

export function UserProfileView({ user, projects, articles, stats }: UserProfileViewProps) {
    const router = useRouter();
    const { state } = useAppStore();
    const [activeTab, setActiveTab] = useState<ProfileTab>('portfolio');
    const [following, setFollowing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCurriculumModal, setShowCurriculumModal] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [friendStatus, setFriendStatus] = useState<'none' | 'pending-sent' | 'pending-received' | 'friends'>('none');
    const [friendLoading, setFriendLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    const isCreative = state.contentMode === 'creative';
    const isOwnProfile = state.user?.username === user.username;

    const name = String(user.name || 'Usuario');
    const username = String(user.username || 'user');
    const bio = String(user.bio || 'Soy un artista 3D con más de 5 años de experiencia en la industria creativa. Me especializo en modelado de personajes, concept art y visualización arquitectónica.');
    const role = String(user.role || '3D Artist & Designer');
    const location = String(user.location || 'Ciudad de México, México');
    const website = user.website ? String(user.website) : 'artstation.com/demouser';
    const avatar = String(user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF4D00&color=fff&size=256`);
    const coverImage = String(user.coverImage || user.cover_image || user.banner || '');
    const coverPosition = (() => {
        const raw = user.coverPosition ?? user.cover_position;
        if (typeof raw === 'number') return raw;
        if (typeof raw === 'string' && !isNaN(Number(raw))) return Number(raw);
        if (raw === 'top') return 0;
        if (raw === 'bottom') return 100;
        try {
            const saved = localStorage.getItem(`cover_position_${user.id}`);
            if (saved) return Number(saved);
        } catch { /* SSR safe */ }
        return 50;
    })();
    const joinDate = user.created_at ? formatDate(String(user.created_at)) : 'enero de 2024';
    const skills = (user.skills as string[]) || ['Blender', 'ZBrush', 'Substance Painter', 'Photoshop', 'Maya', 'Unreal Engine'];
    const socialLinks = (user.social_links as Record<string, string>) || {};

    // Curriculum data
    const experience = (user.experience as ExperienceItem[]) || [
        { id: 1, role: 'Senior 3D Artist', company: 'Studio Creativo', period: '2023 - Presente', location: 'Ciudad de México', description: 'Liderando el equipo de modelado 3D para producción cinematográfica y videojuegos.' },
        { id: 2, role: '3D Modeler', company: 'Digital Arts Agency', period: '2020 - 2023', location: 'Guadalajara, México', description: 'Creación de assets 3D para campañas publicitarias y experiencias interactivas.' },
    ];
    const education = (user.education as EducationItem[]) || [];

    const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);

    const profileUserId = String(user.id || '');

    // Load friend status
    useEffect(() => {
        if (!state.user?.id || isOwnProfile || !profileUserId) return;
        friendsService.getFriendshipStatus(state.user.id, profileUserId)
            .then(setFriendStatus)
            .catch(() => { });
    }, [state.user?.id, profileUserId, isOwnProfile]);

    // Close more menu on outside click
    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
                setShowMoreMenu(false);
            }
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const handleFriendAction = useCallback(async () => {
        if (!state.user?.id || friendLoading) return;
        setFriendLoading(true);
        try {
            if (friendStatus === 'none') {
                await friendsService.sendRequest(state.user.id, profileUserId);
                setFriendStatus('pending-sent');
            } else if (friendStatus === 'pending-received') {
                // Accept — need to find the request ID first
                const pending = await friendsService.getPendingRequests(state.user.id);
                const req = pending.find(r => r.senderId === profileUserId);
                if (req) {
                    await friendsService.acceptRequest(req.id);
                    setFriendStatus('friends');
                }
            } else if (friendStatus === 'friends') {
                await friendsService.removeFriend(state.user.id, profileUserId);
                setFriendStatus('none');
            }
        } catch (err) {
            console.error('Friend action error:', err);
        } finally {
            setFriendLoading(false);
        }
    }, [state.user?.id, friendStatus, profileUserId, friendLoading]);

    const handleSendMessage = useCallback(async () => {
        if (!state.user?.id || messageLoading) return;
        setMessageLoading(true);
        try {
            const convoId = await chatService.getOrCreateDirect(state.user.id, profileUserId);
            router.push(`/messages?convo=${convoId}`);
        } catch (err) {
            console.error('Message error:', err);
        } finally {
            setMessageLoading(false);
        }
    }, [state.user?.id, profileUserId, messageLoading, router]);

    const handleReport = useCallback(async (reason: string, details: string) => {
        if (!state.user?.id) return;
        await reportsService.createReport({
            reporterId: state.user.id,
            reporterName: state.user.name || 'Usuario',
            contentType: 'user',
            contentId: profileUserId,
            contentTitle: name,
            reason: reason as 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other',
            description: details || undefined,
        });
    }, [state.user?.id, state.user?.name, profileUserId, name]);

    const friendButtonLabel = {
        'none': 'Añadir amigo',
        'pending-sent': 'Solicitud enviada',
        'pending-received': 'Aceptar solicitud',
        'friends': 'Amigos',
    }[friendStatus];

    const FriendIcon = friendStatus === 'friends' ? UserCheck : UserPlus;

    /* Stat values for sidebar */
    const viewsCount = projects.reduce((sum, p) => sum + (Number(p.views) || 0), 0);
    const likesCount = projects.reduce((sum, p) => sum + (Number(p.likes) || 0), 0);

    return (
        <div className="min-h-screen bg-dark-0">
            {/* ============================================
          BANNER — User cover media or abstract gradient
         ============================================ */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative h-64 sm:h-72 md:h-80 overflow-hidden"
            >
                {/* Abstract gradient layers (always behind as fallback) */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: isCreative
                            ? 'linear-gradient(135deg, #1a0a00 0%, #2d1200 20%, #4a1a00 40%, #1a0020 60%, #2d0050 80%, #0a0015 100%)'
                            : 'linear-gradient(135deg, #000a1a 0%, #001233 20%, #001a4a 40%, #100020 60%, #1a0040 80%, #000a15 100%)',
                    }}
                />
                {/* Wavy color accent shapes */}
                <div
                    className="absolute inset-0 opacity-70"
                    style={{
                        background: isCreative
                            ? `
                radial-gradient(ellipse 80% 60% at 30% 70%, rgba(255,77,0,0.4) 0%, transparent 60%),
                radial-gradient(ellipse 60% 80% at 60% 40%, rgba(180,0,200,0.35) 0%, transparent 55%),
                radial-gradient(ellipse 50% 50% at 80% 60%, rgba(255,130,0,0.3) 0%, transparent 50%)
              `
                            : `
                radial-gradient(ellipse 80% 60% at 30% 70%, rgba(59,130,246,0.4) 0%, transparent 60%),
                radial-gradient(ellipse 60% 80% at 60% 40%, rgba(100,50,200,0.35) 0%, transparent 55%),
                radial-gradient(ellipse 50% 50% at 80% 60%, rgba(96,165,250,0.3) 0%, transparent 50%)
              `,
                    }}
                />

                {coverImage && coverImage.startsWith('http') && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={coverImage}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectPosition: `center ${coverPosition}%`, imageRendering: 'auto' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                )}

                {/* Bottom fade into dark-0 */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-dark-0 to-transparent" />
            </motion.div>

            {/* ============================================
          PROFILE HEADER — overlapping banner
         ============================================ */}
            <div className="relative w-full px-8 md:px-12 lg:px-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="relative -mt-16 sm:-mt-20 mb-6 flex flex-col sm:flex-row sm:items-end gap-4"
                >
                    {/* Avatar — square with rounded corners, overlapping */}
                    <div className="relative flex-shrink-0">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden">
                            <Image
                                src={avatar}
                                alt={name}
                                width={128}
                                height={128}
                                className="object-cover w-full h-full"
                                unoptimized
                            />
                        </div>
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-content-1 truncate">
                                        {name}
                                    </h1>
                                    <span className="flex-shrink-0 px-2.5 py-0.5 bg-green-500/15 text-green-400 text-xs font-semibold rounded-full uppercase tracking-wide">
                                        Disponible
                                    </span>
                                </div>
                                <p className="text-content-2 text-sm mt-0.5">{role}</p>
                                {/* Meta info row */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-content-3">
                                    {location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" /> {location}
                                        </span>
                                    )}
                                    {website && (
                                        <a
                                            href={website.startsWith('http') ? website : `https://${website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-accent-400 hover:text-accent-300"
                                        >
                                            <LinkIcon className="w-3.5 h-3.5" /> {website.replace(/^https?:\/\//, '')}
                                        </a>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" /> Se unió en {joinDate}
                                    </span>
                                </div>
                            </div>

                            {/* Edit Profile / Follow button */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {isOwnProfile ? (
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="px-4 py-2 bg-dark-2 border border-dark-5 text-content-1 rounded-xl text-sm font-medium hover:bg-dark-3 flex items-center gap-2"
                                    >
                                        <Settings className="w-4 h-4" /> Editar Perfil
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setFollowing(!following)}
                                            className={`px-5 py-2 rounded-xl text-sm font-medium ${following
                                                ? 'bg-dark-2 border border-dark-5 text-content-1 hover:border-red-500 hover:text-red-400'
                                                : 'bg-accent-500 text-white hover:bg-accent-600'
                                                }`}
                                        >
                                            {following ? 'Siguiendo' : 'Seguir'}
                                        </button>
                                        {/* More actions dropdown */}
                                        <div ref={moreMenuRef} className="relative">
                                            <button
                                                onClick={() => setShowMoreMenu(!showMoreMenu)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-dark-2 border border-dark-5 text-content-3 hover:text-content-1 hover:bg-dark-3"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                            {showMoreMenu && (
                                                <div className="absolute right-0 top-full mt-2 w-52 py-1.5 bg-dark-2 border border-dark-5 rounded-xl z-50 animate-scale-in shadow-modal">
                                                    {state.user && (
                                                        <>
                                                            <button
                                                                onClick={() => { handleSendMessage(); setShowMoreMenu(false); }}
                                                                disabled={messageLoading}
                                                                className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-content-2 hover:text-content-1 hover:bg-dark-3/50 transition-colors disabled:opacity-50"
                                                            >
                                                                {messageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                                                                Enviar mensaje
                                                            </button>
                                                            <button
                                                                onClick={() => { handleFriendAction(); setShowMoreMenu(false); }}
                                                                disabled={friendLoading || friendStatus === 'pending-sent'}
                                                                className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-content-2 hover:text-content-1 hover:bg-dark-3/50 transition-colors disabled:opacity-50"
                                                            >
                                                                {friendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FriendIcon className="w-4 h-4" />}
                                                                {friendButtonLabel}
                                                            </button>
                                                            <div className="border-t border-dark-5 my-1" />
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => { setShowReportModal(true); setShowMoreMenu(false); }}
                                                        className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-red-400 hover:bg-dark-3/50 transition-colors"
                                                    >
                                                        <Flag className="w-4 h-4" />
                                                        Reportar usuario
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ============================================
            TWO-COLUMN LAYOUT
           ============================================ */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 pb-16"
                >
                    {/* ---- LEFT SIDEBAR ---- */}
                    <aside className="space-y-6">
                        {/* Stats Box */}
                        <div className="bg-dark-1 border border-dark-5/60 rounded-2xl p-5">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="text-xl font-bold text-content-1">{fmt(viewsCount || 45000)}</p>
                                    <p className="text-[11px] text-content-3 uppercase tracking-wider mt-0.5">Vistas</p>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-content-1">{fmt(likesCount || 3200)}</p>
                                    <p className="text-[11px] text-content-3 uppercase tracking-wider mt-0.5">Likes</p>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-content-1">{fmt(stats.followers)}</p>
                                    <p className="text-[11px] text-content-3 uppercase tracking-wider mt-0.5">Seguidores</p>
                                </div>
                            </div>
                        </div>

                        {/* About */}
                        <div>
                            <h3 className="text-xs font-semibold text-content-1 uppercase tracking-wider mb-3">
                                Sobre Mí
                            </h3>
                            <p className="text-sm text-content-2 leading-relaxed">{bio}</p>

                            {/* Social Links */}
                            {Object.keys(socialLinks).length > 0 && (
                                <div className="flex items-center gap-2 mt-4">
                                    {Object.entries(socialLinks).map(([platform, url]) => (
                                        <a
                                            key={platform}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-dark-2 border border-dark-5/60 text-content-3 hover:text-accent-400 hover:border-accent-500/30"
                                        >
                                            <SocialIcon platform={platform} />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Skills */}
                        {skills.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold text-content-1 uppercase tracking-wider mb-3">
                                    Habilidades
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-3 py-1.5 bg-dark-2 border border-dark-5/60 text-content-2 text-xs rounded-lg"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Ver Currículum */}
                        {(experience.length > 0 || education.length > 0) && (
                            <CurriculumCard
                                experienceCount={experience.length}
                                educationCount={education.length}
                                onClick={() => setShowCurriculumModal(true)}
                            />
                        )}
                    </aside>

                    {/* ---- RIGHT CONTENT ---- */}
                    <div>
                        {/* Tabs */}
                        <div className="flex items-center gap-1 mb-6 border-b border-dark-5/40 pb-px">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === tab.id
                                        ? 'text-accent-400'
                                        : 'text-content-3 hover:text-content-1'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                    <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id
                                        ? 'bg-accent-500/15 text-accent-400'
                                        : 'bg-dark-3 text-content-3'
                                        }`}>
                                        {tab.id === 'portfolio' ? projects.length : tab.id === 'blog' ? articles.length : (state.savedItems || []).length}
                                    </span>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="profile-tab-indicator"
                                            className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent-500 rounded-full"
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                            >
                                {activeTab === 'portfolio' && (
                                    <ProfilePortfolioGrid items={projects} />
                                )}
                                {activeTab === 'blog' && (
                                    <ProfileArticlesList items={articles} />
                                )}
                                {activeTab === 'collections' && (() => {
                                    const saved = state.savedItems || [];
                                    return saved.length > 0 ? (
                                        <div>
                                            <p className="text-sm text-content-3 mb-4">{saved.length} proyecto{saved.length !== 1 ? 's' : ''} guardado{saved.length !== 1 ? 's' : ''}</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {saved.map((item) => (
                                                    <Link key={item.id} href={`/portfolio/${item.slug}`} className="group">
                                                        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-dark-2">
                                                            {item.image ? (
                                                                <Image
                                                                    src={item.image}
                                                                    alt={item.title}
                                                                    fill
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                                    unoptimized
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-dark-3 to-dark-4" />
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                                                <p className="text-sm text-white font-medium line-clamp-2">{item.title}</p>
                                                            </div>
                                                            <div className="absolute top-2 right-2">
                                                                <Bookmark className="w-4 h-4 text-amber-500 fill-current" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={Bookmark}
                                            title="Sin guardados aún"
                                            subtitle="Los proyectos que guardes con el ícono 🔖 aparecerán aquí."
                                        />
                                    );
                                })()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />

            {/* Report Modal */}
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleReport}
                contentType="usuario"
            />

            {/* Curriculum Modal */}
            <CurriculumModal
                isOpen={showCurriculumModal}
                onClose={() => setShowCurriculumModal(false)}
                userName={name}
                experience={experience}
                education={education}
            />
        </div>
    );
}

/* ============================================
   Portfolio Grid (inside profile)
   ============================================ */
function ProfilePortfolioGrid({ items }: { items: Record<string, unknown>[] }) {
    if (items.length === 0) {
        return (
            <EmptyState
                icon={Layers}
                title="Sin proyectos publicados"
                subtitle="Comparte tus creaciones con la comunidad."
                showCreate
            />
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
                <Link
                    key={String(item.id)}
                    href={`/portfolio/${item.slug}`}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-dark-2"
                >
                    {item.image ? (
                        <Image
                            src={String(item.image)}
                            alt={String(item.title)}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-dark-3 to-dark-2" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <p className="text-sm font-medium text-white truncate">{String(item.title)}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-white/70">
                            {Number(item.likes) > 0 && (
                                <span className="flex items-center gap-1">
                                    <Heart className="w-3 h-3" /> {fmt(Number(item.likes))}
                                </span>
                            )}
                            {Number(item.views) > 0 && (
                                <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> {fmt(Number(item.views))}
                                </span>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

/* ============================================
   Articles List
   ============================================ */
function ProfileArticlesList({ items }: { items: Record<string, unknown>[] }) {
    if (items.length === 0) {
        return (
            <EmptyState
                icon={FileText}
                title="Sin artículos publicados"
                subtitle="Comparte tu conocimiento con la comunidad."
            />
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <Link
                    key={String(item.id)}
                    href={`/blog/${item.slug}`}
                    className="flex items-center gap-4 p-4 bg-dark-1 border border-dark-5/40 rounded-xl hover:border-accent-500/30 transition-colors"
                >
                    {typeof item.image === 'string' && item.image && (
                        <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-dark-2">
                            <Image
                                src={String(item.image)}
                                alt={String(item.title)}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-accent-400 font-medium mb-1">{String(item.category || 'Artículo')}</p>
                        <h4 className="text-sm font-medium text-content-1 truncate">{String(item.title)}</h4>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-content-3">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {fmt(Number(item.likes || 0))}</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {fmt(Number(item.views || 0))}</span>
                            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {Number(item.comments || 0)}</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

/* ============================================
   Empty State
   ============================================ */
function EmptyState({
    icon: Icon,
    title,
    subtitle,
    showCreate = false,
}: {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    showCreate?: boolean;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-dark-1/50 border border-dark-5/30 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-dark-2 border border-dark-5/50 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-content-3" />
            </div>
            <p className="text-content-1 font-medium">{title}</p>
            <p className="text-sm text-content-3 mt-1 max-w-xs">{subtitle}</p>
            {showCreate && (
                <Link
                    href="/create/portfolio"
                    className="mt-5 px-5 py-2.5 bg-accent-500 text-white text-sm font-medium rounded-xl hover:bg-accent-600 flex items-center gap-2"
                >
                    + Crear Proyecto
                </Link>
            )}
        </div>
    );
}
