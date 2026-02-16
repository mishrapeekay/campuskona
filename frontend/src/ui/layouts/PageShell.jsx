import AnimatedPage from "@/ui/motion/AnimatedPage";
import { cn } from "@/ui/lib/utils";

/**
 * Inner page wrapper — provides animated entrance and consistent padding.
 * Use inside DashboardLayout for each page.
 *
 * Usage:
 *   <PageShell>
 *     <PageHeader title="Students" />
 *     <YourContent />
 *   </PageShell>
 */
export default function PageShell({ children, className }) {
  return (
    <AnimatedPage className={cn("space-y-6", className)}>
      {children}
    </AnimatedPage>
  );
}
