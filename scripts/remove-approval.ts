/**
 * Usage: npm run migrate:remove-approval
 * One-off: activates accounts left "pending" by the old admin-approval flow
 * and drops the obsolete `isApproved` field. Safe to run more than once.
 * Loads `.env.local` then `.env` via dotenv. Requires MONGODB_URI.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function load() {
  const { connectDB } = await import("../src/lib/mongoose");
  const { default: User } = await import("../src/models/User");

  await connectDB();

  // Bypass the schema so the old field/status values can be matched and removed.
  const users = User.collection;

  const activated = await users.updateMany(
    { status: "pending" },
    { $set: { status: "active" } }
  );
  const cleaned = await users.updateMany(
    { isApproved: { $exists: true } },
    { $unset: { isApproved: "" } }
  );

  console.log("Activated pending users:", activated.modifiedCount);
  console.log("Removed isApproved from users:", cleaned.modifiedCount);
  process.exit(0);
}

load().catch((e) => {
  console.error(e);
  process.exit(1);
});
