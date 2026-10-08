import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import Job from "@/models/Job";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { jobCreateSchema } from "@/lib/validators";
import { forbidden, unauthorized, badRequest } from "@/lib/http";

export async function GET(request: NextRequest) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "12")));
  const skip = (page - 1) * limit;

  const type = searchParams.get("type");
  const location = searchParams.get("location");
  const experience = searchParams.get("experience");
  const remote = searchParams.get("remote");
  const search = searchParams.get("search") ?? "";
  const skillsParam = searchParams.get("skills");
  const statusFilter = searchParams.get("status");

  const skills = skillsParam
    ? skillsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const baseFilter: Record<string, unknown> = {};

  if (user.role === "company") {
    baseFilter.company = new mongoose.Types.ObjectId(user._id);
    if (statusFilter && ["open", "closed", "draft"].includes(statusFilter)) {
      baseFilter.status = statusFilter;
    }
  } else if (user.role === "student") {
    const activeCompanies = await User.find({
      role: "company",
      status: "active",
    })
      .select("_id")
      .lean();
    const ids = activeCompanies.map((c) => c._id);
    baseFilter.status = "open";
    baseFilter.company = { $in: ids };
  } else if (user.role === "admin") {
    if (statusFilter && ["open", "closed", "draft"].includes(statusFilter)) {
      baseFilter.status = statusFilter;
    }
  } else {
    return forbidden();
  }

  if (type && ["full-time", "part-time", "internship", "contract"].includes(type)) {
    baseFilter.type = type;
  }
  if (location?.trim()) {
    baseFilter.location = new RegExp(location.trim(), "i");
  }
  if (experience && ["entry", "mid", "senior"].includes(experience)) {
    baseFilter.experienceLevel = experience;
  }
  if (remote === "true") baseFilter.isRemote = true;
  if (remote === "false") baseFilter.isRemote = false;
  if (skills.length) {
    baseFilter.skills = { $all: skills };
  }

  const searchRx = search.trim()
    ? new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    : null;

  const filter =
    searchRx && !skills.length
      ? {
          ...baseFilter,
          $or: [{ title: searchRx }, { description: searchRx }],
        }
      : searchRx && skills.length
        ? {
            $and: [
              baseFilter,
              {
                $or: [{ title: searchRx }, { description: searchRx }],
              },
            ],
          }
        : baseFilter;

  const [items, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("company", "name email companyProfile status role")
      .lean(),
    Job.countDocuments(filter),
  ]);

  return NextResponse.json({
    jobs: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: Request) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user || user.role !== "company") return forbidden();

  const body = await request.json();
  const parsed = jobCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const data = parsed.data;
  const job = await Job.create({
    ...data,
    company: user._id,
  });

  const populated = await Job.findById(job._id)
    .populate("company", "name email companyProfile")
    .lean();

  return NextResponse.json({ job: populated });
}
