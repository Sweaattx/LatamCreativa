'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, Heart, MessageCircle, UserPlus, AtSign, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/hooks/useAppStore';
import { notificationsService, type Notification } from '@/services/supabase/notifications';
import Link from 'next/link';

const TYPE_ICONS: Record<string, React.ElementType> = {
    like: Heart,
    comment: MessageCircle,
    follow: UserPlus,
    mention: AtSign,
    system: Info,
};

const TYPE_COLORS: Record<string, string> = {
    like: 'text-rose-400 bg-rose-500/10',
    comment: 'text-blue-400 bg-blue-500/10',
    follow: 'text-emerald-400 bg-emerald-500/10',
    mention: 'text-amber-400 bg-amber-500/10',
    system: 'text-violet-400 bg-violet-500/10',
};

function timeAgo(d: string) {
    const diff = (Date.now() - new Date(d).getTime()) / 1000;
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
}

export function NotificationBell() {
    const { state } = useAppStore();
    const userId = state.user?.id;
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unread, setUnread] = useState(0);
    const panelRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        try {
            const [items, count] = await Promise.all([
                notificationsService.getAll(userId),
                notificationsService.getUnreadCount(userId),
            ]);
            setNotifications(items);
            setUnread(count);
        } catch { /* fallback */ }
    }, [userId]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    useEffect(() => {
        if (!userId) return;
        const unsubscribe = notificationsService.subscribeToNew(userId, (n) => {
            setNotifications(prev => [n, ...prev]);
            setUnread(prev => prev + 1);
        });
        return unsubscribe;
    }, [userId]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleMarkAllRead = async () => {
        if (!userId) return;
        await notificationsService.markAllAsRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnread(0);
    };

    const handleClick = async (n: Notification) => {
        if (!n.read) {
            await notificationsService.markAsRead(n.id);
            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
            setUnread(prev => Math.max(0, prev - 1));
        }
        setOpen(false);
    };

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={() => setOpen(p => !p)}
                className="relative p-2 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white/80 transition-all"
            >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center px-1 animate-pulse">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 z-50 w-80 max-h-[420px] bg-[#141416] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                            <h3 className="text-sm font-semibold text-white/90">Notificaciones</h3>
                            <div className="flex items-center gap-1">
                                {unread > 0 && (
                                    <button onClick={handleMarkAllRead} className="p-1 rounded-md hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-all" title="Marcar todo como leído">
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                                <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[360px]">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Bell className="w-8 h-8 text-white/10 mx-auto mb-2" />
                                    <p className="text-xs text-white/30">Sin notificaciones</p>
                                </div>
                            ) : (
                                notifications.map(n => {
                                    const Icon = TYPE_ICONS[n.type] || Info;
                                    const colorClass = TYPE_COLORS[n.type] || 'text-white/50 bg-white/5';
                                    const content = (
                                        <div
                                            key={n.id}
                                            onClick={() => handleClick(n)}
                                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${n.read ? 'hover:bg-white/[0.03]' : 'bg-accent-500/[0.03] hover:bg-accent-500/[0.06]'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[12px] leading-snug ${n.read ? 'text-white/50' : 'text-white/80'}`}>
                                                    {n.actorName && <span className="font-semibold">{n.actorName} </span>}
                                                    {n.body}
                                                </p>
                                                <p className="text-[10px] text-white/25 mt-0.5">{timeAgo(n.createdAt)}</p>
                                            </div>
                                            {!n.read && <div className="w-2 h-2 rounded-full bg-accent-500 mt-1.5 flex-shrink-0" />}
                                        </div>
                                    );
                                    return n.link ? <Link key={n.id} href={n.link}>{content}</Link> : <div key={n.id}>{content}</div>;
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
