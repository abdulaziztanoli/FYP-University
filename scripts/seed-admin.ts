/**
 * Usage: npm run seed:admin
 * Loads `.env.local` then `.env` via dotenv. Requires MONGODB_URI.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function load() {
  const { connectDB } = await import("../src/lib/mongoose");
  const { default: User } = await import("../src/models/User");
  const { hashPassword } = await import("../src/lib/auth");

  const email =
    process.env.SEED_ADMIN_EMAIL ?? "admin@campus.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMeAdmin123!";
  const name = process.env.SEED_ADMIN_NAME ?? "Platform Admin";

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  const hashed = await hashPassword(password);

  await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role: "admin",
    status: "active",
    studentProfile: {},
    companyProfile: {},
  });

  console.log("Created admin user:", email);
  console.log("Temporary password:", password);
  console.log("Change this password after first login.");
  process.exit(0);
}

load().catch((e) => {
  console.error(e);
  process.exit(1);
});
