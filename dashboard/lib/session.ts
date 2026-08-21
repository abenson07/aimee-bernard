import "server-only";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "dashboard_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken() {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    return payload.authenticated === true;
  } catch {
    return false;
  }
}

export { SESSION_COOKIE, SESSION_DURATION_MS };
