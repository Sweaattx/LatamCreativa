'use client';

/**
 * ForumStats Component
 * 
 * Widget de estadísticas del foro para sidebar.
 */
import React from 'react';
import { MessageCircle, Users, TrendingUp, Clock } from 'lucide-react';
import { useForumStats, useRecentThreads } from '../../hooks/useForumHooks';
import { useRouter } from 'next/navigation';

interface ForumStatsProps {
    showRecentThreads?: boolean;
}

export const ForumStats: React.FC<ForumStatsProps> = ({ showRecentThreads = true }) => {
    const { stats, loading: statsLoading } = useForumStats();
    const { threads: recentThreads, loading: threadsLoading } = useRecentThreads(5);
    const router = useRouter();

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="bg-dark-2/60 border border-dark-5/50 rounded-xl p-5">
                <h3 className="text-content-1 font-medium mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent-500" />
                    Estadísticas
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-0/30 rounded-lg p-3 text-center">
                        <div className="text-2xl font-light text-content-1">
                            {statsLoading ? '...' : stats.totalThreads.toLocaleString()}
                        </div>
                        <div className="text-xs text-content-3">Hilos</div>
                    </div>
                    <div className="bg-dark-0/30 rounded-lg p-3 text-center">
                        <div className="text-2xl font-light text-content-1">
                            {statsLoading ? '...' : stats.totalReplies.toLocaleString()}
                        </div>
                        <div className="text-xs text-content-3">Respuestas</div>
                    </div>
                </div>
            </div>

            {/* Recent Threads */}
            {showRecentThreads && (
                <div className="bg-dark-2/60 border border-dark-5/50 rounded-xl p-5">
                    <h3 className="text-content-1 font-medium mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-accent-500" />
                        Hilos Recientes
                    </h3>

                    {threadsLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-4 bg-dark-4 rounded w-3/4 mb-1" />
                                    <div className="h-3 bg-dark-3 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : recentThreads.length === 0 ? (
                        <p className="text-content-3 text-sm text-center py-4">
                            No hay hilos aún
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {recentThreads.map(thread => (
                                <div
                                    key={thread.id}
                                    onClick={() => router.push(`/forum/${thread.slug || thread.id}`)}
                                    className="cursor-pointer group"
                                >
                                    <h4 className="text-sm text-content-2 group-hover:text-accent-400 transition-colors line-clamp-1">
                                        {thread.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-content-3">
                                        <span>{thread.authorName}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="w-3 h-3" />
                                            {thread.replies}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Community Guidelines */}
            <div className="bg-gradient-to-br from-accent-500/10 to-dev-500/10 border border-accent-500/20 rounded-xl p-5">
                <h3 className="text-content-1 font-medium mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent-500" />
                    Comunidad
                </h3>
                <ul className="text-sm text-content-2 space-y-2">
                    <li className="flex items-start gap-2">
                        <span className="text-accent-500">•</span>
                        Sé respetuoso con todos
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-accent-500">•</span>
                        Busca antes de preguntar
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-accent-500">•</span>
                        Comparte tu conocimiento
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-accent-500">•</span>
                        Marca las respuestas útiles
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ForumStats;
