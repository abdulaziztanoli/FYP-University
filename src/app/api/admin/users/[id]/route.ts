import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { adminUserUpdateSchema } from "@/lib/validators";
import { forbidden, badRequest, notFound } from "@/lib/http";
import { serializeUser } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  await connectDB();
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return forbidden();

  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid user id");

  const body = await request.json();
  const parsed = adminUserUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const target = await User.findById(id);
  if (!target) return notFound("User not found");

  switch (parsed.data.action) {
    case "block":
      target.status = "blocked";
      break;
    case "unblock":
      target.status = "active";
      break;
    default:
      break;
  }

  await target.save();

  return NextResponse.json({ user: serializeUser(target.toObject()) });
}

export async function GET(_request: Request, ctx: Ctx) {
  await connectDB();
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return forbidden();

  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid user id");

  const user = await User.findById(id).select("-password").lean();
  if (!user) return notFound();

  return NextResponse.json({ user });
}
