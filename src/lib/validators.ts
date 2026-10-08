import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    confirmPassword: z.string(),
    role: z.enum(["student", "company"]),
    university: z.string().optional(),
    degree: z.string().optional(),
    graduationYear: z.coerce.number().min(1950).max(2100).optional(),
    companyName: z.string().optional(),
    industry: z.string().optional(),
    website: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    if (data.role === "student") {
      if (!data.university?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "University is required",
          path: ["university"],
        });
      }
      if (!data.degree?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Degree is required",
          path: ["degree"],
        });
      }
      if (data.graduationYear == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Graduation year is required",
          path: ["graduationYear"],
        });
      }
    }
    if (data.role === "company") {
      if (!data.companyName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company name is required",
          path: ["companyName"],
        });
      }
      if (!data.industry?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Industry is required",
          path: ["industry"],
        });
      }
    }
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8).max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const jobFields = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  type: z.enum(["full-time", "part-time", "internship", "contract"]),
  location: z.string().min(1),
  isRemote: z.boolean().default(false),
  salary: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
      currency: z.string().default("USD"),
    })
    .refine((s) => s.max >= s.min, { message: "Max salary must be >= min" }),
  skills: z.array(z.string()).default([]),
  deadline: z.coerce.date(),
  status: z.enum(["open", "closed", "draft"]).default("draft"),
  experienceLevel: z.enum(["entry", "mid", "senior"]),
  positions: z.coerce.number().min(1).default(1),
});

export const jobCreateSchema = jobFields;

export const jobUpdateSchema = jobFields.partial();

export const applicationCreateSchema = z.object({
  jobId: z.string().min(1),
  coverLetter: z.string().max(8000).optional().default(""),
  /** Required — every application must carry the resume it was sent with. */
  resumeUrl: z.string().min(1, "A resume is required to apply").max(2000),
  resumeName: z.string().max(255).optional().default(""),
});

export const applicationUpdateSchema = z.object({
  status: z
    .enum(["pending", "reviewed", "shortlisted", "rejected", "accepted"])
    .optional(),
  notes: z.string().max(8000).optional(),
});

export const adminUserUpdateSchema = z.object({
  action: z.enum(["block", "unblock"]),
});

export const adminBulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  action: z.enum(["block"]),
});

export const conversationCreateSchema = z.object({
  peerId: z.string().min(1),
});

export const messageCreateSchema = z.object({
  body: z.string().trim().min(1, "Message cannot be empty").max(4000),
  /** Echoed back so the client can reconcile its optimistic bubble. */
  clientId: z.string().max(64).optional(),
});

const studentProfileUpdate = z.object({
  university: z.string().optional(),
  degree: z.string().optional(),
  major: z.string().optional(),
  graduationYear: z.coerce.number().optional(),
  gpa: z.coerce.number().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  profilePicture: z.string().optional(),
  resumeUrl: z.string().optional(),
  linkedIn: z.string().optional(),
  github: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
});

const companyProfileUpdate = z.object({
  companyName: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  logo: z.string().optional(),
  foundedYear: z.coerce.number().optional(),
  employeeCount: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export const profilePutSchema = z.object({
  name: z.string().min(2).optional(),
  studentProfile: studentProfileUpdate.optional(),
  companyProfile: companyProfileUpdate.optional(),
});
