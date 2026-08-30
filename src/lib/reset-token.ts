import { createHash, randomBytes } from "crypto";

/** How long an emailed reset link stays usable. */
export const RESET_TOKEN_TTL_MINUTES = 30;

/** Raw token goes in the email; only its hash is stored on the user. */
export function createResetToken() {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: hashResetToken(token),
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000),
  };
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
