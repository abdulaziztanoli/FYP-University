import { CompanyShell } from "@/components/dashboard/company-shell";

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CompanyShell>{children}</CompanyShell>;
}
