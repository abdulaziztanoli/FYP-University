import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { forgotPasswordSchema } from "@/lib/validators";
import { getAppUrl, sendPasswordResetEmail } from "@/lib/mailer";
import { createResetToken, RESET_TOKEN_TTL_MINUTES } from "@/lib/reset-token";

/** Same body whether or not the address exists — never confirm who has an account. */
const GENERIC = {
  message: "If that email is registered, a reset link is on its way.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid email address" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    await connectDB();

    const user = await User.findOne({ email });

    // Blocked accounts must not be able to reset their way back in.
    if (!user || user.status === "blocked") {
      return NextResponse.json(GENERIC);
    }

    // Issuing a new token invalidates any previous one for this account.
    const { token, tokenHash, expiresAt } = createResetToken();
    await User.updateOne(
      { _id: user._id },
      { $set: { resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt } }
    );

    const resetUrl = `${getAppUrl(request)}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
        expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
      });
    } catch (mailError) {
      // Don't leave a live token behind if the mail never went out.
      await User.updateOne(
        { _id: user._id },
        { $unset: { resetTokenHash: "", resetTokenExpiresAt: "" } }
      );
      console.error("Password reset email failed:", mailError);
      return NextResponse.json(
        { error: "Could not send the reset email. Try again shortly." },
        { status: 502 }
      );
    }

    return NextResponse.json(GENERIC);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not process the request" },
      { status: 500 }
    );
  }
}
