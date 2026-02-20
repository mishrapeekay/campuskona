import React from "react";
import { cn } from "@/ui/lib/utils";
import { Button } from "@/ui/primitives/button";
import { InboxIcon } from "lucide-react";

/**
 * Empty state placeholder with icon, message, and optional CTA.
 *
 * @param {React.ReactNode} icon - Custom icon (defaults to InboxIcon)
 * @param {string} title - Heading text
 * @param {string} description - Supporting text
 * @param {string} actionLabel - CTA button label
 * @param {function} onAction - CTA click handler
 * @param {string} className
 */
export default function EmptyState({
  icon,
  title = "No data found",
  description,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
        {icon
          ? (React.isValidElement(icon)
            ? icon
            : React.createElement(icon, { className: "h-8 w-8 text-muted-foreground" }))
          : <InboxIcon className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-md">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
