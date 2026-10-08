"use client";

import * as React from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { swrFetcher } from "@/lib/swr-fetcher";
import { accountStatusBadgeClass } from "@/lib/status-styles";
import {
  Search,
  Filter,
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldCheck,
  GraduationCap,
  Building2,
  MapPin,
  Phone,
  Globe,
  Code2,
  Share2,
  FileText,
  Link2,
  CalendarDays,
  Mail,
  Users,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
  studentProfile?: Record<string, unknown>;
  companyProfile?: Record<string, unknown>;
};

export default function AdminUsersPage() {
  const [role, setRole] = React.useState<string>("all");
  const [status, setStatus] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [detail, setDetail] = React.useState<UserRow | null>(null);
  const [pendingPatch, setPendingPatch] = React.useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const qs = React.useMemo(() => {
    const p = new URLSearchParams({ page: String(page), limit: "10" });
    if (role !== "all") p.set("role", role);
    if (status !== "all") p.set("status", status);
    if (debounced.trim()) p.set("search", debounced.trim());
    return p.toString();
  }, [page, role, status, debounced]);

  const key = `/api/admin/users?${qs}`;
  const { data, isLoading, mutate } = useSWR(
    key,
    swrFetcher<{
      users: UserRow[];
      pagination: { total: number; totalPages: number; page: number };
    }>
  );

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  function toggleAll(checked: boolean) {
    const next: Record<string, boolean> = {};
    if (checked) users.forEach((u) => (next[u._id] = true));
    setSelected(next);
  }

  async function patchUser(id: string, action: "block" | "unblock") {
    const k = `${id}:${action}`;
    setPendingPatch(k);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      if (!res.ok) toast.error("Update failed");
      else {
        toast.success("User updated");
        await mutate();
      }
    } finally {
      setPendingPatch(null);
    }
  }

  async function bulkBlock() {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (!ids.length) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids, action: "block" }),
      });
      if (!res.ok) toast.error("Bulk action failed");
      else {
        toast.success("Done");
        setSelected({});
        await mutate();
      }
    } finally {
      setBulkLoading(false);
    }
  }

  const allChecked =
    users.length > 0 && users.every((u) => selected[u._id]);
  const someChecked =
    users.some((u) => selected[u._id]) && !allChecked;
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const roleColors: Record<string, string> = {
    student:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200",
    company:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200",
    admin:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200",
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search, filter, or block user accounts.
        </p>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            {/* Role filter */}
            <div className="flex items-center gap-2">
              <Filter className="size-3.5 shrink-0 text-muted-foreground" />
              <Select
                value={role}
                onValueChange={(v) => {
                  setRole(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status filter */}
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>

            {/* Bulk actions — only visible when items selected */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5">
                <span className="text-xs font-medium text-primary">
                  {selectedCount} selected
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 gap-1 text-xs"
                  loading={bulkLoading}
                  onClick={() => void bulkBlock()}
                >
                  <Ban className="size-3.5" />
                  Block
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table — Table component already provides border/radius; do not wrap in Card (double box) */}
      {isLoading ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-16 text-center shadow-sm">
          <Search className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No users match your filters.
          </p>
        </div>
      ) : (
        <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allChecked || (someChecked ? "indeterminate" : false)}
                    onCheckedChange={(c) => toggleAll(c === true)}
                  />
                </TableHead>
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Joined</TableHead>
                <TableHead className="text-right font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow
                  key={u._id}
                  className={cn(
                    "transition-colors",
                    selected[u._id] && "bg-primary/5"
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={!!selected[u._id]}
                      onCheckedChange={(c) =>
                        setSelected((prev) => ({
                          ...prev,
                          [u._id]: c === true,
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {u.name?.slice(0, 2).toUpperCase() ?? "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{u.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize",
                        roleColors[u.role] ?? "bg-muted text-muted-foreground"
                      )}
                    >
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        accountStatusBadgeClass(u.status)
                      )}
                    >
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      {u.status !== "blocked" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-destructive hover:bg-destructive hover:text-white"
                          loading={pendingPatch === `${u._id}:block`}
                          onClick={() => void patchUser(u._id, "block")}
                        >
                          <Ban className="size-3" />
                          Block
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          loading={pendingPatch === `${u._id}:unblock`}
                          onClick={() => void patchUser(u._id, "unblock")}
                        >
                          Unblock
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => setDetail(u)}
                        aria-label="View details"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Page{" "}
            <span className="font-medium text-foreground">
              {pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {pagination.totalPages}
            </span>{" "}
            ·{" "}
            <span className="font-medium text-foreground">
              {pagination.total}
            </span>{" "}
            users total
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* User detail sheet */}
      <Sheet open={!!detail} onOpenChange={() => setDetail(null)}>
        <SheetContent className="overflow-y-auto p-0 sm:max-w-md">
          {/* Hero header */}
          <div className="border-b border-border/60 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent px-6 pb-5 pt-6">
            <SheetHeader className="mb-0 space-y-0">
              <div className="flex items-center gap-4">
                <Avatar className="size-14 ring-2 ring-primary/20 ring-offset-2">
                  <AvatarFallback className="bg-primary/15 text-primary text-lg font-bold">
                    {detail?.name?.slice(0, 2).toUpperCase() ?? "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle className="text-base font-bold leading-snug">
                    {detail?.name}
                  </SheetTitle>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
                    <Mail className="size-3 shrink-0" />
                    {detail?.email}
                  </p>
                </div>
              </div>

              {/* Role + Status pills */}
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                    roleColors[detail?.role ?? ""] ??
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {detail?.role === "student" && (
                    <GraduationCap className="size-3" />
                  )}
                  {detail?.role === "company" && (
                    <Building2 className="size-3" />
                  )}
                  {detail?.role}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    accountStatusBadgeClass(detail?.status ?? "")
                  )}
                >
                  {detail?.status}
                </Badge>
              </div>
            </SheetHeader>
          </div>

          {/* Profile content */}
          <div className="space-y-5 px-6 py-5">
            {detail?.role === "student" && detail.studentProfile && (
              <StudentProfileCard
                profile={
                  detail.studentProfile as Record<string, unknown>
                }
              />
            )}
            {detail?.role === "company" && detail.companyProfile && (
              <CompanyProfileCard
                profile={
                  detail.companyProfile as Record<string, unknown>
                }
              />
            )}
            {detail?.role === "admin" && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center">
                <ShieldCheck className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Administrator account
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ─── Student profile card ───────────────────────────────────── */
function StudentProfileCard({ profile }: { profile: Record<string, unknown> }) {
  const sp = profile as {
    university?: string;
    degree?: string;
    major?: string;
    graduationYear?: number;
    gpa?: number;
    skills?: string[];
    bio?: string;
    resumeUrl?: string;
    linkedIn?: string;
    github?: string;
    phone?: string;
    location?: string;
  };

  return (
    <div className="space-y-4">
      <SectionHeading icon={GraduationCap} label="Academic" />

      <div className="grid grid-cols-2 gap-3">
        <InfoTile label="University" value={sp.university} />
        <InfoTile label="Degree" value={sp.degree} />
        <InfoTile label="Major" value={sp.major} />
        <InfoTile label="Grad year" value={sp.graduationYear?.toString()} />
        <InfoTile label="GPA" value={sp.gpa ? String(sp.gpa) : undefined} />
        <InfoTile label="Location" value={sp.location} icon={MapPin} />
      </div>

      {sp.bio && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Bio
          </p>
          <p className="rounded-lg bg-muted/50 px-3 py-2.5 text-sm leading-relaxed">
            {sp.bio}
          </p>
        </div>
      )}

      {sp.skills && sp.skills.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sp.skills.map((s) => (
              <span
                key={s}
                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {(sp.phone || sp.linkedIn || sp.github || sp.resumeUrl) && (
        <>
          <SectionHeading icon={Link2} label="Links & Contact" />
          <div className="space-y-2">
            {sp.phone && (
              <LinkRow icon={Phone} label={sp.phone} href={`tel:${sp.phone}`} />
            )}
            {sp.linkedIn && (
              <LinkRow icon={Share2} label="LinkedIn profile" href={sp.linkedIn} external />
            )}
            {sp.github && (
              <LinkRow icon={Code2} label="GitHub profile" href={sp.github} external />
            )}
            {sp.resumeUrl && (
              <LinkRow icon={FileText} label="View resume" href={sp.resumeUrl} external />
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Company profile card ───────────────────────────────────── */
function CompanyProfileCard({ profile }: { profile: Record<string, unknown> }) {
  const cp = profile as {
    companyName?: string;
    industry?: string;
    website?: string;
    description?: string;
    location?: string;
    foundedYear?: number;
    employeeCount?: string;
    contactEmail?: string;
    phone?: string;
  };

  return (
    <div className="space-y-4">
      <SectionHeading icon={Building2} label="Company details" />

      <div className="grid grid-cols-2 gap-3">
        <InfoTile label="Company name" value={cp.companyName} />
        <InfoTile label="Industry" value={cp.industry} />
        <InfoTile label="Founded" value={cp.foundedYear?.toString()} icon={CalendarDays} />
        <InfoTile label="Employees" value={cp.employeeCount} icon={Users} />
        <InfoTile label="Location" value={cp.location} icon={MapPin} />
        <InfoTile label="Industry" value={cp.industry} icon={Layers} />
      </div>

      {cp.description && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            About
          </p>
          <p className="rounded-lg bg-muted/50 px-3 py-2.5 text-sm leading-relaxed">
            {cp.description}
          </p>
        </div>
      )}

      {(cp.website || cp.contactEmail || cp.phone) && (
        <>
          <SectionHeading icon={Link2} label="Contact" />
          <div className="space-y-2">
            {cp.contactEmail && (
              <LinkRow icon={Mail} label={cp.contactEmail} href={`mailto:${cp.contactEmail}`} />
            )}
            {cp.phone && (
              <LinkRow icon={Phone} label={cp.phone} href={`tel:${cp.phone}`} />
            )}
            {cp.website && (
              <LinkRow icon={Globe} label="Visit website" href={cp.website} external />
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Shared sub-components ──────────────────────────────────── */
function SectionHeading({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10">
        <Icon className="size-3 text-primary" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}

function InfoTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string;
  icon?: React.ElementType;
}) {
  if (!value) return null;
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 flex items-center gap-1 text-sm font-medium">
        {Icon && <Icon className="size-3 shrink-0 text-muted-foreground" />}
        {value}
      </p>
    </div>
  );
}

function LinkRow({
  icon: Icon,
  label,
  href,
  external,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-primary"
    >
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{label}</span>
      {external && (
        <Globe className="ml-auto size-3 shrink-0 text-muted-foreground/50" />
      )}
    </a>
  );
}
