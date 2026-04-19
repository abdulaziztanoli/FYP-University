import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import Job from "@/models/Job";
import { getCurrentUser } from "@/lib/auth";
import { jobUpdateSchema } from "@/lib/validators";
import { forbidden, unauthorized, badRequest, notFound } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

/** Job refs may be an ObjectId or a populated subdocument. */
function refId(ref: unknown): string {
  if (ref && typeof ref === "object" && "_id" in ref) {
    return String((ref as { _id: mongoose.Types.ObjectId })._id);
  }
  return String(ref);
}

type PopulatedCompany = {
  _id: mongoose.Types.ObjectId;
  role?: string;
  status?: string;
  isApproved?: boolean;
};

export async function GET(_request: NextRequest, ctx: Ctx) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid job id");

  const job = await Job.findById(id)
    .populate("company", "name email companyProfile status isApproved role")
    .lean();

  if (!job) return notFound("Job not found");

  const company = job.company as unknown as PopulatedCompany | null;

  if (user.role === "company") {
    if (refId(job.company) !== String(user._id)) return forbidden();
    return NextResponse.json({ job });
  }

  if (user.role === "admin") {
    return NextResponse.json({ job });
  }

  if (user.role === "student") {
    const ok =
      job.status === "open" &&
      company &&
      company.role === "company" &&
      company.isApproved === true &&
      company.status === "active";
    if (!ok) return forbidden();
    return NextResponse.json({ job });
  }

  return forbidden();
}

export async function PUT(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user || user.role !== "company") return forbidden();

  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid job id");

  const existing = await Job.findById(id);
  if (!existing) return notFound();
  if (String(existing.company) !== String(user._id)) return forbidden();

  const body = await request.json();
  const parsed = jobUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  Object.assign(existing, parsed.data);
  await existing.save();

  const populated = await Job.findById(existing._id)
    .populate("company", "name email companyProfile")
    .lean();

  return NextResponse.json({ job: populated });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user || user.role !== "company") return forbidden();

  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid job id");

  const existing = await Job.findById(id);
  if (!existing) return notFound();
  if (String(existing.company) !== String(user._id)) return forbidden();

  await Job.deleteOne({ _id: existing._id });
  return NextResponse.json({ ok: true });
}
