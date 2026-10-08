import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { verifyPassword, sessionCookieOptions } from "@/lib/auth";
import { signSessionToken } from "@/lib/jwt";
import { loginSchema } from "@/lib/validators";
import { serializeUser } from "@/lib/serialize";
import { SESSION_COOKIE } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.status === "blocked") {
      return NextResponse.json(
        {
          code: "BLOCKED",
          error:
            "Your account has been blocked. Contact admin.",
        },
        { status: 403 }
      );
    }

    const token = await signSessionToken({
      sub: user._id.toString(),
      role: user.role as "student" | "company" | "admin",
      status: user.status,
      email: user.email,
      name: user.name,
    });

    const store = await cookies();
    store.set(SESSION_COOKIE, token, sessionCookieOptions());

    return NextResponse.json({
      user: serializeUser(user),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
