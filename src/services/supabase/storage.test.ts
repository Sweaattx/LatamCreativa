/**
 * Storage Service Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storageService } from './storage';

// Mock supabase
vi.mock('../../lib/supabase', () => ({
    supabase: {
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn().mockResolvedValue({
                    data: { path: 'test/path.jpg' },
                    error: null,
                }),
                remove: vi.fn().mockResolvedValue({ error: null }),
                list: vi.fn().mockResolvedValue({ data: [], error: null }),
                getPublicUrl: vi.fn().mockReturnValue({
                    data: { publicUrl: 'https://example.com/storage/test/path.jpg' },
                }),
                createSignedUrl: vi.fn().mockResolvedValue({
                    data: { signedUrl: 'https://example.com/signed-url' },
                    error: null,
                }),
            })),
        },
    },
}));

// Mock imageCompression
vi.mock('browser-image-compression', () => ({
    default: vi.fn().mockImplementation((file) => Promise.resolve(file)),
}));

// Mock import.meta.env
vi.stubGlobal('import.meta', {
    env: {
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    },
});

describe('Storage Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('deleteFromPath', () => {
        it('should return false for empty path', async () => {
            const result = await storageService.deleteFromPath('');
            expect(result).toBe(false);
        });

        it('should delete file and return true on success', async () => {
            const result = await storageService.deleteFromPath('test/path.jpg');
            expect(result).toBe(true);
        });
    });

    describe('getPublicUrl', () => {
        it('should return public URL for given path', () => {
            const url = storageService.getPublicUrl('test/path.jpg');
            expect(url).toBe('https://example.com/storage/test/path.jpg');
        });

        it('should use custom bucket when provided', () => {
            const url = storageService.getPublicUrl('test/path.jpg', 'custom-bucket');
            expect(url).toBe('https://example.com/storage/test/path.jpg');
        });
    });

    describe('uploadImage', () => {
        it('should upload image and return public URL', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

            const url = await storageService.uploadImage(mockFile, 'test/path.jpg');

            expect(url).toBe('https://example.com/storage/test/path.jpg');
        });

        it('should throw error if file exceeds max size after compression', async () => {
            // Create a file that exceeds max size
            const largeContent = new Array(15 * 1024 * 1024).fill('a').join(''); // 15MB
            const mockFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });

            await expect(
                storageService.uploadImage(mockFile, 'test/large.jpg', { maxSizeMB: 10 })
            ).rejects.toThrow('excede el límite');
        });
    });

    describe('uploadMultiple', () => {
        it('should upload multiple files and return array of URLs', async () => {
            const mockFiles = [
                new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
                new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
            ];

            const urls = await storageService.uploadMultiple(mockFiles, 'test/gallery');

            expect(urls).toHaveLength(2);
            expect(urls[0]).toBe('https://example.com/storage/test/path.jpg');
        });
    });
});
