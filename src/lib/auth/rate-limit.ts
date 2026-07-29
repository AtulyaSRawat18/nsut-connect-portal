import "server-only";

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitRecord>;

const globalRateLimit = globalThis as typeof globalThis & {
  __nsutRateLimitStore?: RateLimitStore;
};

const store =
  globalRateLimit.__nsutRateLimitStore ??
  (globalRateLimit.__nsutRateLimitStore = new Map());

function requestAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function checkRateLimit(
  request: Request,
  scope: string,
  options: { limit: number; windowMs: number },
) {
  const now = Date.now();
  const key = `${scope}:${requestAddress(request)}`;
  const current = store.get(key);
  const record =
    !current || current.resetAt <= now
      ? { count: 0, resetAt: now + options.windowMs }
      : current;

  record.count += 1;
  store.set(key, record);

  // Best-effort cleanup for a single-instance deployment; no Redis required.
  if (store.size > 1_000) {
    for (const [candidate, value] of store) {
      if (value.resetAt <= now) store.delete(candidate);
    }
  }

  return {
    allowed: record.count <= options.limit,
    limit: options.limit,
    remaining: Math.max(0, options.limit - record.count),
    retryAfterSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1_000)),
    resetAt: record.resetAt,
  };
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const expectedHost = forwardedHost || request.headers.get("host") || requestUrl.host;
    return originUrl.host === expectedHost;
  } catch {
    return false;
  }
}
