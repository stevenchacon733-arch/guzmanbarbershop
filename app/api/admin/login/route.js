import { NextResponse } from "next/server";
import {
  verifyPassword,
  createSessionCookieValue,
  getClientIpKey,
  isRateLimited,
  recordFailedAttempt,
  clearAttempts,
  isTrustedOrigin,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!passwordHash || !process.env.SESSION_SECRET) {
    return NextResponse.json(
      { error: "El panel no está configurado. Definí ADMIN_PASSWORD_HASH y SESSION_SECRET." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const password = typeof body?.password === "string" ? body.password : "";
  const ipKey = getClientIpKey(request);

  if (isRateLimited(ipKey)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá unos minutos e intentá de nuevo." },
      { status: 429 }
    );
  }

  if (!password || !verifyPassword(password, passwordHash)) {
    recordFailedAttempt(ipKey);
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  clearAttempts(ipKey);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, createSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
