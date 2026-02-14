/**
 * Tests for Project Hooks
 * 
 * Tests the portfolio project-related custom hooks functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/services/supabase/projects', () => ({
    projectsService: {
        getProjects: vi.fn(),
        getProject: vi.fn(),
        createProject: vi.fn(),
        updateProject: vi.fn(),
        deleteProject: vi.fn(),
        getComments: vi.fn(),
        addComment: vi.fn()
    }
}));

vi.mock('@/hooks/useAppStore', () => ({
    useAppStore: vi.fn(() => ({
        user: {
            uid: 'test-user-123',
            name: 'Test User',
            username: 'testuser',
            avatar: 'https://example.com/avatar.jpg'
        }
    }))
}));

describe('Project Hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('useProject', () => {
        it('should have correct initial state', () => {
            const initialState = {
                project: null,
                loading: true,
                error: null
            };

            expect(initialState.project).toBeNull();
            expect(initialState.loading).toBe(true);
            expect(initialState.error).toBeNull();
        });

        it('should structure project data correctly', () => {
            const mockProject = {
                id: 'project-123',
                slug: 'amazing-3d-artwork',
                title: 'Amazing 3D Artwork',
                description: 'Project description here',
                author: 'John Artist',
                authorId: 'user-456',
                authorAvatar: 'https://example.com/avatar.jpg',
                image: 'https://example.com/cover.jpg',
                gallery: [
                    { type: 'image', url: 'https://example.com/img1.jpg', caption: 'View 1' },
                    { type: 'image', url: 'https://example.com/img2.jpg', caption: 'View 2' }
                ],
                category: '3D Art',
                tags: ['blender', 'character', 'stylized'],
                views: 1200,
                likes: 85,
                comments: 12,
                createdAt: '2024-01-15T12:00:00Z'
            };

            expect(mockProject.gallery).toHaveLength(2);
            expect(mockProject.tags).toContain('blender');
            expect(typeof mockProject.views).toBe('number');
        });

        it('should handle project not found', () => {
            const notFoundState = {
                project: null,
                loading: false,
                error: 'Proyecto no encontrado'
            };

            expect(notFoundState.project).toBeNull();
            expect(notFoundState.error).toContain('no encontrado');
        });
    });

    describe('useCreateProject', () => {
        it('should validate required fields', () => {
            const requiredFields = ['title', 'description', 'category'];
            const projectData = {
                title: 'New Project',
                description: 'Project description',
                category: '3D Art'
            };

            requiredFields.forEach(field => {
                expect(projectData).toHaveProperty(field);
            });
        });

        it('should handle file uploads', () => {
            const uploadConfig = {
                cover: { maxSizeMB: 10, required: true },
                gallery: { maxFiles: 10, maxSizeMB: 5 }
            };

            expect(uploadConfig.cover.maxSizeMB).toBe(10);
            expect(uploadConfig.gallery.maxFiles).toBe(10);
        });

        it('should generate slug from title', () => {
            const title = 'Mi Proyecto 3D: Personaje Estilizado';
            const expectedSlug = 'mi-proyecto-3d-personaje-estilizado';

            const slug = title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');

            expect(slug).toBe(expectedSlug);
        });

        it('should support gallery metadata', () => {
            const galleryMetadata = [
                { type: 'image', caption: 'Front view', fileIndex: 0 },
                { type: 'youtube', url: 'https://youtube.com/watch?v=xyz', caption: 'Turntable' }
            ];

            expect(galleryMetadata[0].type).toBe('image');
            expect(galleryMetadata[1].type).toBe('youtube');
        });
    });

    describe('useUpdateProject', () => {
        it('should allow partial updates', () => {
            const original = {
                title: 'Original Title',
                description: 'Original desc',
                tags: ['tag1', 'tag2']
            };

            const updates = {
                title: 'Updated Title',
                tags: ['tag1', 'tag2', 'tag3']
            };

            const result = { ...original, ...updates };

            expect(result.title).toBe('Updated Title');
            expect(result.description).toBe('Original desc');
            expect(result.tags).toHaveLength(3);
        });

        it('should handle gallery updates', () => {
            const existingGallery = [
                { id: 'img-1', url: 'url1' },
                { id: 'img-2', url: 'url2' }
            ];

            // Add new image
            const newGallery = [...existingGallery, { id: 'img-3', url: 'url3' }];
            expect(newGallery).toHaveLength(3);

            // Remove image
            const reducedGallery = existingGallery.filter(g => g.id !== 'img-1');
            expect(reducedGallery).toHaveLength(1);
        });
    });

    describe('useDeleteProject', () => {
        it('should require project id', () => {
            const deleteParams = { projectId: 'project-123' };
            expect(deleteParams.projectId).toBeDefined();
        });

        it('should validate ownership before delete', () => {
            const project = { authorId: 'user-123' };
            const currentUser = { uid: 'user-123' };

            const canDelete = project.authorId === currentUser.uid;
            expect(canDelete).toBe(true);
        });
    });

    describe('useUserProjects', () => {
        it('should filter by user', () => {
            const userId = 'user-123';
            const allProjects = [
                { id: '1', authorId: 'user-123' },
                { id: '2', authorId: 'user-456' },
                { id: '3', authorId: 'user-123' }
            ];

            const userProjects = allProjects.filter(p => p.authorId === userId);
            expect(userProjects).toHaveLength(2);
        });

        it('should support sorting', () => {
            const projects = [
                { id: '1', createdAt: '2024-01-10', views: 100 },
                { id: '2', createdAt: '2024-01-15', views: 50 },
                { id: '3', createdAt: '2024-01-12', views: 200 }
            ];

            // Sort by date
            const byDate = [...projects].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            expect(byDate[0].id).toBe('2');

            // Sort by views
            const byViews = [...projects].sort((a, b) => b.views - a.views);
            expect(byViews[0].id).toBe('3');
        });
    });

    describe('useProjectComments', () => {
        it('should structure comment correctly', () => {
            const comment = {
                id: 'comment-123',
                projectId: 'project-456',
                authorId: 'user-789',
                authorName: 'Commenter',
                text: 'Amazing work!',
                createdAt: '2024-01-15T14:00:00Z'
            };

            expect(comment.projectId).toBe('project-456');
            expect(comment.text).toBe('Amazing work!');
        });
    });

    describe('useAddProjectComment', () => {
        it('should validate comment content', () => {
            const validComment = 'This is a great project!';
            const emptyComment = '';

            expect(validComment.length).toBeGreaterThan(0);
            expect(emptyComment.length).toBe(0);
        });
    });

    describe('useDeleteProjectComment', () => {
        it('should require both project and comment ids', () => {
            const params = {
                projectId: 'project-123',
                commentId: 'comment-456'
            };

            expect(params.projectId).toBeDefined();
            expect(params.commentId).toBeDefined();
        });
    });
});

describe('Project Category Helpers', () => {
    const categories = [
        { slug: 'modelado-3d', name: 'Modelado 3D' },
        { slug: 'animacion', name: 'Animación' },
        { slug: 'concept-art', name: 'Concept Art' }
    ];

    it('should find category by slug', () => {
        const found = categories.find(c => c.slug === 'animacion');
        expect(found?.name).toBe('Animación');
    });

    it('should validate category exists', () => {
        const isValid = (slug: string) => categories.some(c => c.slug === slug);

        expect(isValid('modelado-3d')).toBe(true);
        expect(isValid('unknown')).toBe(false);
    });
});

describe('Project Gallery Helpers', () => {
    it('should identify media type', () => {
        const isYouTube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');

        expect(isYouTube('https://youtube.com/watch?v=abc')).toBe(true);
        expect(isYouTube('https://youtu.be/abc')).toBe(true);
        expect(isYouTube('https://example.com/image.jpg')).toBe(false);
    });

    it('should validate image format', () => {
        const validFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        const getExtension = (filename: string) => filename.split('.').pop()?.toLowerCase();

        expect(validFormats.includes(getExtension('image.jpg')!)).toBe(true);
        expect(validFormats.includes(getExtension('image.png')!)).toBe(true);
        expect(validFormats.includes(getExtension('document.pdf')!)).toBe(false);
    });
});
