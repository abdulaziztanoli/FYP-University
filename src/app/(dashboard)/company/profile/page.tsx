"use client";

import * as React from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ProfileCompactUpload,
  ProfileDetailsCard,
  ProfileHeroCard,
  ProfileIdentityRow,
  ProfilePageLayout,
  ProfilePageSkeleton,
  ProfileSaveBar,
} from "@/components/profile";
import { swrFetcher } from "@/lib/swr-fetcher";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  name: z.string().min(2),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  foundedYear: z.coerce.number().optional(),
  employeeCount: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CompanyProfilePage() {
  const hydrateUser = useAuthStore((s) => s.hydrateUser);
  const { data, isLoading, mutate } = useSWR(
    "/api/profile",
    swrFetcher<{ user: Record<string, unknown> }>
  );

  const user = data?.user;
  const cp = (user?.companyProfile ?? {}) as Record<string, unknown>;

  const [uploadingLogo, setUploadingLogo] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: user
      ? {
          name: String(user.name ?? ""),
          companyName: String(cp.companyName ?? ""),
          industry: String(cp.industry ?? ""),
          website: String(cp.website ?? ""),
          description: String(cp.description ?? ""),
          location: String(cp.location ?? ""),
          foundedYear: Number(cp.foundedYear ?? new Date().getFullYear()),
          employeeCount: String(cp.employeeCount ?? ""),
          contactEmail: String(cp.contactEmail ?? ""),
          phone: String(cp.phone ?? ""),
        }
      : undefined,
  });

  const displayHeading =
    form.watch("companyName").trim() || String(user?.name ?? "Company");
  const email = String(user?.email ?? "");

  async function uploadLogo(file: File) {
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

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: values.name,
          companyProfile: {
            companyName: values.companyName,
            industry: values.industry,
            website: values.website,
            description: values.description,
            location: values.location,
            foundedYear: values.foundedYear,
            employeeCount: values.employeeCount,
            contactEmail: values.contactEmail,
            phone: values.phone,
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

  if (isLoading || !user) {
    return <ProfilePageSkeleton variant="compact" />;
  }

  const logo = String(cp.logo ?? "");
  const initial = displayHeading.slice(0, 2).toUpperCase();

  return (
    <ProfilePageLayout
      title="Company profile"
      description="Information shown to candidates on job postings."
    >
      <ProfileHeroCard
        banner={
          <ProfileIdentityRow
            avatar={
              <Avatar className="size-20 shrink-0 ring-4 ring-background shadow-xl">
                {logo ? <AvatarImage src={logo} alt="" /> : null}
                <AvatarFallback className="bg-primary/15 text-2xl font-bold text-primary">
                  {initial}
                </AvatarFallback>
              </Avatar>
            }
            accountBadge="Company account"
            heading={displayHeading}
            subtitle={email || undefined}
          />
        }
        footer={
          <div className="border-t border-border/60 bg-muted/10 px-4 py-3 sm:px-6 sm:py-4">
            <ProfileCompactUpload
              icon={Building2}
              title="Company logo"
              description="PNG or JPG · Shown on job posts and your public presence."
              actionLabel="Upload logo"
              accept="image/*"
              disabled={uploadingLogo}
              uploading={uploadingLogo}
              onFile={async (f) => {
                setUploadingLogo(true);
                try {
                  const url = await uploadLogo(f);
                  await fetch("/api/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ companyProfile: { logo: url } }),
                  });
                  toast.success("Logo updated");
                  await mutate();
                  await hydrateUser();
                } catch {
                  toast.error("Upload failed");
                } finally {
                  setUploadingLogo(false);
                }
              }}
            />
          </div>
        }
      />

      <ProfileDetailsCard
        icon={Building2}
        title="Company details"
        description="Keep your organization info accurate so candidates know who they are applying to."
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Account name</Label>
            <Input className="rounded-lg" {...form.register("name")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Company name</Label>
              <Input className="rounded-lg" {...form.register("companyName")} />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input className="rounded-lg" {...form.register("industry")} />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input className="rounded-lg" {...form.register("website")} />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input className="rounded-lg" {...form.register("location")} />
            </div>
            <div className="space-y-2">
              <Label>Founded year</Label>
              <Input
                type="number"
                className="rounded-lg"
                {...form.register("foundedYear", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Employee count</Label>
              <Input className="rounded-lg" {...form.register("employeeCount")} />
            </div>
            <div className="space-y-2">
              <Label>Contact email</Label>
              <Input className="rounded-lg" {...form.register("contactEmail")} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input className="rounded-lg" {...form.register("phone")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={5} className="min-h-[120px] rounded-lg" {...form.register("description")} />
          </div>

          <ProfileSaveBar submitLabel="Save profile" loading={form.formState.isSubmitting} icon={Save} />
        </form>
      </ProfileDetailsCard>
    </ProfilePageLayout>
  );
}
