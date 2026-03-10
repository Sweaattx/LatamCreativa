/**
 * Chat / Messaging Service
 * 
 * Handles conversations, messages, and real-time messaging.
 * Uses Supabase tables: conversations, conversation_participants, messages.
 *
 * @module services/supabase/chat
 */

import { supabase } from '../../lib/supabase';

// ─── Types ───
interface ConversationRow { id: string; type: string; title: string | null; last_message: string | null; last_message_at: string | null; created_at: string; }
interface ParticipantRow { id: string; conversation_id: string; user_id: string; unread_count: number; }
interface MessageRow { id: string; conversation_id: string; sender_id: string; content: string; type: string; created_at: string; }
interface UserRow { id: string; name: string; username: string | null; avatar: string | null; }

export interface Conversation {
    id: string;
    type: 'direct' | 'group';
    title: string | null;
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
    participant: { id: string; name: string; username: string | null; avatar: string | null } | null;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'link';
    createdAt: string;
    sender?: { name: string; avatar: string | null };
}

export const chatService = {
    /**
     * Get or create a direct conversation between two users.
     */
    async getOrCreateDirect(userId: string, otherUserId: string): Promise<string> {
        // Check if direct conversation already exists
        const { data: myConvos } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', userId);

        const { data: theirConvos } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', otherUserId);

        const myIds = ((myConvos as unknown as ParticipantRow[]) || []).map(c => c.conversation_id);
        const theirIds = ((theirConvos as unknown as ParticipantRow[]) || []).map(c => c.conversation_id);
        const shared = myIds.filter(id => theirIds.includes(id));

        // Check if any shared conversation is direct
        for (const cId of shared) {
            const { data } = await supabase.from('conversations').select('id, type').eq('id', cId).single();
            const row = data as unknown as { id: string; type: string } | null;
            if (row?.type === 'direct') return row.id;
        }

        // Create new direct conversation
        const now = new Date().toISOString();
        const { data: conv, error: convErr } = await supabase
            .from('conversations')
            .insert({ type: 'direct', created_at: now, updated_at: now } as never)
            .select('id')
            .single();

        if (convErr || !conv) throw convErr || new Error('Failed to create conversation');
        const convId = (conv as unknown as { id: string }).id;

        // Add participants
        await supabase.from('conversation_participants').insert([
            { conversation_id: convId, user_id: userId, created_at: now } as never,
            { conversation_id: convId, user_id: otherUserId, created_at: now } as never,
        ]);

        return convId;
    },

    /**
     * Get all conversations for a user.
     */
    async getConversations(userId: string): Promise<Conversation[]> {
        const { data: parts, error } = await supabase
            .from('conversation_participants')
            .select('conversation_id, unread_count')
            .eq('user_id', userId);

        if (error || !parts) return [];
        const rows = parts as unknown as ParticipantRow[];
        if (rows.length === 0) return [];

        const convIds = rows.map(p => p.conversation_id);
        const unreadMap: Record<string, number> = {};
        for (const r of rows) unreadMap[r.conversation_id] = r.unread_count;

        // Fetch conversations
        const { data: convos } = await supabase
            .from('conversations')
            .select('id, type, title, last_message, last_message_at, created_at')
            .in('id', convIds)
            .order('last_message_at', { ascending: false, nullsFirst: false });

        const convoRows = (convos as unknown as ConversationRow[]) || [];

        // For each conversation, fetch the other participant
        const result: Conversation[] = [];
        for (const c of convoRows) {
            let participant: Conversation['participant'] = null;

            if (c.type === 'direct') {
                const { data: otherParts } = await supabase
                    .from('conversation_participants')
                    .select('user_id')
                    .eq('conversation_id', c.id)
                    .neq('user_id', userId)
                    .limit(1);

                const otherRows = (otherParts as unknown as { user_id: string }[]) || [];
                if (otherRows.length > 0) {
                    const { data: userD } = await supabase
                        .from('users')
                        .select('id, name, username, avatar')
                        .eq('id', otherRows[0].user_id)
                        .single();

                    if (userD) {
                        const u = userD as unknown as UserRow;
                        participant = { id: u.id, name: u.name, username: u.username, avatar: u.avatar };
                    }
                }
            }

            result.push({
                id: c.id,
                type: c.type as 'direct' | 'group',
                title: c.title,
                lastMessage: c.last_message,
                lastMessageAt: c.last_message_at,
                unreadCount: unreadMap[c.id] || 0,
                participant,
            });
        }

        return result;
    },

    /**
     * Get messages for a conversation.
     */
    async getMessages(conversationId: string, limit = 50): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('id, conversation_id, sender_id, content, type, created_at')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(limit);

        if (error) return [];

        const rows = (data as unknown as MessageRow[]) || [];
        const senderIds = [...new Set(rows.map(m => m.sender_id))];

        // Fetch sender profiles
        const senderMap: Record<string, { name: string; avatar: string | null }> = {};
        if (senderIds.length > 0) {
            const { data: users } = await supabase
                .from('users')
                .select('id, name, avatar')
                .in('id', senderIds);

            for (const u of ((users as unknown as { id: string; name: string; avatar: string | null }[]) || [])) {
                senderMap[u.id] = { name: u.name, avatar: u.avatar };
            }
        }

        return rows.map(m => ({
            id: m.id,
            conversationId: m.conversation_id,
            senderId: m.sender_id,
            content: m.content,
            type: m.type as 'text' | 'image' | 'link',
            createdAt: m.created_at,
            sender: senderMap[m.sender_id],
        }));
    },

    /**
     * Send a message to a conversation.
     */
    async sendMessage(conversationId: string, senderId: string, content: string, type: 'text' | 'image' | 'link' = 'text'): Promise<Message | null> {
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                content,
                type,
                created_at: now,
            } as never)
            .select('id, conversation_id, sender_id, content, type, created_at')
            .single();

        if (error || !data) return null;
        const msg = data as unknown as MessageRow;

        // Update conversation last message
        await supabase
            .from('conversations')
            .update({ last_message: content, last_message_at: now, updated_at: now } as never)
            .eq('id', conversationId);

        // Increment unread count for other participants
        const { data: parts } = await supabase
            .from('conversation_participants')
            .select('id, user_id, unread_count')
            .eq('conversation_id', conversationId)
            .neq('user_id', senderId);

        for (const p of ((parts as unknown as ParticipantRow[]) || [])) {
            await supabase
                .from('conversation_participants')
                .update({ unread_count: p.unread_count + 1 } as never)
                .eq('id', p.id);
        }

        return {
            id: msg.id,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            content: msg.content,
            type: msg.type as 'text' | 'image' | 'link',
            createdAt: msg.created_at,
        };
    },

    /**
     * Mark conversation as read for a user.
     */
    async markAsRead(conversationId: string, userId: string): Promise<void> {
        await supabase
            .from('conversation_participants')
            .update({ unread_count: 0, last_read_at: new Date().toISOString() } as never)
            .eq('conversation_id', conversationId)
            .eq('user_id', userId);
    },

    /**
     * Get total unread message count for a user.
     */
    async getUnreadCount(userId: string): Promise<number> {
        const { data } = await supabase
            .from('conversation_participants')
            .select('unread_count')
            .eq('user_id', userId);

        const rows = (data as unknown as { unread_count: number }[]) || [];
        return rows.reduce((sum, r) => sum + r.unread_count, 0);
    },
};
