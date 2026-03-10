/**
 * Date Utilities Tests
 * Tests for dateUtils.ts - 15 tests
 */
import { describe, it, expect } from 'vitest';
import {
    formatDate,
    formatDateShort,
    formatDateNumeric,
    formatDateTime,
    getRelativeTime,
    getTimeAgo,
    isToday,
    isYesterday,
    getSmartDateLabel,
} from './dateUtils';

describe('dateUtils', () => {
    const fixedDate = new Date('2026-02-22T15:30:00Z');

    describe('formatDate', () => {
        it('should format a Date object', () => {
            const result = formatDate(fixedDate);
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
        });

        it('should format a string date', () => {
            const result = formatDate('2026-02-22T15:30:00Z');
            expect(result).toBeTruthy();
        });

        it('should format a numeric timestamp', () => {
            const result = formatDate(fixedDate.getTime());
            expect(result).toBeTruthy();
        });

        it('should return invalid date string for bad input', () => {
            const result = formatDate('not-a-date');
            expect(result).toContain('inv');
        });

        it('should accept custom locale', () => {
            const result = formatDate(fixedDate, {}, 'en-US');
            expect(result).toBeTruthy();
        });
    });

    describe('formatDateShort', () => {
        it('should return a short formatted date', () => {
            const result = formatDateShort(fixedDate);
            expect(result).toBeTruthy();
            expect(result).toContain('2026');
        });
    });

    describe('formatDateNumeric', () => {
        it('should return a numeric formatted date', () => {
            const result = formatDateNumeric(fixedDate);
            expect(result).toBeTruthy();
            expect(result).toMatch(/\d/);
        });
    });

    describe('formatDateTime', () => {
        it('should include time in the formatted string', () => {
            const result = formatDateTime(fixedDate);
            expect(result).toBeTruthy();
            expect(result).toContain('2026');
        });
    });

    describe('getRelativeTime', () => {
        it('should return relative time for recent dates', () => {
            const now = new Date();
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            const result = getRelativeTime(fiveMinutesAgo);
            expect(result).toBeTruthy();
        });

        it('should handle invalid dates', () => {
            const result = getRelativeTime('invalid');
            expect(result).toContain('inv');
        });

        it('should return relative time for hours ago', () => {
            const now = new Date();
            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
            const result = getRelativeTime(twoHoursAgo);
            expect(result).toBeTruthy();
        });
    });

    describe('getTimeAgo', () => {
        it('should return "?" for invalid dates', () => {
            expect(getTimeAgo('invalid')).toBe('?');
        });

        it('should return seconds format for recent times', () => {
            const now = new Date();
            const tenSecondsAgo = new Date(now.getTime() - 10 * 1000);
            expect(getTimeAgo(tenSecondsAgo)).toBe('10s');
        });

        it('should return minutes format', () => {
            const now = new Date();
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            expect(getTimeAgo(fiveMinutesAgo)).toBe('5m');
        });

        it('should return hours format', () => {
            const now = new Date();
            const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
            expect(getTimeAgo(threeHoursAgo)).toBe('3h');
        });

        it('should return days format', () => {
            const now = new Date();
            const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
            expect(getTimeAgo(twoDaysAgo)).toBe('2d');
        });
    });

    describe('isToday', () => {
        it('should return true for today', () => {
            expect(isToday(new Date())).toBe(true);
        });

        it('should return false for yesterday', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            expect(isToday(yesterday)).toBe(false);
        });
    });

    describe('isYesterday', () => {
        it('should return true for yesterday', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            expect(isYesterday(yesterday)).toBe(true);
        });

        it('should return false for today', () => {
            expect(isYesterday(new Date())).toBe(false);
        });
    });

    describe('getSmartDateLabel', () => {
        it('should return "Hoy" for today', () => {
            expect(getSmartDateLabel(new Date())).toBe('Hoy');
        });

        it('should return "Ayer" for yesterday', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            expect(getSmartDateLabel(yesterday)).toBe('Ayer');
        });

        it('should return formatted date for older dates', () => {
            const oldDate = new Date('2024-01-15');
            const result = getSmartDateLabel(oldDate);
            expect(result).not.toBe('Hoy');
            expect(result).not.toBe('Ayer');
            expect(result).toContain('2024');
        });
    });
});
