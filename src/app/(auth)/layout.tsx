export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10 sm:py-14">
      {/* Soft gradient + glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-primary/[0.07] dark:from-background dark:via-muted/25 dark:to-primary/[0.12]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[min(70vw,28rem)] w-[min(70vw,28rem)] -translate-x-1/2 rounded-full bg-primary/[0.12] blur-3xl dark:bg-primary/[0.08]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 translate-x-1/4 translate-y-1/4 rounded-full bg-muted-foreground/[0.06] blur-3xl"
        aria-hidden
      />
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:32px_32px] dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-lg">{children}</div>
    </div>
  );
}
