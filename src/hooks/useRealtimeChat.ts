import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { type Message } from '@/services/supabase/chat';

interface RealtimePayload {
    new: Record<string, unknown>;
}

export function useRealtimeChat(
    conversationId: string | null,
    onNewMessage: (msg: Message) => void,
    onTyping?: (userId: string) => void,
) {
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    useEffect(() => {
        if (!conversationId) return;

        const channel = (supabase as any)
            .channel(`chat:${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`,
            }, (payload: RealtimePayload) => {
                const m = payload.new;
                onNewMessage({
                    id: m.id as string,
                    conversationId: m.conversation_id as string,
                    senderId: m.sender_id as string,
                    content: m.content as string,
                    type: (m.type as 'text' | 'image' | 'link') || 'text',
                    createdAt: m.created_at as string,
                });
            })
            .on('broadcast', { event: 'typing' }, (payload: { payload: { userId: string } }) => {
                if (onTyping) onTyping(payload.payload.userId);
            })
            .subscribe();

        channelRef.current = channel;

        return () => {
            (supabase as any).removeChannel(channel);
            channelRef.current = null;
        };
    }, [conversationId, onNewMessage, onTyping]);

    const sendTyping = useCallback((userId: string) => {
        if (!channelRef.current) return;
        (channelRef.current as any).send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId },
        });
    }, []);

    return { sendTyping };
}
