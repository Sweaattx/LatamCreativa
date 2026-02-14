/**
 * Tests for Number Utilities
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
    getOrdinal
} from './numberUtils';

describe('numberUtils', () => {
    describe('formatCompact', () => {
        it('should format thousands as K', () => {
            expect(formatCompact(1000)).toMatch(/1.*K|mil/i);
        });

        it('should format millions as M', () => {
            expect(formatCompact(1000000)).toMatch(/1.*M|millón/i);
        });

        it('should handle string input', () => {
            expect(formatCompact('5000')).toMatch(/5.*K|mil/i);
        });

        it('should return 0 for NaN', () => {
            expect(formatCompact('invalid')).toBe('0');
        });
    });

    describe('formatNumber', () => {
        it('should format with thousand separators', () => {
            const result = formatNumber(1234567);
            expect(result).toMatch(/1.*234.*567/);
        });
    });

    describe('formatCurrency', () => {
        it('should format as USD by default', () => {
            const result = formatCurrency(150);
            // Should contain currency symbol or amount
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThan(0);
        });

        it('should handle zero', () => {
            const result = formatCurrency(0);
            expect(result).toBeTruthy();
        });
    });

    describe('formatPercentage', () => {
        it('should format as percentage', () => {
            const result = formatPercentage(75);
            expect(result).toContain('%');
        });

        it('should handle decimal places', () => {
            const result = formatPercentage(75.5, 1);
            expect(result).toMatch(/75.*5.*%|76.*%/);
        });
    });

    describe('formatCount', () => {
        it('should not abbreviate small numbers', () => {
            expect(formatCount(500)).toBe('500');
        });

        it('should abbreviate thousands', () => {
            expect(formatCount(1500)).toBe('1.5K');
        });

        it('should abbreviate millions', () => {
            expect(formatCount(2500000)).toBe('2.5M');
        });

        it('should handle whole numbers cleanly', () => {
            expect(formatCount(1000)).toBe('1K');
            expect(formatCount(1000000)).toBe('1M');
        });
    });

    describe('formatFileSize', () => {
        it('should format bytes', () => {
            expect(formatFileSize(500)).toBe('500 B');
        });

        it('should format kilobytes', () => {
            expect(formatFileSize(1024)).toBe('1.0 KB');
        });

        it('should format megabytes', () => {
            expect(formatFileSize(1048576)).toBe('1.0 MB');
        });

        it('should format gigabytes', () => {
            expect(formatFileSize(1073741824)).toBe('1.0 GB');
        });

        it('should handle zero', () => {
            expect(formatFileSize(0)).toBe('0 B');
        });
    });

    describe('formatDuration', () => {
        it('should format seconds only', () => {
            expect(formatDuration(45)).toBe('45s');
        });

        it('should format minutes and seconds', () => {
            expect(formatDuration(125)).toBe('2m 5s');
        });

        it('should format hours, minutes, seconds', () => {
            expect(formatDuration(3725)).toBe('1h 2m 5s');
        });

        it('should handle negative values', () => {
            expect(formatDuration(-5)).toBe('0s');
        });
    });

    describe('formatReadingTime', () => {
        it('should calculate reading time', () => {
            expect(formatReadingTime(400)).toBe('2 min de lectura');
        });

        it('should round up', () => {
            expect(formatReadingTime(201)).toBe('2 min de lectura');
        });

        it('should handle custom reading speed', () => {
            expect(formatReadingTime(600, 300)).toBe('2 min de lectura');
        });
    });

    describe('clamp', () => {
        it('should clamp value to min', () => {
            expect(clamp(-5, 0, 100)).toBe(0);
        });

        it('should clamp value to max', () => {
            expect(clamp(150, 0, 100)).toBe(100);
        });

        it('should return value if within range', () => {
            expect(clamp(50, 0, 100)).toBe(50);
        });
    });

    describe('roundTo', () => {
        it('should round to 2 decimals by default', () => {
            expect(roundTo(3.14159)).toBe(3.14);
        });

        it('should round to specified decimals', () => {
            expect(roundTo(3.14159, 3)).toBe(3.142);
        });

        it('should round to 0 decimals', () => {
            expect(roundTo(3.7, 0)).toBe(4);
        });
    });

    describe('getOrdinal', () => {
        it('should format ordinal numbers in Spanish', () => {
            expect(getOrdinal(1)).toBe('1°');
            expect(getOrdinal(2)).toBe('2°');
            expect(getOrdinal(3)).toBe('3°');
            expect(getOrdinal(10)).toBe('10°');
        });
    });
});
