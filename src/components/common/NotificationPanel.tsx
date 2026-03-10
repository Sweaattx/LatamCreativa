'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Bell, Check, CheckCheck, Trash2, X, Heart, MessageCircle, UserPlus, ShoppingBag, Info } from 'lucide-react';
import { notificationsService, type Notification as ServiceNotification } from '@/services/supabase/notifications';
import { useAppStore } from '@/hooks/useAppStore';

const NOTIF_ICON: Record<string, React.ElementType> = {
    like: Heart,
    comment: MessageCircle,
    follow: UserPlus,
    purchase: ShoppingBag,
    system: Info,
};

const NOTIF_ICON_COLOR: Record<string, string> = {
    like: 'text-red-400 bg-red-400/10',
    comment: 'text-blue-400 bg-blue-400/10',
    follow: 'text-emerald-400 bg-emerald-400/10',
    purchase: 'text-amber-400 bg-amber-400/10',
    system: 'text-content-3 bg-dark-3',
};

function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'ahora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}sem`;
}

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef?: React.RefObject<HTMLElement | null>;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
    const router = useRouter();
    const { state } = useAppStore();
    const userId = state.user?.id;
    const panelRef = useRef<HTMLDivElement>(null);

    const [notifications, setNotifications] = useState<ServiceNotification[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch on open
    useEffect(() => {
        if (!isOpen || !userId) return;
        setLoading(true);
        notificationsService.getAll(userId, 20).then((data: ServiceNotification[]) => {
            setNotifications(data);
            setLoading(false);
        });
    }, [isOpen, userId]);

    // Click outside
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        // Delay to avoid closing on the same click that opens
        setTimeout(() => document.addEventListener('mousedown', handler), 0);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, onClose]);

    const markRead = useCallback(async (id: string | number) => {
        if (!userId) return;
        await notificationsService.markAsRead(String(id));
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, [userId]);

    const markAllRead = useCallback(async () => {
        if (!userId) return;
        await notificationsService.markAllAsRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, [userId]);

    const deleteNotif = useCallback(async (id: string | number) => {
        if (!userId) return;
        await notificationsService.markAsRead(String(id));
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, [userId]);

    const handleClick = (notif: ServiceNotification) => {
        if (!notif.read) markRead(notif.id);
        if (notif.link) {
            router.push(notif.link);
            onClose();
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
        <div
            ref={panelRef}
            className="fixed left-[4.25rem] bottom-14 w-80 max-h-[70vh] bg-dark-2 border border-dark-5 rounded-2xl shadow-modal z-[9999] flex flex-col animate-scale-in"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-5/50">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-content-1">Notificaciones</h3>
                    {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-accent-500 text-white rounded-full min-w-[18px] text-center">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="p-1.5 text-content-3 hover:text-content-1 hover:bg-dark-3/50 rounded-lg transition-colors"
                            title="Marcar todas como leídas"
                        >
                            <CheckCheck className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1.5 text-content-3 hover:text-content-1 hover:bg-dark-3/50 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading && (
                    <div className="py-8 text-center">
                        <div className="w-5 h-5 border-2 border-dark-5 border-t-accent-500 rounded-full animate-spin mx-auto" />
                    </div>
                )}

                {!loading && notifications.length === 0 && (
                    <div className="py-12 text-center">
                        <Bell className="w-8 h-8 text-content-3/30 mx-auto mb-2" />
                        <p className="text-sm text-content-3">Sin notificaciones</p>
                    </div>
                )}

                {!loading && notifications.map(notif => {
                    const Icon = NOTIF_ICON[notif.type] || Info;
                    const iconColor = NOTIF_ICON_COLOR[notif.type] || NOTIF_ICON_COLOR.system;

                    return (
                        <div
                            key={notif.id}
                            onClick={() => handleClick(notif)}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group ${notif.read ? 'hover:bg-dark-3/30' : 'bg-dark-3/20 hover:bg-dark-3/40'
                                }`}
                        >
                            {/* Avatar or icon */}
                            {notif.actorAvatar ? (
                                <Image
                                    src={notif.actorAvatar}
                                    alt=""
                                    width={32}
                                    height={32}
                                    className="rounded-full flex-shrink-0"
                                    unoptimized
                                />
                            ) : (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-snug ${notif.read ? 'text-content-2' : 'text-content-1'}`}>
                                    <span className="font-medium">{notif.actorName}</span>{' '}
                                    {notif.body}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-2xs text-content-3">{timeAgo(notif.createdAt)}</span>
                                    {!notif.read && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                                    )}
                                </div>
                            </div>

                            {/* Quick actions */}
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notif.read && (
                                    <button
                                        onClick={e => { e.stopPropagation(); markRead(notif.id); }}
                                        className="p-1 text-content-3 hover:text-content-1 rounded transition-colors"
                                        title="Marcar como leída"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button
                                    onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                                    className="p-1 text-content-3 hover:text-danger rounded transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>,
        document.body
    );
}

export function NotificationBell() {
    const { state } = useAppStore();
    const userId = state.user?.id;
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Poll unread count
    useEffect(() => {
        if (!userId) return;
        const fetch = () => notificationsService.getUnreadCount(userId).then(setUnreadCount);
        fetch();
        const interval = setInterval(fetch, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [userId]);

    // Reset count when panel opens
    useEffect(() => {
        if (isOpen && userId) {
            // Delay to allow mark-as-read to complete
            setTimeout(() => notificationsService.getUnreadCount(userId).then(setUnreadCount), 2000);
        }
    }, [isOpen, userId]);

    if (!userId) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 flex items-center justify-center rounded-lg text-content-3 hover:text-content-2 hover:bg-dark-3/50 transition-all duration-200"
                title="Notificaciones"
            >
                <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 text-[9px] font-bold bg-accent-500 text-white rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}

export default NotificationPanel;
