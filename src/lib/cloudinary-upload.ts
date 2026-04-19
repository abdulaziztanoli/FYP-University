import { Readable } from "stream";
import { configureCloudinary } from "@/lib/cloudinary";

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
