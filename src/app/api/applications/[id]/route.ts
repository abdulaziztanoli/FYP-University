import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import Application from "@/models/Application";
import { getCurrentUser } from "@/lib/auth";
import { applicationUpdateSchema } from "@/lib/validators";
import { forbidden, unauthorized, badRequest, notFound } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user || user.role !== "company") return forbidden();

  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid id");

  const application = await Application.findById(id);
  if (!application) return notFound();

  if (String(application.company) !== String(user._id)) return forbidden();

  const body = await request.json();
  const parsed = applicationUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const { status, notes } = parsed.data;
  if (status !== undefined) application.status = status;
  if (notes !== undefined) application.notes = notes;
  await application.save();

  const populated = await Application.findById(application._id)
    .populate("student", "-password")
    .populate("job", "title")
    .lean();

  return NextResponse.json({ application: populated });
}

export async function GET(_request: Request, ctx: Ctx) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid id");

  const app = await Application.findById(id)
    .populate("job")
    .populate("student", "-password")
    .populate("company", "name companyProfile email")
    .lean();

  if (!app) return notFound();

  if (user.role === "student" && String(app.student) !== String(user._id)) {
    return forbidden();
  }
  if (user.role === "company" && String(app.company) !== String(user._id)) {
    return forbidden();
  }

  return NextResponse.json({ application: app });
}
