// Simple in-memory rate limiter for Next.js API routes
// In production, consider using Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  checkLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false; // Rate limit exceeded
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(identifier: string, maxRequests: number): number {
    const entry = this.requests.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - entry.count);
  }

  getResetTime(identifier: string): number | null {
    const entry = this.requests.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return null;
    }
    return entry.resetTime;
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.requests.clear();
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// Rate limiting configurations
export const RATE_LIMITS = {
  // General API requests
  GENERAL: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Authentication requests
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Booking requests
  BOOKING: {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Admin requests
  ADMIN: {
    maxRequests: 200,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
} as const;

// Rate limiting middleware
export function createRateLimit(limitType: keyof typeof RATE_LIMITS) {
  return (req: any, res: any, next: any) => {
    const identifier = req.headers['x-forwarded-for'] || 
                     req.connection?.remoteAddress || 
                     req.socket?.remoteAddress || 
                     'unknown';
    
    const limit = RATE_LIMITS[limitType];
    const isAllowed = rateLimiter.checkLimit(identifier, limit.maxRequests, limit.windowMs);

    if (!isAllowed) {
      const remaining = rateLimiter.getRemainingRequests(identifier, limit.maxRequests);
      const resetTime = rateLimiter.getResetTime(identifier);
      
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 900,
        remaining,
        limit: limit.maxRequests
      });
      return;
    }

    // Add rate limit headers
    const remaining = rateLimiter.getRemainingRequests(identifier, limit.maxRequests);
    res.setHeader('X-RateLimit-Limit', limit.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    
    next();
  };
}

// Cleanup on process exit
process.on('SIGINT', () => {
  rateLimiter.destroy();
});

process.on('SIGTERM', () => {
  rateLimiter.destroy();
});
