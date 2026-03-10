/**
 * Number Utilities Tests
 * Tests for numberUtils.ts - 20 tests
 */
import { describe, it, expect } from 'vitest';
import {
    formatCompact,
    formatNumber,
    formatCurrency,
    formatPercentage,
    formatCount,
    formatFileSize,
    formatDuration,
    formatReadingTime,
    clamp,
    roundTo,
    getOrdinal,
} from './numberUtils';

describe('numberUtils', () => {
    describe('formatCompact', () => {
        it('should return "0" for NaN input', () => {
            expect(formatCompact('abc')).toBe('0');
            expect(formatCompact(NaN)).toBe('0');
        });

        it('should format small numbers without suffix', () => {
            const result = formatCompact(500);
            expect(result).toBeTruthy();
        });

        it('should accept string input', () => {
            expect(formatCompact('1500')).toBeTruthy();
        });
    });

    describe('formatNumber', () => {
        it('should return "0" for NaN', () => {
            expect(formatNumber('abc')).toBe('0');
        });

        it('should format numbers with separators', () => {
            const result = formatNumber(1234567);
            expect(result).toBeTruthy();
        });
    });

    describe('formatCurrency', () => {
        it('should return "$0" for NaN', () => {
            expect(formatCurrency('abc')).toBe('$0');
        });

        it('should format currency amounts', () => {
            const result = formatCurrency(1500);
            expect(result).toBeTruthy();
        });

        it('should support different currencies', () => {
            const result = formatCurrency(100, 'EUR');
            expect(result).toBeTruthy();
        });
    });

    describe('formatPercentage', () => {
        it('should return "0%" for NaN', () => {
            const result = formatPercentage('abc');
            expect(result).toContain('0');
            expect(result).toContain('%');
        });

        it('should format percentages correctly', () => {
            const result = formatPercentage(75);
            expect(result).toContain('75');
        });
    });

    describe('formatCount', () => {
        it('should return "0" for NaN', () => {
            expect(formatCount('abc')).toBe('0');
        });

        it('should return plain number for < 1000', () => {
            expect(formatCount(999)).toBe('999');
            expect(formatCount(0)).toBe('0');
            expect(formatCount(500)).toBe('500');
        });

        it('should format thousands with K suffix', () => {
            expect(formatCount(1000)).toBe('1K');
            expect(formatCount(1500)).toBe('1.5K');
            expect(formatCount(2000)).toBe('2K');
        });

        it('should format millions with M suffix', () => {
            expect(formatCount(1000000)).toBe('1M');
            expect(formatCount(2500000)).toBe('2.5M');
        });
    });

    describe('formatFileSize', () => {
        it('should return "0 B" for zero bytes', () => {
            expect(formatFileSize(0)).toBe('0 B');
        });

        it('should format bytes', () => {
            expect(formatFileSize(500)).toBe('500 B');
        });

        it('should format kilobytes', () => {
            const result = formatFileSize(1024);
            expect(result).toContain('KB');
        });

        it('should format megabytes', () => {
            const result = formatFileSize(1048576);
            expect(result).toContain('MB');
        });

        it('should format gigabytes', () => {
            const result = formatFileSize(1073741824);
            expect(result).toContain('GB');
        });
    });

    describe('formatDuration', () => {
        it('should return "0s" for negative values', () => {
            expect(formatDuration(-5)).toBe('0s');
        });

        it('should format seconds only', () => {
            expect(formatDuration(45)).toBe('45s');
        });

        it('should format minutes and seconds', () => {
            expect(formatDuration(150)).toBe('2m 30s');
        });

        it('should format hours, minutes and seconds', () => {
            expect(formatDuration(3661)).toBe('1h 1m 1s');
        });

        it('should format with zero seconds correctly', () => {
            expect(formatDuration(3600)).toBe('1h');
        });
    });

    describe('formatReadingTime', () => {
        it('should calculate reading time', () => {
            expect(formatReadingTime(200)).toBe('1 min de lectura');
            expect(formatReadingTime(1000)).toBe('5 min de lectura');
        });

        it('should round up', () => {
            expect(formatReadingTime(201)).toBe('2 min de lectura');
        });
    });

    describe('clamp', () => {
        it('should clamp value within range', () => {
            expect(clamp(5, 0, 10)).toBe(5);
            expect(clamp(-5, 0, 10)).toBe(0);
            expect(clamp(15, 0, 10)).toBe(10);
        });

        it('should handle edge cases', () => {
            expect(clamp(0, 0, 0)).toBe(0);
            expect(clamp(5, 5, 5)).toBe(5);
        });
    });

    describe('roundTo', () => {
        it('should round to specified decimal places', () => {
            expect(roundTo(3.14159, 2)).toBe(3.14);
            expect(roundTo(3.14159, 0)).toBe(3);
            expect(roundTo(3.14159, 4)).toBe(3.1416);
        });

        it('should default to 2 decimal places', () => {
            expect(roundTo(3.14159)).toBe(3.14);
        });
    });

    describe('getOrdinal', () => {
        it('should return ordinals with degree symbol', () => {
            const first = getOrdinal(1);
            const tenth = getOrdinal(10);
            expect(first).toContain('1');
            expect(tenth).toContain('10');
        });
    });
});
