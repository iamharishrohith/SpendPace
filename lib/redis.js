import { Redis } from "@upstash/redis";

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || "";
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || "";

let redisClient = null;

try {
  redisClient = new Redis({
    url: upstashUrl,
    token: upstashToken,
  });
} catch (err) {
  console.warn("Upstash Redis initialization warning:", err.message);
}

export const redis = redisClient;

/**
 * High-performance Cache Getter with Fallback to Database Query.
 * Automatically wraps DB call, stores in Upstash Redis, and handles failure gracefully.
 */
export async function getOrSetCache(key, fetcher, ttlSeconds = 60) {
  if (!redis) {
    return await fetcher();
  }

  try {
    const cached = await redis.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (err) {
    console.warn(`[Redis Cache Miss/Error] Key: ${key}:`, err.message);
  }

  const fresh = await fetcher();

  if (fresh !== undefined && fresh !== null) {
    try {
      await redis.set(key, fresh, { ex: ttlSeconds });
    } catch (err) {
      console.warn(`[Redis Cache Write Error] Key: ${key}:`, err.message);
    }
  }

  return fresh;
}

/**
 * Invalidate cache key or pattern
 */
export async function invalidateCache(...keys) {
  if (!redis || keys.length === 0) return;
  try {
    for (const k of keys) {
      if (k) await redis.del(k);
    }
  } catch (err) {
    console.warn("[Redis Invalidate Error]:", err.message);
  }
}
