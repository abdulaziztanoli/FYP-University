import mongoose, { Schema, type InferSchemaType } from "mongoose";

const studentProfileSchema = new Schema(
  {
    university: { type: String, default: "" },
    degree: { type: String, default: "" },
    major: { type: String, default: "" },
    graduationYear: { type: Number, default: new Date().getFullYear() },
    gpa: { type: Number, default: 0 },
    skills: { type: [String], default: [] },
    bio: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    linkedIn: { type: String, default: "" },
    github: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
  },
  { _id: false }
);

const companyProfileSchema = new Schema(
  {
    companyName: { type: String, default: "" },
    industry: { type: String, default: "" },
    website: { type: String, default: "" },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    logo: { type: String, default: "" },
    foundedYear: { type: Number, default: new Date().getFullYear() },
    employeeCount: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "company", "admin"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: "pending",
    },
    isApproved: { type: Boolean, default: false },
    /** SHA-256 of the emailed reset token — never the token itself. */
    resetTokenHash: { type: String, select: false },
    resetTokenExpiresAt: { type: Date, select: false },
    studentProfile: { type: studentProfileSchema, default: {} },
    companyProfile: { type: companyProfileSchema, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ resetTokenHash: 1 }, { sparse: true });

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

const User =
  mongoose.models.User ?? mongoose.model("User", userSchema);

export default User;
