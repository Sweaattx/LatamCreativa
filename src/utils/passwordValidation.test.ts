/**
 * Password Validation Tests
 * 
 * Tests for password validation logic used in registration and password change.
 */
import { describe, it, expect } from 'vitest';

// Password validation helper (extracted from auth logic)
const isPasswordValid = (password: string): boolean => {
    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );
};

// Individual validation checks
const passwordChecks = {
    hasMinLength: (password: string) => password.length >= 8,
    hasUppercase: (password: string) => /[A-Z]/.test(password),
    hasNumber: (password: string) => /[0-9]/.test(password),
    hasSymbol: (password: string) => /[^A-Za-z0-9]/.test(password),
};

describe('Password Validation', () => {
    describe('isPasswordValid', () => {
        it('should accept a valid password with all requirements', () => {
            expect(isPasswordValid('Password1!')).toBe(true);
            expect(isPasswordValid('MySecure123$')).toBe(true);
            expect(isPasswordValid('Test@123')).toBe(true);
        });

        it('should reject password shorter than 8 characters', () => {
            expect(isPasswordValid('Pass1!')).toBe(false);
            expect(isPasswordValid('Ab1!')).toBe(false);
        });

        it('should reject password without uppercase letter', () => {
            expect(isPasswordValid('password1!')).toBe(false);
            expect(isPasswordValid('mysecure123$')).toBe(false);
        });

        it('should reject password without number', () => {
            expect(isPasswordValid('Password!')).toBe(false);
            expect(isPasswordValid('MySecure$$$')).toBe(false);
        });

        it('should reject password without symbol', () => {
            expect(isPasswordValid('Password123')).toBe(false);
            expect(isPasswordValid('MySecure123')).toBe(false);
        });

        it('should reject empty password', () => {
            expect(isPasswordValid('')).toBe(false);
        });
    });

    describe('Individual Password Checks', () => {
        it('hasMinLength should check for 8+ characters', () => {
            expect(passwordChecks.hasMinLength('12345678')).toBe(true);
            expect(passwordChecks.hasMinLength('1234567')).toBe(false);
        });

        it('hasUppercase should check for at least one uppercase', () => {
            expect(passwordChecks.hasUppercase('Password')).toBe(true);
            expect(passwordChecks.hasUppercase('password')).toBe(false);
        });

        it('hasNumber should check for at least one digit', () => {
            expect(passwordChecks.hasNumber('pass123')).toBe(true);
            expect(passwordChecks.hasNumber('password')).toBe(false);
        });

        it('hasSymbol should check for at least one special character', () => {
            expect(passwordChecks.hasSymbol('pass!')).toBe(true);
            expect(passwordChecks.hasSymbol('pass@')).toBe(true);
            expect(passwordChecks.hasSymbol('pass#')).toBe(true);
            expect(passwordChecks.hasSymbol('password')).toBe(false);
        });
    });
});
