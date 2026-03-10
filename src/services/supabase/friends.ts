/**
 * Friend Request Service
 *
 * Handles sending, accepting, rejecting friend requests.
 * Uses Supabase table: friend_requests.
 *
 * @module services/supabase/friends
 */

import { supabase } from '../../lib/supabase';

interface FriendRequestRow { id: string; sender_id: string; receiver_id: string; status: string; created_at: string; }
interface UserRow { id: string; name: string; username: string | null; avatar: string | null; role: string | null; }

export interface FriendRequest {
    id: string;
    senderId: string;
    receiverId: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    sender?: UserRow;
    receiver?: UserRow;
}

export const friendsService = {
    /**
     * Send a friend request.
     */
    async sendRequest(senderId: string, receiverId: string): Promise<boolean> {
        // Check if request already exists
        const { data: existing } = await supabase
            .from('friend_requests')
            .select('id, status')
            .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
            .limit(1);

        const rows = (existing as unknown as FriendRequestRow[]) || [];
        if (rows.length > 0) return false; // Already exists

        const { error } = await supabase
            .from('friend_requests')
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } as never);

        return !error;
    },

    /**
     * Accept a friend request.
     */
    async acceptRequest(requestId: string): Promise<boolean> {
        const { error } = await supabase
            .from('friend_requests')
            .update({
                status: 'accepted',
                updated_at: new Date().toISOString(),
            } as never)
            .eq('id', requestId);

        return !error;
    },

    /**
     * Reject a friend request.
     */
    async rejectRequest(requestId: string): Promise<boolean> {
        const { error } = await supabase
            .from('friend_requests')
            .update({
                status: 'rejected',
                updated_at: new Date().toISOString(),
            } as never)
            .eq('id', requestId);

        return !error;
    },

    /**
     * Get pending friend requests received by a user.
     */
    async getPendingRequests(userId: string): Promise<FriendRequest[]> {
        const { data, error } = await supabase
            .from('friend_requests')
            .select('id, sender_id, receiver_id, status, created_at')
            .eq('receiver_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) return [];
        const rows = (data as unknown as FriendRequestRow[]) || [];

        // Fetch sender profiles
        const senderIds = rows.map(r => r.sender_id);
        const senders = await fetchUsers(senderIds);

        return rows.map(r => ({
            id: r.id,
            senderId: r.sender_id,
            receiverId: r.receiver_id,
            status: r.status as 'pending',
            createdAt: r.created_at,
            sender: senders[r.sender_id],
        }));
    },

    /**
     * Get all accepted friends for a user.
     */
    async getFriends(userId: string): Promise<UserRow[]> {
        const { data, error } = await supabase
            .from('friend_requests')
            .select('sender_id, receiver_id')
            .eq('status', 'accepted')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

        if (error) return [];
        const rows = (data as unknown as { sender_id: string; receiver_id: string }[]) || [];

        const friendIds = rows.map(r => r.sender_id === userId ? r.receiver_id : r.sender_id);
        if (friendIds.length === 0) return [];

        const friends = await fetchUsers(friendIds);
        return Object.values(friends);
    },

    /**
     * Get friendship status between two users.
     */
    async getFriendshipStatus(userId: string, otherUserId: string): Promise<'none' | 'pending-sent' | 'pending-received' | 'friends'> {
        const { data } = await supabase
            .from('friend_requests')
            .select('id, sender_id, receiver_id, status')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
            .limit(1);

        const rows = (data as unknown as FriendRequestRow[]) || [];
        if (rows.length === 0) return 'none';

        const req = rows[0];
        if (req.status === 'accepted') return 'friends';
        if (req.status === 'pending' && req.sender_id === userId) return 'pending-sent';
        if (req.status === 'pending' && req.receiver_id === userId) return 'pending-received';
        return 'none';
    },

    /**
     * Remove a friend (delete the accepted request).
     */
    async removeFriend(userId: string, friendId: string): Promise<boolean> {
        const { error } = await supabase
            .from('friend_requests')
            .delete()
            .eq('status', 'accepted')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`);

        return !error;
    },
};

async function fetchUsers(ids: string[]): Promise<Record<string, UserRow>> {
    if (ids.length === 0) return {};
    const { data } = await supabase.from('users').select('id, name, username, avatar, role').in('id', ids);
    const map: Record<string, UserRow> = {};
    for (const u of ((data as unknown as UserRow[]) || [])) {
        map[u.id] = u;
    }
    return map;
}
