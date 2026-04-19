import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    const { password: _, ...safe } = user as Record<string, unknown>;
    return NextResponse.json({ user: safe });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
