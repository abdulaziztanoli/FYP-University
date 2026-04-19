export function applicationStatusBadgeClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200 border-amber-300";
    case "reviewed":
      return "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200 border-blue-300";
    case "shortlisted":
      return "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200 border-purple-300";
    case "rejected":
      return "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200 border-red-300";
    case "accepted":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-300";
    default:
      return "";
  }
}

export function accountStatusBadgeClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200";
    case "active":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200";
    case "blocked":
      return "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200";
    default:
      return "";
  }
}

export function jobStatusBadgeClass(status: string) {
  switch (status) {
    case "open":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200";
    case "closed":
      return "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200";
    case "draft":
      return "bg-muted text-muted-foreground";
    default:
      return "";
  }
}
