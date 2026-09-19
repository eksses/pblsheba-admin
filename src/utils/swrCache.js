/**
 * Ultra-fast Client-Side SWR (Stale-While-Revalidate) Cache
 * Provides 0ms instant page loads and seamless background data revalidation.
 */

const memoryCache = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes fresh window

export const swrCache = {
  get(key) {
    // 1. Check memory cache first
    const mem = memoryCache.get(key);
    if (mem) {
      return mem.data;
    }

    // 2. Check sessionStorage fallback
    try {
      const stored = sessionStorage.getItem(`swr_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        memoryCache.set(key, parsed);
        return parsed.data;
      }
    } catch (e) {}

    return null;
  },

  set(key, data, ttl = DEFAULT_TTL) {
    const entry = {
      data,
      expiresAt: Date.now() + ttl,
      updatedAt: Date.now()
    };
    memoryCache.set(key, entry);

    try {
      sessionStorage.setItem(`swr_${key}`, JSON.stringify(entry));
    } catch (e) {}
  },

  invalidate(pattern) {
    if (!pattern) {
      memoryCache.clear();
      try {
        Object.keys(sessionStorage).forEach(k => {
          if (k.startsWith('swr_')) sessionStorage.removeItem(k);
        });
      } catch (e) {}
      return;
    }

    // Invalidate matching keys
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
      }
    }

    try {
      Object.keys(sessionStorage).forEach(k => {
        if (k.startsWith('swr_') && k.includes(pattern)) {
          sessionStorage.removeItem(k);
        }
      });
    } catch (e) {}
  }
};
