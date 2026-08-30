import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validators";
import { hashResetToken } from "@/lib/reset-token";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid request",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    await connectDB();

    // Exact match on the stored hash plus an unexpired timestamp is the check —
    // a wrong or stale token simply finds no document.
    const user = await User.findOne({
      resetTokenHash: hashResetToken(token),
      resetTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { code: "INVALID_TOKEN", error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    if (user.status === "blocked") {
      return NextResponse.json(
        { error: "Your account has been blocked. Contact admin." },
        { status: 403 }
      );
    }

    // One atomic write: set the new hash and burn the token so the same link
    // cannot be replayed. $unset is explicit — clearing a `select: false` path
    // through save() is not reliably tracked as modified.
    await User.updateOne(
      { _id: user._id },
      {
        $set: { password: await hashPassword(password) },
        $unset: { resetTokenHash: "", resetTokenExpiresAt: "" },
      }
    );

    return NextResponse.json({
      message: "Password updated. You can sign in now.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not reset the password" },
      { status: 500 }
    );
  }
}
