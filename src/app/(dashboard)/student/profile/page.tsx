"use client";

import * as React from "react";
import useSWR from "swr";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  BookOpen,
  Camera,
  Code2,
  FileText,
  GraduationCap,
  Link2,
  Loader2,
  MapPin,
  Phone,
  Save,
  Share2,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ProfileCompactUpload,
  ProfileDetailsCard,
  ProfileHeroCard,
  ProfileIdentityRow,
  ProfilePageLayout,
  ProfilePageSkeleton,
  ProfileSaveBar,
  ProfileSection,
} from "@/components/profile";
import { swrFetcher } from "@/lib/swr-fetcher";
import { useAuthStore } from "@/stores/auth-store";

/** Coerce number inputs without `z.coerce.number()` (Zod 4 infers `unknown` and breaks `zodResolver` typing). */
function optionalNumberField() {
  return z
    .unknown()
    .transform((val): number | undefined => {
      if (val === "" || val === null || val === undefined) return undefined;
      if (typeof val === "number") return Number.isFinite(val) ? val : undefined;
      const n = Number(String(val));
      return Number.isFinite(n) ? n : undefined;
    })
    .pipe(z.number().optional());
}

const schema = z.object({
  name: z.string().min(2),
  university: z.string().optional(),
  degree: z.string().optional(),
  major: z.string().optional(),
  graduationYear: optionalNumberField(),
  gpa: optionalNumberField(),
  bio: z.string().optional(),
  linkedIn: z.string().optional(),
  github: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  skillInput: z.string().optional(),
});

type FormValues = z.output<typeof schema>;

