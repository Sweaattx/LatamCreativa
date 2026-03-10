'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Send, Search, ArrowLeft, Circle,
    MoreVertical, Phone, Video, Smile, Paperclip,
    Users, Check, CheckCheck, Clock,
} from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { chatService, type Conversation, type Message } from '@/services/supabase/chat';

const avatarUrl = (name: string, bg = 'FF4D00') =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=128`;

const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return 'ahora';
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
};

/* ─── MOCK DATA (when DB has no conversations) ─── */
const MOCK_CONVOS: Conversation[] = [
    { id: 'mc1', type: 'direct', title: null, lastMessage: '¡Hola! ¿Viste el nuevo diseño?', lastMessageAt: new Date(Date.now() - 300000).toISOString(), unreadCount: 2, participant: { id: 'u1', name: 'María García', username: 'mariagarcia', avatar: avatarUrl('MG', 'ec4899') } },
    { id: 'mc2', type: 'direct', title: null, lastMessage: 'Quedó increíble el proyecto!', lastMessageAt: new Date(Date.now() - 3600000).toISOString(), unreadCount: 0, participant: { id: 'u2', name: 'Pedro UX', username: 'pedroux', avatar: avatarUrl('PU', '6366f1') } },
    { id: 'mc3', type: 'direct', title: null, lastMessage: '¿Cuándo hacemos la review?', lastMessageAt: new Date(Date.now() - 7200000).toISOString(), unreadCount: 1, participant: { id: 'u3', name: 'Laura 3D', username: 'laura3d', avatar: avatarUrl('L3', 'f59e0b') } },
    { id: 'mc4', type: 'direct', title: null, lastMessage: 'Te envié el archivo por Drive', lastMessageAt: new Date(Date.now() - 86400000).toISOString(), unreadCount: 0, participant: { id: 'u4', name: 'Carlos Dev', username: 'carlosdev', avatar: avatarUrl('CD', '3b82f6') } },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
    mc1: [
        { id: 'm1', conversationId: 'mc1', senderId: 'u1', content: '¡Hola! ¿Cómo vas con el proyecto?', type: 'text', createdAt: new Date(Date.now() - 600000).toISOString(), sender: { name: 'María García', avatar: avatarUrl('MG', 'ec4899') } },
        { id: 'm2', conversationId: 'mc1', senderId: 'me', content: 'Bien, terminé la primera versión. Te la muestro?', type: 'text', createdAt: new Date(Date.now() - 500000).toISOString() },
        { id: 'm3', conversationId: 'mc1', senderId: 'u1', content: '¡Sí por favor! 🙌', type: 'text', createdAt: new Date(Date.now() - 400000).toISOString(), sender: { name: 'María García', avatar: avatarUrl('MG', 'ec4899') } },
        { id: 'm4', conversationId: 'mc1', senderId: 'u1', content: '¡Hola! ¿Viste el nuevo diseño?', type: 'text', createdAt: new Date(Date.now() - 300000).toISOString(), sender: { name: 'María García', avatar: avatarUrl('MG', 'ec4899') } },
    ],
};

/* ─── Conversation List ─── */
function ConvoItem({ convo, isActive, onClick }: { convo: Conversation; isActive: boolean; onClick: () => void }) {
    const name = convo.participant?.name || convo.title || 'Chat';
    const avatar = convo.participant?.avatar || avatarUrl(name);
    return (
        <button onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left hover:bg-white/[0.04]
            ${isActive ? 'bg-accent-500/[0.08] border-r-2 border-accent-500' : ''}`}>
            <div className="relative flex-shrink-0">
                <Image src={avatar} alt="" width={44} height={44} className="rounded-full ring-2 ring-white/[0.08]" unoptimized />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f0f11]" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-white/90 truncate">{name}</span>
                    <span className="text-[10px] text-white/25 flex-shrink-0 ml-2">{convo.lastMessageAt ? timeAgo(convo.lastMessageAt) : ''}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[12px] text-white/40 truncate">{convo.lastMessage || 'Sin mensajes'}</p>
                    {convo.unreadCount > 0 && (
                        <span className="ml-2 min-w-[20px] h-5 flex items-center justify-center px-1.5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex-shrink-0">
                            {convo.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}

/* ─── Message Bubble ─── */
function MsgBubble({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
            <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed
                    ${isOwn
                        ? 'bg-gradient-to-r from-accent-500 to-orange-600 text-white rounded-br-md'
                        : 'bg-white/[0.06] text-white/80 rounded-bl-md border border-white/[0.06]'
                    }`}>
                    {msg.content}
                </div>
                <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? 'justify-end' : ''}`}>
                    <span className="text-[10px] text-white/20">{timeAgo(msg.createdAt)}</span>
                    {isOwn && <CheckCheck className="w-3 h-3 text-accent-400/50" />}
                </div>
            </div>
        </div>
    );
}

/* ─── Chat Window ─── */
function ChatWindow({ convo, userId, onBack }: { convo: Conversation; userId: string; onBack: () => void }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const endRef = useRef<HTMLDivElement>(null);
    const name = convo.participant?.name || convo.title || 'Chat';
    const avatar = convo.participant?.avatar || avatarUrl(name);

    useEffect(() => {
        setLoading(true);
        chatService.getMessages(convo.id, 50).then(msgs => {
            setMessages(msgs.length > 0 ? msgs : (MOCK_MESSAGES[convo.id] || []));
            chatService.markAsRead(convo.id, userId);
        }).catch(() => setMessages(MOCK_MESSAGES[convo.id] || []))
            .finally(() => setLoading(false));
    }, [convo.id, userId]);

    useEffect(() => {
        // Scroll only the messages container, not the parent layout
        const container = endRef.current?.parentElement;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    const send = useCallback(async () => {
        if (!input.trim()) return;
        const text = input.trim();
        setInput('');
        // Optimistic add
        const optimistic: Message = { id: `temp-${Date.now()}`, conversationId: convo.id, senderId: userId, content: text, type: 'text', createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, optimistic]);
        // Send to Supabase
        const real = await chatService.sendMessage(convo.id, userId, text);
        if (real) setMessages(prev => prev.map(m => m.id === optimistic.id ? real : m));
    }, [input, convo.id, userId]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] bg-[#0f0f11]/90 backdrop-blur-sm">
                <button onClick={onBack} className="lg:hidden p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <Image src={avatar} alt="" width={38} height={38} className="rounded-full ring-2 ring-white/[0.08]" unoptimized />
                <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-white/90 truncate">{name}</p>
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1"><Circle className="w-2 h-2 fill-current" /> En línea</p>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors"><Phone className="w-4 h-4" /></button>
                    <button className="p-2 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors"><Video className="w-4 h-4" /></button>
                    <button className="p-2 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-5 h-5 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <MessageCircle className="w-10 h-10 text-white/10 mb-3" />
                        <p className="text-[14px] text-white/40 font-medium">Envía el primer mensaje</p>
                        <p className="text-[12px] text-white/20 mt-1">Comienza una conversación con {name}</p>
                    </div>
                ) : (
                    messages.map(m => <MsgBubble key={m.id} msg={m} isOwn={m.senderId === userId || m.senderId === 'me'} />)
                )}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/[0.06] bg-[#0f0f11]/90 backdrop-blur-sm">
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-2 focus-within:border-accent-500/30 transition-colors">
                    <button className="p-1 text-white/25 hover:text-white/50 transition-colors"><Smile className="w-5 h-5" /></button>
                    <button className="p-1 text-white/25 hover:text-white/50 transition-colors"><Paperclip className="w-5 h-5" /></button>
                    <input type="text" value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                        placeholder="Escribe un mensaje..." className="flex-1 bg-transparent text-[13px] text-white/80 placeholder-white/20 outline-none" />
                    <button onClick={send} disabled={!input.trim()}
                        className={`p-2 rounded-xl transition-all ${input.trim()
                            ? 'bg-gradient-to-r from-accent-500 to-orange-600 text-white shadow-md shadow-accent-500/20 hover:shadow-accent-500/30 active:scale-95'
                            : 'text-white/15'}`}>
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── MAIN MESSAGES PAGE ─── */
export default function MessagesPage() {
    const { state } = useAppStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const userId = state.user?.id || '';
    const [convos, setConvos] = useState<Conversation[]>(MOCK_CONVOS);
    const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const contactDone = useRef(false);

    const toId = searchParams.get('to');
    const toName = searchParams.get('name');

    useEffect(() => {
        if (!userId) { setLoading(false); return; }
        chatService.getConversations(userId).then(c => {
            if (c.length > 0) setConvos(c);
        }).catch(() => { })
            .finally(() => setLoading(false));
    }, [userId]);

    useEffect(() => {
        if (!toId || !userId || contactDone.current) return;
        contactDone.current = true;
        const name = toName ? decodeURIComponent(toName) : 'Usuario';

        const existing = convos.find(c => c.participant?.id === toId);
        if (existing) {
            setActiveConvo(existing);
            window.history.replaceState({}, '', '/messages');
            return;
        }
        const newConvo: Conversation = {
            id: `new-${toId}`,
            type: 'direct',
            title: null,
            lastMessage: null,
            lastMessageAt: new Date().toISOString(),
            unreadCount: 0,
            participant: {
                id: toId,
                name: name,
                username: '',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f59e0b&color=fff&size=128`,
            },
        };
        setConvos(prev => [newConvo, ...prev]);
        setActiveConvo(newConvo);
        window.history.replaceState({}, '', '/messages');
    }, [toId, toName, userId, convos]);

    const filtered = convos.filter((c: Conversation) => {
        if (!search) return true;
        const cName = c.participant?.name || c.title || '';
        return cName.toLowerCase().includes(search.toLowerCase());
    });

    if (!state.user) {
        return (
            <div className="min-h-screen bg-dark-0 flex items-center justify-center">
                <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/50 text-lg font-medium">Inicia sesión para ver tus mensajes</p>
                    <Link href="/login" className="mt-4 inline-block px-6 py-2.5 bg-accent-500 text-white rounded-xl font-medium hover:bg-accent-600 transition-colors">
                        Iniciar sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-56px)] bg-dark-0">
            <div className="max-w-[1100px] mx-auto px-0 lg:px-5">
                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] h-[calc(100vh-56px)] border-x border-white/[0.04]">

                    {/* Conversation list */}
                    <div className={`border-r border-white/[0.06] flex flex-col bg-[#0a0a0c] ${activeConvo ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="px-5 pt-5 pb-3">
                            <h1 className="text-xl font-bold text-white/95 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-accent-400" /> Mensajes
                            </h1>
                        </div>

                        <div className="px-4 pb-3">
                            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 focus-within:border-accent-500/20 transition-colors">
                                <Search className="w-4 h-4 text-white/20" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Buscar conversación..." className="flex-1 bg-transparent text-[12px] text-white/80 placeholder-white/20 outline-none" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-5 h-5 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="px-5 py-8 text-center">
                                    <Users className="w-8 h-8 text-white/10 mx-auto mb-2" />
                                    <p className="text-[13px] text-white/30">No hay conversaciones</p>
                                    <p className="text-[11px] text-white/15 mt-1">Visita el perfil de un creador y envíale un mensaje</p>
                                </div>
                            ) : (
                                filtered.map(c => (
                                    <ConvoItem key={c.id} convo={c} isActive={activeConvo?.id === c.id} onClick={() => setActiveConvo(c)} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat window */}
                    <div className={`flex flex-col bg-[#0d0d0f] ${!activeConvo ? 'hidden lg:flex' : 'flex'}`}>
                        {activeConvo ? (
                            <ChatWindow convo={activeConvo} userId={userId} onBack={() => setActiveConvo(null)} />
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-500/10 to-orange-600/10 border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle className="w-8 h-8 text-accent-400/50" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-white/70">Tus mensajes</h2>
                                    <p className="text-[13px] text-white/30 mt-1 max-w-[250px]">Selecciona una conversación para comenzar a chatear</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
