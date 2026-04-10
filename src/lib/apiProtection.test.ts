import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from './apiProtection';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    // Create a new rate limiter for each test
    // 1 second window, 3 requests max
    rateLimiter = new RateLimiter(1000, 3);
  });

  it('should allow requests within limit', () => {
    const result1 = rateLimiter.check('test-ip');
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = rateLimiter.check('test-ip');
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = rateLimiter.check('test-ip');
    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it('should block requests exceeding limit', () => {
    // Use up the limit
    rateLimiter.check('test-ip');
    rateLimiter.check('test-ip');
    rateLimiter.check('test-ip');

    // This should be blocked
    const result = rateLimiter.check('test-ip');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should track different identifiers separately', () => {
    const result1 = rateLimiter.check('ip-1');
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = rateLimiter.check('ip-2');
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(2);

    // Both should have independent limits
    rateLimiter.check('ip-1');
    rateLimiter.check('ip-1');
    
    const result3 = rateLimiter.check('ip-1');
    expect(result3.allowed).toBe(false);

    const result4 = rateLimiter.check('ip-2');
    expect(result4.allowed).toBe(true);
  });

  it('should reset after time window expires', async () => {
    // Use up the limit
    rateLimiter.check('test-ip');
    rateLimiter.check('test-ip');
    rateLimiter.check('test-ip');

    // Should be blocked
    const blocked = rateLimiter.check('test-ip');
    expect(blocked.allowed).toBe(false);

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Should be allowed again
    const allowed = rateLimiter.check('test-ip');
    expect(allowed.allowed).toBe(true);
    expect(allowed.remaining).toBe(2);
  });

  it('should return correct resetAt timestamp', () => {
    const before = Date.now();
    const result = rateLimiter.check('test-ip');
    const after = Date.now();

    expect(result.resetAt).toBeGreaterThanOrEqual(before + 1000);
    expect(result.resetAt).toBeLessThanOrEqual(after + 1000);
  });

  it('should extract IP from x-forwarded-for header', () => {
    const request = new Request('http://example.com', {
      headers: {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      },
    });

    const identifier = rateLimiter.getIdentifier(request);
    expect(identifier).toBe('192.168.1.1');
  });

  it('should extract IP from x-real-ip header', () => {
    const request = new Request('http://example.com', {
      headers: {
        'x-real-ip': '192.168.1.1',
      },
    });

    const identifier = rateLimiter.getIdentifier(request);
    expect(identifier).toBe('192.168.1.1');
  });

  it('should prefer x-forwarded-for over x-real-ip', () => {
    const request = new Request('http://example.com', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '10.0.0.1',
      },
    });

    const identifier = rateLimiter.getIdentifier(request);
    expect(identifier).toBe('192.168.1.1');
  });

  it('should return unknown when no IP headers present', () => {
    const request = new Request('http://example.com');
    const identifier = rateLimiter.getIdentifier(request);
    expect(identifier).toBe('unknown');
  });

  it('should handle custom window and max requests', () => {
    const customLimiter = new RateLimiter(2000, 5);

    // Should allow 5 requests
    for (let i = 0; i < 5; i++) {
      const result = customLimiter.check('test-ip');
      expect(result.allowed).toBe(true);
    }

    // 6th should be blocked
    const result = customLimiter.check('test-ip');
    expect(result.allowed).toBe(false);
  });

  it('should use default values when not specified', () => {
    const defaultLimiter = new RateLimiter();

    // Default is 15 minutes (900000ms) and 5 requests
    for (let i = 0; i < 5; i++) {
      const result = defaultLimiter.check('test-ip');
      expect(result.allowed).toBe(true);
    }

    const result = defaultLimiter.check('test-ip');
    expect(result.allowed).toBe(false);
  });
});
