import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";

export async function fetchUsersList(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "10")));
  const skip = (page - 1) * limit;

  const roleParam = searchParams.get("role");
  const statusParam = searchParams.get("status");
  const search = (searchParams.get("search") ?? "").trim();

  const filter: Record<string, unknown> = {};

  if (roleParam && ["student", "company", "admin"].includes(roleParam)) {
    filter.role = roleParam;
  }
  if (statusParam && ["pending", "active", "blocked"].includes(statusParam)) {
    filter.status = statusParam;
  }

  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  const safe = items.map((u) => ({
    ...u,
    _id: (u._id as mongoose.Types.ObjectId).toString(),
  }));

  return {
    users: safe,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
