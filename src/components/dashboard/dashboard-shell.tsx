"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Users,
  Building2,
  Menu,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export type NavItem = { href: string; label: string; icon: React.ReactNode };

/** Picks the single most specific nav href that matches (avoids /jobs and /jobs/new both active). */
function getActiveNavHref(items: NavItem[], pathname: string): string | null {
  const sorted = [...items].sort((a, b) => b.href.length - a.href.length);
  for (const item of sorted) {
    if (pathname === item.href) return item.href;
    if (pathname.startsWith(`${item.href}/`)) return item.href;
  }
  return null;
}

function NavLinks({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeHref = getActiveNavHref(items, pathname);

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
                active
                  ? "bg-primary-foreground/20"
                  : "bg-sidebar-accent/50 group-hover:bg-sidebar-accent"
              )}
            >
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
            {active && (
              <ChevronRight className="ml-auto size-3.5 opacity-60" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  role,
  navItems,
  children,
}: {
  role: "student" | "company" | "admin";
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const profileHref =
    role === "student"
      ? "/student/profile"
      : role === "company"
        ? "/company/profile"
        : "/admin/dashboard";

  const initial =
    user?.name?.slice(0, 2)?.toUpperCase() ??
    user?.email?.slice(0, 2)?.toUpperCase() ??
    "?";

  const avatarUrl =
    role === "student"
      ? ((user?.studentProfile as { profilePicture?: string })?.profilePicture ??
        "")
      : role === "company"
        ? ((user?.companyProfile as { logo?: string })?.logo ?? "")
        : "";

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  const roleLabel =
    role === "student" ? "Student" : role === "company" ? "Company" : "Admin";

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      {/* Brand */}
      <div className="shrink-0 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md">
            <Building2 className="size-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight">
              Campus Hire
            </p>
            <p className="text-[11px] text-muted-foreground">{roleLabel} Portal</p>
          </div>
        </div>
      </div>

      <div className="mx-3 mb-3 h-px bg-border/60" />

      {/* Nav section label */}
      <p className="mb-1 px-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        Navigation
      </p>

      {/* Nav links */}
      <ScrollArea className="min-h-0 flex-1">
        <NavLinks items={navItems} onNavigate={() => setMobileOpen(false)} />
      </ScrollArea>

      {/* User footer */}
      <div className="shrink-0">
        <div className="mx-3 mb-2 h-px bg-border/60" />
        <div className="p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar className="size-8 shrink-0 ring-2 ring-primary/20">
              <AvatarImage src={avatarUrl || undefined} alt="" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">
                {user?.name ?? "Account"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {user?.email ?? ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Log out"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className="border-sidebar-border bg-sidebar z-30 hidden h-dvh w-60 flex-col border-r md:fixed md:left-0 md:top-0 md:flex"
        aria-label="Main navigation"
      >
        {sidebar}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:pl-60">
        {/* Topbar */}
        <header className="bg-background/80 border-border sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b px-4 backdrop-blur-md md:px-6">
          {/* Mobile: hamburger + brand */}
          <div className="flex items-center gap-3 md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-full flex-col bg-sidebar">
                  {sidebar}
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Building2 className="size-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold">Campus Hire</span>
            </div>
          </div>

          {/* Desktop: empty left (page title is in content) */}
          <div className="hidden md:block" />

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 px-2 focus-visible:ring-0"
                >
                  <Avatar className="size-7 ring-2 ring-primary/20">
                    <AvatarImage src={avatarUrl || undefined} alt="" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[120px] truncate text-sm font-medium md:inline">
                    {user?.name ?? "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium">{user?.name ?? "Account"}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {user?.email ?? ""}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={profileHref} className="cursor-pointer">
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => void handleLogout()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content — 90% width, centered in the column beside the sidebar */}
        <main className="mx-auto w-[90%] min-w-0 max-w-full flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function navIcon(label: string) {
  switch (label) {
    case "dashboard":
      return <LayoutDashboard className="size-3.5" />;
    case "jobs":
      return <Briefcase className="size-3.5" />;
    case "applications":
      return <FileText className="size-3.5" />;
    case "profile":
      return <User className="size-3.5" />;
    case "users":
      return <Users className="size-3.5" />;
    default:
      return <Briefcase className="size-3.5" />;
  }
}
