import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Lock,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(from_var(--primary)_l_c_h_/_0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(from_var(--primary)_l_c_h_/_0.12),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_100%_0%,oklch(from_var(--chart-2)_l_c_h_/_0.08),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_0%_100%,oklch(from_var(--muted-foreground)_l_c_h_/_0.06),transparent_40%)]"
      />

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="font-heading text-sm font-semibold tracking-tight text-foreground"
          >
            Campus Recruitment
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="lg" className="h-9 px-4" asChild>
              <Link href="/register">
                Get started
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:pb-24 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-6">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                <Sparkles className="size-3" />
                Hiring, simplified for campus
              </Badge>
              <div className="space-y-4">
                <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[2.75rem] lg:leading-[1.1]">
                  One place for students, employers, and admins
                </h1>
                <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Post roles, discover opportunities, and run campus recruitment with clear
                  workflows—without juggling spreadsheets and scattered threads.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" className="h-10 px-5" asChild>
                  <Link href="/register">
                    Create an account
                    <ArrowRight className="size-4" data-icon="inline-end" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-10 px-5" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Role-based access keeps student, company, and admin areas separate and secure.
              </p>
            </div>

            <div className="relative lg:pl-4">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-chart-2/10 blur-2xl lg:-inset-6" aria-hidden />
              <div className="relative space-y-3">
                <Card className="border-border/80 shadow-sm">
                  <CardHeader className="flex-row items-center gap-3 border-b border-border/60 pb-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Briefcase className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <CardTitle className="text-sm sm:text-base">Open roles</CardTitle>
                      <CardDescription>Internships and graduate roles in one feed</CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      Live
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-2">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                      <span className="text-xs font-medium text-foreground">Product design intern</span>
                      <span className="text-xs text-muted-foreground">On campus</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2.5">
                      <span className="text-xs font-medium text-foreground">Software engineer</span>
                      <span className="text-xs text-muted-foreground">Hybrid</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Card size="sm" className="border-border/80 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-chart-2/15 text-chart-2">
                        <FileText className="size-4" />
                      </div>
                      <CardTitle className="mt-2 text-sm">Applications</CardTitle>
                      <CardDescription className="text-xs">
                        Track status from submitted to decision
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card size="sm" className="border-border/80 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ShieldCheck className="size-4" />
                      </div>
                      <CardTitle className="mt-2 text-sm">Admin</CardTitle>
                      <CardDescription className="text-xs">
                        Oversight for users and platform health
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/60 bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Built for every role on campus
              </h2>
              <p className="mt-3 text-muted-foreground sm:text-base">
                Each experience is tailored—students browse and apply, companies publish and
                review, admins keep the ecosystem organized.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <GraduationCap className="size-5" />
                  </div>
                  <CardTitle className="pt-1 text-lg">Students</CardTitle>
                  <CardDescription>
                    Explore opportunities that match your path. Save time with a single
                    profile and a clear view of where each application stands.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex size-11 items-center justify-center rounded-xl bg-chart-2/15 text-chart-2">
                    <Building2 className="size-5" />
                  </div>
                  <CardTitle className="pt-1 text-lg">Companies</CardTitle>
                  <CardDescription>
                    Publish roles and reach talent on campus. Manage applicants in one pipeline
                    instead of scattered inboxes.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex size-11 items-center justify-center rounded-xl bg-muted-foreground/15 text-foreground">
                    <LayoutDashboard className="size-5" />
                  </div>
                  <CardTitle className="pt-1 text-lg">Admins</CardTitle>
                  <CardDescription>
                    Govern users and access with confidence. Role-based routing keeps each
                    cohort in the right workspace.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Lock, label: "Secure sessions", desc: "Signed-in experience with protected routes" },
              { icon: Users, label: "Role-based access", desc: "Student, company, and admin areas" },
              { icon: Upload, label: "Profile & assets", desc: "Structured data for hiring workflows" },
              { icon: Briefcase, label: "Jobs & applications", desc: "Post, apply, and track in one flow" },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex gap-3 rounded-xl border border-border/60 bg-card/50 p-4 ring-1 ring-foreground/5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 bg-primary/5 py-14 sm:py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center sm:px-6">
            <h2 className="font-heading max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Ready to streamline campus hiring?
            </h2>
            <p className="max-w-md text-sm text-muted-foreground sm:text-base">
              Join with your campus email flow—register to get a role-assigned workspace after
              sign-in.
            </p>
            <Button size="lg" className="h-10 px-6" asChild>
              <Link href="/register">
                Get started free
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© 2026 Campus Recruitment</p>
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
