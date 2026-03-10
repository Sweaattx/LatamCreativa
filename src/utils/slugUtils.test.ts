/**
 * Slug Utilities Tests
 * Tests for slugUtils.ts - 15 tests
 */
import { describe, it, expect } from 'vitest';
import { generateSlug, generateUniqueSlug, isValidSlug } from './slugUtils';

describe('slugUtils', () => {
    describe('generateSlug', () => {
        it('should return empty string for empty input', () => {
            expect(generateSlug('')).toBe('');
        });

        it('should convert to lowercase', () => {
            expect(generateSlug('Hello World')).toBe('hello-world');
        });

        it('should replace spaces with hyphens', () => {
            expect(generateSlug('my article title')).toBe('my-article-title');
        });

        it('should remove accented characters', () => {
            const result = generateSlug('Diseño Gráfico');
            expect(result).toMatch(/^disen/);
            expect(result).toMatch(/grafico$/);
        });

        it('should remove special characters', () => {
            const result = generateSlug('3D Art: Diseño & Modelado');
            expect(result).toContain('3d-art');
            expect(result).toContain('modelado');
        });

        it('should handle multiple spaces and hyphens', () => {
            expect(generateSlug('hello   world')).toBe('hello-world');
            expect(generateSlug('hello---world')).toBe('hello-world');
        });

        it('should trim leading/trailing hyphens', () => {
            expect(generateSlug(' hello world ')).toBe('hello-world');
            expect(generateSlug('---hello---')).toBe('hello');
        });

        it('should handle Spanish question marks', () => {
            const result = generateSlug('Cómo diseñar');
            expect(result).toMatch(/^como/);
        });

        it('should handle numbers', () => {
            expect(generateSlug('Tutorial 3D parte 2')).toBe('tutorial-3d-parte-2');
        });

        it('should handle all special characters', () => {
            expect(generateSlug('!@#$%^&*()')).toBe('');
        });
    });

    describe('generateUniqueSlug', () => {
        it('should generate a slug with a unique suffix', () => {
            const slug = generateUniqueSlug('My Article');
            expect(slug).toMatch(/^my-article-[a-z0-9]+$/);
        });

        it('should generate different slugs each time', () => {
            const slug1 = generateUniqueSlug('Same Title');
            const slug2 = generateUniqueSlug('Same Title');
            expect(slug1).not.toBe(slug2);
        });

        it('should have a 6-character suffix', () => {
            const slug = generateUniqueSlug('Test');
            const parts = slug.split('-');
            const suffix = parts[parts.length - 1];
            expect(suffix.length).toBe(6);
        });
    });

    describe('isValidSlug', () => {
        it('should validate correct slugs', () => {
            expect(isValidSlug('hello-world')).toBe(true);
            expect(isValidSlug('my-article-123')).toBe(true);
            expect(isValidSlug('test')).toBe(true);
        });

        it('should reject invalid slugs', () => {
            expect(isValidSlug('Hello World')).toBe(false);
            expect(isValidSlug('hello_world')).toBe(false);
            expect(isValidSlug('hello--world')).toBe(false);
            expect(isValidSlug('-hello')).toBe(false);
            expect(isValidSlug('hello-')).toBe(false);
            expect(isValidSlug('')).toBe(false);
        });
    });
});
