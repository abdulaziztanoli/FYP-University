import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import Job from "@/models/Job";
import User from "@/models/User";
import Application from "@/models/Application";
import { getCurrentUser } from "@/lib/auth";
import { applicationCreateSchema } from "@/lib/validators";
import { forbidden, unauthorized, badRequest, notFound } from "@/lib/http";

export async function GET(request: NextRequest) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const jobId = request.nextUrl.searchParams.get("jobId");

  if (user.role === "student") {
    const apps = await Application.find({ student: user._id })
      .sort({ appliedAt: -1 })
      .populate({
        path: "job",
        select: "title deadline status location type company salary",
        populate: {
          path: "company",
          select: "name companyProfile email",
        },
      })
      .populate("company", "name companyProfile email")
      .lean();
    return NextResponse.json({ applications: apps });
  }

  if (user.role === "company") {
    const filter: Record<string, unknown> = { company: user._id };
    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
      filter.job = new mongoose.Types.ObjectId(jobId);
    }
    const apps = await Application.find(filter)
      .sort({ appliedAt: -1 })
      .populate("student", "-password")
      .populate("job", "title status deadline")
      .lean();
    return NextResponse.json({ applications: apps });
  }

  if (user.role === "admin") {
    const total = await Application.countDocuments();
    const applications = await Application.find()
      .sort({ appliedAt: -1 })
      .limit(20)
      .populate("student", "name email")
      .populate("job", "title")
      .lean();
    return NextResponse.json({ applications, total });
  }

  return forbidden();
}

export async function POST(request: Request) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return forbidden();

  const body = await request.json();
  const parsed = applicationCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const { jobId, coverLetter } = parsed.data;

  if (!mongoose.Types.ObjectId.isValid(jobId)) return badRequest("Invalid job");

  const job = await Job.findById(jobId).lean();
  if (!job || job.status !== "open") return notFound("Job not available");

  const companyUser = await User.findById(job.company).lean();
  if (
    !companyUser ||
    companyUser.role !== "company" ||
    !companyUser.isApproved ||
    companyUser.status !== "active"
  ) {
    return forbidden();
  }

  try {
    const app = await Application.create({
      job: job._id,
      student: user._id,
      company: job.company,
      coverLetter: coverLetter ?? "",
      status: "pending",
      appliedAt: new Date(),
    });

    const populated = await Application.findById(app._id)
      .populate("job", "title company")
      .populate("company", "name companyProfile")
      .lean();

    return NextResponse.json({ application: populated });
  } catch (e: unknown) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code?: number }).code === 11000
    ) {
      return badRequest("You have already applied to this job");
    }
    throw e;
  }
}
