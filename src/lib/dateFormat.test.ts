import { describe, it, expect } from 'vitest';
import { formatDate, BUILD_YEAR } from './dateFormat';

describe('formatDate', () => {
  it('formats Date object to YYYY-MM-DD', () => {
    const date = new Date('2026-04-12T10:30:00Z');
    expect(formatDate(date)).toBe('2026-04-12');
  });

  it('formats date string to YYYY-MM-DD', () => {
    expect(formatDate('2026-04-12')).toBe('2026-04-12');
  });

  it('pads single-digit months and days with zeros', () => {
    const date = new Date('2026-01-05T00:00:00Z');
    expect(formatDate(date)).toBe('2026-01-05');
  });

  it('handles end of year dates', () => {
    const date = new Date('2025-12-31T23:59:59Z');
    expect(formatDate(date)).toBe('2025-12-31');
  });

  it('handles beginning of year dates', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    expect(formatDate(date)).toBe('2026-01-01');
  });

  it('formats consistently regardless of locale', () => {
    const date = new Date('2026-03-15T12:00:00Z');
    const result = formatDate(date);
    
    // Should always be ISO format, not locale-dependent
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe('2026-03-15');
  });
});

describe('BUILD_YEAR', () => {
  it('is a valid year number', () => {
    expect(typeof BUILD_YEAR).toBe('number');
    expect(BUILD_YEAR).toBeGreaterThan(2020);
    expect(BUILD_YEAR).toBeLessThan(2100);
  });

  it('is the current year', () => {
    const currentYear = new Date().getFullYear();
    expect(BUILD_YEAR).toBe(currentYear);
  });
});
