import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getCurrentUser } from "@/lib/auth";
import { forbidden, unauthorized } from "@/lib/http";
import { fetchUsersList } from "@/lib/admin-users";

export async function GET(request: NextRequest) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return forbidden();

  const result = await fetchUsersList(request);
  return NextResponse.json(result);
}
