import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase client
const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };

vi.mock('@/lib/supabase', () => ({
    supabase: mockSupabase,
}));

vi.mock('../../lib/supabase', () => ({
    supabase: mockSupabase,
}));

describe('interactionsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('isLiked', () => {
        it('should return true when a like exists', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: { id: '1' } }),
                    }),
                }),
            });
            mockFrom.mockReturnValue({ select: mockSelect });

            const { interactionsService } = await import('@/services/supabase/interactions');
            const result = await interactionsService.isLiked('project', 'p1', 'u1');
            expect(result).toBe(true);
        });

        it('should return false when no like exists', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: null }),
                    }),
                }),
            });
            mockFrom.mockReturnValue({ select: mockSelect });

            const { interactionsService } = await import('@/services/supabase/interactions');
            const result = await interactionsService.isLiked('article', 'a1', 'u1');
            expect(result).toBe(false);
        });
    });

    describe('getComments', () => {
        it('should return mapped comments', async () => {
            const mockData = [
                { id: 'c1', text: 'Genial!', user_id: 'u1', created_at: '2024-01-01', users: { name: 'Juan', avatar: 'https://example.com/avatar.jpg' } },
            ];
            const mockLimit = vi.fn().mockResolvedValue({ data: mockData, error: null });
            const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
            const mockEq2 = vi.fn().mockReturnValue({ order: mockOrder });
            const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
            const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
            mockFrom.mockReturnValue({ select: mockSelect });

            const { interactionsService } = await import('@/services/supabase/interactions');
            const comments = await interactionsService.getComments('project', 'p1');
            expect(comments).toHaveLength(1);
            expect(comments[0].authorName).toBe('Juan');
            expect(comments[0].text).toBe('Genial!');
        });
    });
});

describe('notificationsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getUnreadCount', () => {
        it('should return count of unread notifications', async () => {
            const mockEq2 = vi.fn().mockResolvedValue({ count: 5, error: null });
            const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
            const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
            mockFrom.mockReturnValue({ select: mockSelect });

            const { notificationsService } = await import('@/services/supabase/notifications');
            const count = await notificationsService.getUnreadCount('u1');
            expect(count).toBe(5);
        });

        it('should return 0 on error', async () => {
            const mockEq2 = vi.fn().mockResolvedValue({ count: null, error: new Error('fail') });
            const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
            const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
            mockFrom.mockReturnValue({ select: mockSelect });

            const { notificationsService } = await import('@/services/supabase/notifications');
            const count = await notificationsService.getUnreadCount('u1');
            expect(count).toBe(0);
        });
    });
});
