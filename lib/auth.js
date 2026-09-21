import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "ng_admin_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 horas

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const RATE_LIMIT_MAX_ATTEMPTS = 5;

// En memoria: se reinicia en cada cold start de la función serverless.
// Es una mitigación de mejor esfuerzo, no un límite persistente.
const attempts = new Map();

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET no está definido o es demasiado corto (mínimo 32 caracteres).");
  }
  return secret;
}

function hmac(context, value) {
  return crypto.createHmac("sha256", getSecret()).update(`${context}:${value}`).digest("hex");
}

export function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.includes(":")) return false;
  const [salt, hashHex] = storedHash.split(":");
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  let actual;
  try {
    actual = crypto.scryptSync(password, salt, expected.length);
  } catch {
    return false;
  }
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function createSessionCookieValue() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 })
  ).toString("base64url");
  return `${payload}.${hmac("session", payload)}`;
}

export function isValidSessionCookie(value) {
  if (!value || !value.includes(".")) return false;
  const [payload, signature] = value.split(".");
  const expected = hmac("session", payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export function getClientIpKey(request) {
  const ip =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local";
  return hmac("ratelimit", ip);
}

export function isRateLimited(key) {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.windowStart > RATE_LIMIT_WINDOW_MS) return false;
  return entry.count >= RATE_LIMIT_MAX_ATTEMPTS;
}

export function recordFailedAttempt(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
}

export function clearAttempts(key) {
  attempts.delete(key);
}

export function isTrustedOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
