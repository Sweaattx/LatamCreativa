/**
 * Database Utilities Tests
 */
import { describe, it, expect } from 'vitest';
import {
    sanitizeData,
    toSnakeCase,
    toCamelCase,
    snakeToCamelObject,
    camelToSnakeObject,
    generateId,
    mapDbUserToUser,
    mapDbProjectToProject,
    mapDbArticleToArticle,
} from './utils';

describe('sanitizeData', () => {
    it('should remove undefined values', () => {
        const input = {
            name: 'John',
            age: undefined,
            email: 'john@example.com',
        };

        const result = sanitizeData(input);

        expect(result).toEqual({
            name: 'John',
            email: 'john@example.com',
        });
    });

    it('should keep null values', () => {
        const input = {
            name: 'John',
            bio: null,
        };

        const result = sanitizeData(input);

        expect(result).toEqual({
            name: 'John',
            bio: null,
        });
    });

    it('should return empty object for all undefined values', () => {
        const input = {
            a: undefined,
            b: undefined,
        };

        const result = sanitizeData(input);

        expect(result).toEqual({});
    });
});

describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
        expect(toSnakeCase('firstName')).toBe('first_name');
        expect(toSnakeCase('lastName')).toBe('last_name');
        expect(toSnakeCase('isProfileComplete')).toBe('is_profile_complete');
    });

    it('should handle single word', () => {
        expect(toSnakeCase('name')).toBe('name');
    });

    it('should handle empty string', () => {
        expect(toSnakeCase('')).toBe('');
    });
});

describe('toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
        expect(toCamelCase('first_name')).toBe('firstName');
        expect(toCamelCase('last_name')).toBe('lastName');
        expect(toCamelCase('is_profile_complete')).toBe('isProfileComplete');
    });

    it('should handle single word', () => {
        expect(toCamelCase('name')).toBe('name');
    });

    it('should handle empty string', () => {
        expect(toCamelCase('')).toBe('');
    });
});

describe('snakeToCamelObject', () => {
    it('should convert object keys from snake_case to camelCase', () => {
        const input = {
            first_name: 'John',
            last_name: 'Doe',
            is_admin: true,
        };

        const result = snakeToCamelObject(input);

        expect(result).toEqual({
            firstName: 'John',
            lastName: 'Doe',
            isAdmin: true,
        });
    });

    it('should handle nested objects', () => {
        const input = {
            user_data: {
                first_name: 'John',
            },
        };

        const result = snakeToCamelObject(input);

        expect(result).toEqual({
            userData: {
                firstName: 'John',
            },
        });
    });
});

describe('camelToSnakeObject', () => {
    it('should convert object keys from camelCase to snake_case', () => {
        const input = {
            firstName: 'John',
            lastName: 'Doe',
            isAdmin: true,
        };

        const result = camelToSnakeObject(input);

        expect(result).toEqual({
            first_name: 'John',
            last_name: 'Doe',
            is_admin: true,
        });
    });
});

describe('generateId', () => {
    it('should generate a unique ID string', () => {
        const id1 = generateId();
        const id2 = generateId();

        expect(typeof id1).toBe('string');
        expect(id1.length).toBeGreaterThan(0);
        expect(id1).not.toBe(id2);
    });

    it('should generate IDs with expected length', () => {
        const id = generateId();
        // timestamp in base36 (about 8 chars) + 12 random chars
        expect(id.length).toBeGreaterThanOrEqual(15);
    });
});

describe('mapDbUserToUser', () => {
    it('should map database user fields to app user fields', () => {
        const dbUser = {
            id: '123',
            email: 'test@example.com',
            name: 'Test User',
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            avatar: 'https://example.com/avatar.jpg',
            is_admin: false,
            is_profile_complete: true,
            created_at: '2024-01-01T00:00:00Z',
        };

        const result = mapDbUserToUser(dbUser);

        expect(result.id).toBe('123');
        expect(result.uid).toBe('123');
        expect(result.email).toBe('test@example.com');
        expect(result.firstName).toBe('Test');
        expect(result.lastName).toBe('User');
        expect(result.isAdmin).toBe(false);
        expect(result.isProfileComplete).toBe(true);
    });
});

describe('mapDbProjectToProject', () => {
    it('should map database project fields to app project fields', () => {
        const dbProject = {
            id: 'proj-123',
            slug: 'test-project',
            title: 'Test Project',
            description: 'A test project',
            author_id: 'user-123',
            views: 100,
            likes: 50,
            created_at: '2024-01-01T00:00:00Z',
        };

        const result = mapDbProjectToProject(dbProject);

        expect(result.id).toBe('proj-123');
        expect(result.slug).toBe('test-project');
        expect(result.title).toBe('Test Project');
        expect(result.authorId).toBe('user-123');
        expect(result.views).toBe(100);
        expect(result.likes).toBe(50);
    });
});

describe('mapDbArticleToArticle', () => {
    it('should map database article fields to app article fields', () => {
        const dbArticle = {
            id: 'art-123',
            slug: 'test-article',
            title: 'Test Article',
            content: 'Article content',
            author_id: 'user-123',
            author: 'Test Author',
            comments_count: 10,
            created_at: '2024-01-01T00:00:00Z',
        };

        const result = mapDbArticleToArticle(dbArticle);

        expect(result.id).toBe('art-123');
        expect(result.slug).toBe('test-article');
        expect(result.title).toBe('Test Article');
        expect(result.authorId).toBe('user-123');
        expect(result.comments).toBe(10);
    });
});
