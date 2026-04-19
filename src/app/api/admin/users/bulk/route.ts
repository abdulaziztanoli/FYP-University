import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { adminBulkSchema } from "@/lib/validators";
import { forbidden, badRequest } from "@/lib/http";

export async function PATCH(request: Request) {
  await connectDB();
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return forbidden();

  const body = await request.json();
  const parsed = adminBulkSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten());
  }

  const { ids, action } = parsed.data;
  const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id)).map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  if (objectIds.length === 0) return badRequest("No valid ids");

  if (action === "approve") {
    await User.updateMany(
      { _id: { $in: objectIds } },
      { $set: { isApproved: true, status: "active" } }
    );
  } else {
    await User.updateMany({ _id: { $in: objectIds } }, { $set: { status: "blocked" } });
  }

  return NextResponse.json({ ok: true, affected: objectIds.length });
}