export default function StudentProfilePage() {
  const hydrateUser = useAuthStore((s) => s.hydrateUser);
  const { data, isLoading, mutate } = useSWR(
    "/api/profile",
    swrFetcher<{ user: Record<string, unknown> }>
  );

  const user = data?.user;
  const sp = (user?.studentProfile ?? {}) as Record<string, unknown>;
  const [skills, setSkills] = React.useState<string[]>([]);
  const [uploading, setUploading] = React.useState<null | "photo" | "resume">(null);
  const [removingResume, setRemovingResume] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    values: user
      ? {
          name: String(user.name ?? ""),
          university: String(sp.university ?? ""),
          degree: String(sp.degree ?? ""),
          major: String(sp.major ?? ""),
          graduationYear: Number(sp.graduationYear ?? new Date().getFullYear()),
          gpa: Number(sp.gpa ?? 0),
          bio: String(sp.bio ?? ""),
          linkedIn: String(sp.linkedIn ?? ""),
          github: String(sp.github ?? ""),
          phone: String(sp.phone ?? ""),
          location: String(sp.location ?? ""),
          skillInput: "",
        }
      : undefined,
  });

  const displayName = form.watch("name") || String(user?.name ?? "Student");
  const email = String(user?.email ?? "");

  React.useEffect(() => {
    if (Array.isArray(sp.skills)) setSkills(sp.skills as string[]);
  }, [user, sp.skills]);

  async function uploadField(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Upload failed");
    return body.url as string;
  }

  /**
   * Clears the profile pointer only. The file itself stays on Cloudinary
   * because applications already submitted may reference the same URL —
   * deleting the asset would break the copy a company received.
   */
  async function removeResume() {
    setRemovingResume(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ studentProfile: { resumeUrl: "" } }),
      });
      if (!res.ok) throw new Error("Request failed");
      toast.success("Resume removed");
      await mutate();
      await hydrateUser();
    } catch {
      toast.error("Could not remove resume");
    } finally {
      setRemovingResume(false);
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      const { skillInput, name, ...spFields } = values;
      void skillInput;
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          studentProfile: {
            ...spFields,
            skills,
          },
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Could not save");
        return;
      }
      toast.success("Profile updated");
      await mutate();
      await hydrateUser();
    } catch {
      toast.error("Save failed");
    }
  }

  function addSkill(raw: string) {
    const s = raw.trim();
    if (!s || skills.includes(s)) return;
    setSkills([...skills, s]);
    form.setValue("skillInput", "");
  }

  function removeSkill(s: string) {
    setSkills(skills.filter((x) => x !== s));
  }

  if (isLoading || !user) {
    return <ProfilePageSkeleton />;
  }

  const profilePicture = String(sp.profilePicture ?? "");
  const resumeUrl = String(sp.resumeUrl ?? "");
  const initial = displayName.slice(0, 2).toUpperCase();

  return (
    <ProfilePageLayout
      title="Your profile"
      description="A complete profile helps employers understand your background and match you to roles."
    >
      <ProfileHeroCard
        banner={
          <ProfileIdentityRow
            avatar={
              <Avatar className="size-20 shrink-0 ring-4 ring-background shadow-xl">
                {profilePicture ? <AvatarImage src={profilePicture} alt="" /> : null}
                <AvatarFallback className="bg-primary/15 text-2xl font-bold text-primary">
                  {initial}
                </AvatarFallback>
              </Avatar>
            }
            accountBadge="Student account"
            heading={displayName}
            subtitle={email || undefined}
          />
        }
        footer={
          <div className="grid gap-3 border-t border-border/60 bg-muted/10 px-4 py-3 sm:grid-cols-2 sm:gap-4 sm:px-6 sm:py-4">
            <ProfileCompactUpload
              icon={Camera}
              title="Profile photo"
              description="JPG or PNG · Shown to employers with applications."
              actionLabel="Choose image"
              accept="image/*"
              disabled={uploading !== null}
              uploading={uploading === "photo"}
              onFile={async (f) => {
                setUploading("photo");
                try {
                  const url = await uploadField(f);
                  await fetch("/api/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                      studentProfile: { profilePicture: url },
                    }),
                  });
                  toast.success("Photo updated");
                  await mutate();
                  await hydrateUser();
                } catch {
                  toast.error("Upload failed");
                } finally {
                  setUploading(null);
                }
              }}
            />
            <ProfileCompactUpload
              icon={FileText}
              title="Resume"
              description="PDF only · Used when you apply to jobs."
              actionLabel={resumeUrl ? "Replace PDF" : "Upload PDF"}
              accept="application/pdf"
              disabled={uploading !== null || removingResume}
              uploading={uploading === "resume"}
              onFile={async (f) => {
                setUploading("resume");
                try {
                  const url = await uploadField(f);
                  await fetch("/api/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                      studentProfile: { resumeUrl: url },
                    }),
                  });
                  toast.success("Resume uploaded");
                  await mutate();
                  await hydrateUser();
                } catch {
                  toast.error("Upload failed");
                } finally {
                  setUploading(null);
                }
              }}
              footer={
                resumeUrl ? (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-fit items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      <FileText className="size-3" />
                      View current resume
                    </a>
                    <button
                      type="button"
                      onClick={() => void removeResume()}
                      disabled={removingResume || uploading !== null}
                      className="inline-flex w-fit cursor-pointer items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-destructive disabled:pointer-events-none disabled:opacity-60"
                    >
                      {removingResume ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                      {removingResume ? "Removing…" : "Remove"}
                    </button>
                  </div>
                ) : null
              }
            />
          </div>
        }
      />

      <ProfileDetailsCard
        icon={User}
        title="Profile details"
        description="This information is shared with employers when you apply."
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Full name
            </Label>
            <Input
              id="name"
              className="rounded-lg"
              placeholder="e.g. Alex Morgan"
              {...form.register("name")}
            />
          </div>

          <Separator />

          <ProfileSection
            icon={GraduationCap}
            title="Education"
            description="School and program help match you to internships and new-grad roles."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>University</Label>
                <Input
                  className="rounded-lg"
                  placeholder="e.g. University of Karachi"
                  {...form.register("university")}
                />
              </div>
              <div className="space-y-2">
                <Label>Degree</Label>
                <Input
                  className="rounded-lg"
                  placeholder="e.g. BS Computer Science"
                  {...form.register("degree")}
                />
              </div>
              <div className="space-y-2">
                <Label>Major</Label>
                <Input
                  className="rounded-lg"
                  placeholder="e.g. Software Engineering"
                  {...form.register("major")}
                />
              </div>
              <div className="space-y-2">
                <Label>Graduation year</Label>
                <Input
                  type="number"
                  className="rounded-lg"
                  placeholder="e.g. 2027"
                  {...form.register("graduationYear", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>GPA</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="rounded-lg"
                  placeholder="e.g. 3.45"
                  {...form.register("gpa", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  Location
                </Label>
                <Input
                  className="rounded-lg"
                  placeholder="e.g. Karachi, Pakistan"
                  {...form.register("location")}
                />
              </div>
            </div>
          </ProfileSection>

          <Separator />

          <ProfileSection
            icon={BookOpen}
            title="About you"
            description="A short bio can set you apart—keep it professional."
          >
            <Textarea
              rows={5}
              className="min-h-[120px] resize-y rounded-lg"
              placeholder="Interests, projects, clubs, or what you are looking for next…"
              {...form.register("bio")}
            />
          </ProfileSection>

          <Separator />

          <ProfileSection
            icon={Link2}
            title="Links & contact"
            description="Optional—helps recruiters reach you outside the platform."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Share2 className="size-3.5 text-muted-foreground" />
                  LinkedIn
                </Label>
                <Input
                  className="rounded-lg"
                  placeholder="https://linkedin.com/in/username"
                  {...form.register("linkedIn")}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Code2 className="size-3.5 text-muted-foreground" />
                  GitHub
                </Label>
                <Input
                  className="rounded-lg"
                  placeholder="https://github.com/username"
                  {...form.register("github")}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  Phone
                </Label>
                <Input
                  className="rounded-lg"
                  placeholder="e.g. +92 300 1234567"
                  {...form.register("phone")}
                />
              </div>
            </div>
          </ProfileSection>

          <Separator />

          <ProfileSection
            icon={Sparkles}
            title="Skills"
            description="Add tags that describe your stack—used for job matching."
          >
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => removeSkill(s)}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  {s}
                  <X className="size-3 opacity-70 group-hover:opacity-100" aria-hidden />
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                className="rounded-lg sm:flex-1"
                placeholder="Type a skill and press Enter"
                {...form.register("skillInput")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(form.getValues("skillInput") ?? "");
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                className="shrink-0"
                onClick={() => addSkill(form.getValues("skillInput") ?? "")}
              >
                Add skill
              </Button>
            </div>
          </ProfileSection>

          <ProfileSaveBar
            hint="Changes are saved when you click the button below."
            submitLabel="Save profile"
            loading={form.formState.isSubmitting}
            icon={Save}
          />
        </form>
      </ProfileDetailsCard>
    </ProfilePageLayout>
  );
}
