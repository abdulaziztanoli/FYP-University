import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { unauthorized, badRequest } from "@/lib/http";
import { uploadBufferToCloudinary } from "@/lib/cloudinary-upload";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return badRequest("Expected multipart form data");
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return badRequest("Missing file field");
  }

  if (file.size > MAX_BYTES) {
    return badRequest("File too large (max 5MB)");
  }

  const mime = file.type || "";
  const allowedMime = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ];
  if (!allowedMime.includes(mime)) {
    return badRequest("Only images and PDF files are allowed");
  }

  const buf = Buffer.from(await file.arrayBuffer());

  let formats: string[];
  if (mime === "application/pdf") {
    formats = ["pdf"];
  } else {
    formats = ["jpg", "png", "webp", "gif"];
  }

  try {
    const { secure_url } = await uploadBufferToCloudinary(
      buf,
      `campus/${user._id}`,
      formats
    );
    return NextResponse.json({ url: secure_url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
