import { Readable } from "stream";
import { configureCloudinary } from "@/lib/cloudinary";

/**
 * True only for a URL that came out of this account's `campus/<userId>/` folder.
 *
 * The client sends a resume URL rather than the file itself, so without this a
 * student could attach any arbitrary link — another applicant's resume scraped
 * from somewhere, or a hostile URL a recruiter would then click straight from
 * the applicants panel.
 */
export function isOwnUploadUrl(url: string, userId: string): boolean {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud) return false;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  return (
    parsed.protocol === "https:" &&
    parsed.hostname === "res.cloudinary.com" &&
    parsed.pathname.startsWith(`/${cloud}/`) &&
    parsed.pathname.includes(`/campus/${userId}/`)
  );
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  allowedFormats: string[]
): Promise<{ secure_url: string }> {
  const cloudinary = configureCloudinary();

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        allowed_formats: allowedFormats,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Upload failed"));
          return;
        }
        resolve({ secure_url: result.secure_url });
      }
    );

    Readable.from(buffer).pipe(upload);
  });
}
