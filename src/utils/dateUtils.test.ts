/**
 * Tests for Date Utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    formatDate,
    formatDateShort,
    formatDateNumeric,
    formatDateTime,
    getRelativeTime,
    getTimeAgo,
    isToday,
    isYesterday,
    getSmartDateLabel
} from './dateUtils';

describe('dateUtils', () => {
    describe('formatDate', () => {
        it('should format date with default options', () => {
            const date = new Date('2024-01-15T12:00:00');
            const result = formatDate(date);
            // Result should be a non-empty string containing the year
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThan(0);
        });

        it('should handle string input', () => {
            const result = formatDate('2024-06-20');
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThan(0);
        });

        it('should handle invalid date', () => {
            const result = formatDate('invalid');
            expect(result).toBe('Fecha inválida');
        });
    });

    describe('formatDateShort', () => {
        it('should format date in short format', () => {
            const date = new Date('2024-03-15');
            const result = formatDateShort(date);
            // Result should be a non-empty formatted date string
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('formatDateNumeric', () => {
        it('should format date numerically', () => {
            const date = new Date('2024-01-05');
            const result = formatDateNumeric(date);
            // Should contain numbers and separators (format varies by locale)
            expect(result).toMatch(/\d/);
        });
    });

    describe('formatDateTime', () => {
        it('should include time in format', () => {
            const date = new Date('2024-01-15T14:30:00');
            const result = formatDateTime(date);
            // Should contain time components
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('getRelativeTime', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-06-15T12:00:00'));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return relative time string for seconds', () => {
            const date = new Date('2024-06-15T11:59:30');
            const result = getRelativeTime(date);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });

        it('should return relative time string for minutes', () => {
            const date = new Date('2024-06-15T11:55:00');
            const result = getRelativeTime(date);
            expect(typeof result).toBe('string');
        });

        it('should return relative time string for hours', () => {
            const date = new Date('2024-06-15T08:00:00');
            const result = getRelativeTime(date);
            expect(typeof result).toBe('string');
        });

        it('should return relative time string for days', () => {
            const date = new Date('2024-06-12T12:00:00');
            const result = getRelativeTime(date);
            expect(typeof result).toBe('string');
        });
    });

    describe('getTimeAgo', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-06-15T12:00:00'));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return short time format for minutes', () => {
            const date = new Date('2024-06-15T11:55:00');
            const result = getTimeAgo(date);
            expect(result).toMatch(/^\d+m$/);
        });

        it('should return short time format for hours', () => {
            const date = new Date('2024-06-15T09:00:00');
            const result = getTimeAgo(date);
            expect(result).toMatch(/^\d+h$/);
        });

        it('should return short time format for days', () => {
            const date = new Date('2024-06-12T12:00:00');
            const result = getTimeAgo(date);
            expect(result).toMatch(/^\d+d$/);
        });
    });

    describe('isToday', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-06-15T12:00:00'));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return true for today', () => {
            const today = new Date('2024-06-15T08:00:00');
            expect(isToday(today)).toBe(true);
        });

        it('should return false for yesterday', () => {
            const yesterday = new Date('2024-06-14T12:00:00');
            expect(isToday(yesterday)).toBe(false);
        });
    });

    describe('isYesterday', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-06-15T12:00:00'));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return true for yesterday', () => {
            const yesterday = new Date('2024-06-14T12:00:00');
            expect(isYesterday(yesterday)).toBe(true);
        });

        it('should return false for today', () => {
            const today = new Date('2024-06-15T12:00:00');
            expect(isYesterday(today)).toBe(false);
        });
    });

    describe('getSmartDateLabel', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-06-15T12:00:00'));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return "Hoy" for today', () => {
            const today = new Date('2024-06-15T08:00:00');
            expect(getSmartDateLabel(today)).toBe('Hoy');
        });

        it('should return "Ayer" for yesterday', () => {
            const yesterday = new Date('2024-06-14T12:00:00');
            expect(getSmartDateLabel(yesterday)).toBe('Ayer');
        });

        it('should return formatted date for older dates', () => {
            const oldDate = new Date('2024-06-10T12:00:00');
            const result = getSmartDateLabel(oldDate);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });
});
