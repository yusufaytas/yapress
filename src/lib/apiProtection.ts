/**
 * API protection utilities
 * Provides rate limiting for API endpoints
 */

/**
 * Rate limiter entry
 */
type RateLimitEntry = {
  count: number;
  resetAt: number;
};

/**
 * Rate limiter for API endpoints
 * Prevents abuse by limiting requests per IP address
 */
export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private maxRequests: number;
  
  constructor(windowMs = 15 * 60 * 1000, maxRequests = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }
  
  /**
   * Check if request is allowed
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);
    
    // Clean up expired entries
    if (entry && now > entry.resetAt) {
      this.store.delete(identifier);
    }
    
    const current = this.store.get(identifier);
    
    if (!current) {
      // First request
      this.store.set(identifier, { count: 1, resetAt: now + this.windowMs });
      return { 
        allowed: true, 
        remaining: this.maxRequests - 1, 
        resetAt: now + this.windowMs 
      };
    }
    
    if (current.count >= this.maxRequests) {
      // Rate limit exceeded
      return { 
        allowed: false, 
        remaining: 0, 
        resetAt: current.resetAt 
      };
    }
    
    // Increment count
    current.count++;
    return { 
      allowed: true, 
      remaining: this.maxRequests - current.count, 
      resetAt: current.resetAt 
    };
  }
  
  /**
   * Get identifier from request (IP address)
   */
  getIdentifier(request: Request): string {
    // Try to get real IP (behind proxy)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               'unknown';
    return ip;
  }
}
