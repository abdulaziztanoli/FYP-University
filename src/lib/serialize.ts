import type { Document } from "mongoose";

/** Strip password and normalize _id for JSON responses. */
export function serializeUser(
  doc:
    | Record<string, unknown>
    | Document
    | null
    | undefined
): Record<string, unknown> | null {
  if (!doc) return null;
  const plain =
    typeof (doc as Document).toObject === "function"
      ? (doc as Document).toObject()
      : { ...doc };
  const { password: _, ...rest } = plain as {
    password?: string;
    [k: string]: unknown;
  };
  if (rest._id != null) rest._id = String(rest._id);
  return rest;
}
