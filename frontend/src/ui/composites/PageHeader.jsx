import { Link } from "react-router-dom";
import { cn } from "@/ui/lib/utils";
import { Separator } from "@/ui/primitives/separator";

/**
 * Page header with title, description, breadcrumbs, and actions.
 *
 * @param {string} title - Page title
 * @param {string} description - Optional subtitle/description
 * @param {React.ReactNode} actions - Action buttons (right side)
 * @param {React.ReactNode} breadcrumbs - Breadcrumb navigation
 * @param {boolean} sticky - Stick to top on scroll
 * @param {string} className
 */
export default function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  action, // Support singular for convenience
  sticky = false,
  className,
}) {
  const displayActions = actions || action;

  return (
    <div
      className={cn(
        "space-y-1 pb-4",
        sticky && "sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4",
        className
      )}
    >
      {breadcrumbs && (
        <div className="mb-2 flex items-center text-sm text-muted-foreground">
          {Array.isArray(breadcrumbs) ? (
            breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 opacity-50">/</span>}
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={crumb.active ? "text-foreground font-medium" : ""}>
                    {crumb.label}
                  </span>
                )}
              </div>
            ))
          ) : (
            breadcrumbs
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {displayActions && (
          <div className="flex items-center gap-2 shrink-0">{displayActions}</div>
        )}
      </div>
      <Separator className="mt-4" />
    </div>
  );
}

