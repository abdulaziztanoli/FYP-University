import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { serializeUser } from "@/lib/serialize";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    await connectDB();

    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(data.password);

    const userDoc = await User.create({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: hashed,
      role: data.role,
      status: "pending",
      isApproved: false,
      studentProfile:
        data.role === "student"
          ? {
              university: data.university?.trim() ?? "",
              degree: data.degree?.trim() ?? "",
              major: "",
              graduationYear: data.graduationYear ?? new Date().getFullYear(),
              gpa: 0,
              skills: [],
              bio: "",
              profilePicture: "",
              resumeUrl: "",
              linkedIn: "",
              github: "",
              phone: "",
              location: "",
            }
          : {},
      companyProfile:
        data.role === "company"
          ? {
              companyName: data.companyName?.trim() ?? "",
              industry: data.industry?.trim() ?? "",
              website: data.website?.trim() ?? "",
              description: "",
              location: "",
              logo: "",
              foundedYear: new Date().getFullYear(),
              employeeCount: "",
              contactEmail: data.email.toLowerCase(),
              phone: "",
            }
          : {},
    });

    return NextResponse.json({
      message: "Your account is pending admin approval",
      user: serializeUser(userDoc),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
