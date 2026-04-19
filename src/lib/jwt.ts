import { SignJWT, jwtVerify } from "jose";
import { JWT_EXPIRY } from "@/lib/constants";

export interface SessionPayload {
  sub: string;
  role: "student" | "company" | "admin";
  status: string;
  isApproved: boolean;
  email: string;
  name: string;
}

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET must be set (min 16 chars)");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT({
    role: payload.role,
    status: payload.status,
    isApproved: payload.isApproved,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    const sub = payload.sub;
    if (!sub || typeof sub !== "string") return null;
    const role = payload.role as SessionPayload["role"];
    const status = payload.status as string;
    const isApproved = Boolean(payload.isApproved);
    const email = String(payload.email ?? "");
    const name = String(payload.name ?? "");
    if (!["student", "company", "admin"].includes(role)) return null;
    return { sub, role, status, isApproved, email, name };
  } catch {
    return null;
  }
}
