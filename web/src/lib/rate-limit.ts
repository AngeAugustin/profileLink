/**
 * Simple in-memory sliding-window rate limiter.
 * Fine for a single Node process; use Redis in multi-instance prod later.
 */

export { clientIp } from "@/lib/request-meta";

type Bucket = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Bucket>();

const MAX_KEYS = 10_000;

function pruneIfNeeded() {
  if (store.size < MAX_KEYS) return;
  const now = Date.now();
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
  if (store.size >= MAX_KEYS) {
    const first = store.keys().next().value;
    if (first !== undefined) store.delete(first);
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
  pruneIfNeeded();
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true };
}
