import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Unauthorized</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        You do not have access to this area. Sign in with the correct role or return home.
      </p>
      <Button asChild>
        <Link href="/login">Go to login</Link>
      </Button>
    </div>
  );
}
