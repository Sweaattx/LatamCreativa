/**
 * i18n Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { t, setLocale, getLocale } from './index';

describe('i18n', () => {
    beforeEach(() => {
        // Reset to default locale
        setLocale('es');
    });

    describe('t (translation function)', () => {
        it('should return Spanish translation by default', () => {
            const result = t('common.loading');
            expect(result).toBe('Cargando...');
        });

        it('should return English translation when locale is en', () => {
            setLocale('en');
            const result = t('common.loading');
            expect(result).toBe('Loading...');
        });

        it('should return nested translations', () => {
            const result = t('nav.home');
            expect(result).toBe('Inicio');
        });

        it('should return key if translation not found', () => {
            const result = t('nonexistent.key');
            expect(result).toBe('nonexistent.key');
        });
    });

    describe('setLocale / getLocale', () => {
        it('should change locale', () => {
            setLocale('en');
            expect(getLocale()).toBe('en');
        });

        it('should persist Spanish as default', () => {
            expect(getLocale()).toBe('es');
        });
    });

    describe('translation coverage', () => {
        it('should have all common translations', () => {
            expect(t('common.error')).toBe('Ha ocurrido un error');
            expect(t('common.save')).toBe('Guardar');
            expect(t('common.cancel')).toBe('Cancelar');
        });

        it('should have all auth translations', () => {
            expect(t('auth.email')).toBe('Correo electrónico');
            expect(t('auth.password')).toBe('Contraseña');
            expect(t('auth.loginButton')).toBe('Iniciar sesión');
        });

        it('should have all nav translations', () => {
            expect(t('nav.blog')).toBe('Blog');
            expect(t('nav.portfolio')).toBe('Portafolio');
            expect(t('nav.forum')).toBe('Foro');
        });
    });
});
