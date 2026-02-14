/**
 * Slug Utils Tests
 * Tests for URL-friendly slug generation functions
 */
import { describe, it, expect } from 'vitest';
import { generateSlug, generateUniqueSlug, isValidSlug } from './slugUtils';

describe('generateSlug', () => {
    it('converts simple text to lowercase slug', () => {
        expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('handles accented characters', () => {
        expect(generateSlug('Mi Artículo Genial')).toBe('mi-articulo-genial');
        expect(generateSlug('Diseño Gráfico')).toBe('diseno-grafico');
        expect(generateSlug('Português do Brasil')).toBe('portugues-do-brasil');
    });

    it('removes special characters', () => {
        expect(generateSlug('3D Art: Diseño & Modelado')).toBe('3d-art-diseno-modelado');
        expect(generateSlug('¡Hola! ¿Cómo estás?')).toBe('hola-como-estas');
    });

    it('handles multiple spaces and hyphens', () => {
        expect(generateSlug('Hello    World')).toBe('hello-world');
        expect(generateSlug('Hello---World')).toBe('hello-world');
    });

    it('trims leading and trailing whitespace', () => {
        expect(generateSlug('  Hello World  ')).toBe('hello-world');
    });

    it('returns empty string for empty input', () => {
        expect(generateSlug('')).toBe('');
    });

    it('handles numbers correctly', () => {
        expect(generateSlug('React 19 Features')).toBe('react-19-features');
    });
});

describe('generateUniqueSlug', () => {
    it('creates slug with unique suffix', () => {
        const slug = generateUniqueSlug('Test Title');
        expect(slug).toMatch(/^test-title-[a-z0-9]{6}$/);
    });

    it('generates different slugs for same input', () => {
        const slug1 = generateUniqueSlug('Same Title');
        const slug2 = generateUniqueSlug('Same Title');
        expect(slug1).not.toBe(slug2);
    });
});

describe('isValidSlug', () => {
    it('returns true for valid slugs', () => {
        expect(isValidSlug('hello-world')).toBe(true);
        expect(isValidSlug('my-awesome-post-123')).toBe(true);
        expect(isValidSlug('single')).toBe(true);
    });

    it('returns false for invalid slugs', () => {
        expect(isValidSlug('Hello World')).toBe(false);
        expect(isValidSlug('hello_world')).toBe(false);
        expect(isValidSlug('-hello-world')).toBe(false);
        expect(isValidSlug('hello-world-')).toBe(false);
        expect(isValidSlug('')).toBe(false);
    });
});
