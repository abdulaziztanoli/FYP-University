import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { profilePutSchema } from "@/lib/validators";
import { unauthorized, badRequest } from "@/lib/http";

export async function GET() {
  await connectDB();
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return unauthorized();

  const full = await User.findById(sessionUser._id).select("-password").lean();
  return NextResponse.json({ user: full });
}

export async function PUT(request: Request) {
  await connectDB();
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return unauthorized();

  const body = await request.json();
  const parsed = profilePutSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const doc = await User.findById(sessionUser._id);
  if (!doc) return unauthorized();

  const data = parsed.data;
  if (data.name?.trim()) doc.name = data.name.trim();

  if (doc.role === "student" && data.studentProfile) {
    doc.studentProfile = doc.studentProfile ?? {};
    Object.assign(doc.studentProfile, data.studentProfile);
    doc.markModified("studentProfile");
  }

  if (doc.role === "company" && data.companyProfile) {
    doc.companyProfile = doc.companyProfile ?? {};
    Object.assign(doc.companyProfile, data.companyProfile);
    doc.markModified("companyProfile");
  }

  await doc.save();

  const lean = await User.findById(doc._id).select("-password").lean();
  return NextResponse.json({ user: lean });
}
