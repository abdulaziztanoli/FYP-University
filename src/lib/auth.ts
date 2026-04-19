import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { SESSION_COOKIE } from "@/lib/constants";
import { verifySessionToken, type SessionPayload } from "@/lib/jwt";

export type { SessionPayload };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const v = await verifySessionToken(token);
  if (!v) return null;
  return {
    sub: v.sub,
    role: v.role,
    status: v.status,
    isApproved: v.isApproved,
    email: v.email,
    name: v.name,
  };
}

export async function getCurrentUser() {
  const session = await getSessionFromCookies();
  if (!session) return null;
  await connectDB();
  const user = await User.findById(session.sub).select("-password").lean();
  if (!user) return null;
  return {
    ...user,
    _id: user._id.toString(),
  };
}

export function sessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
