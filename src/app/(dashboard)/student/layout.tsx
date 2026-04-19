import { StudentShell } from "@/components/dashboard/student-shell";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentShell>{children}</StudentShell>;
}
