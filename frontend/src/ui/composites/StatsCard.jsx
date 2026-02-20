import React from "react";
import { motion } from "framer-motion";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { Card, CardContent } from "@/ui/primitives/card";
import { Skeleton } from "@/ui/primitives/skeleton";

/**
 * Modern stats card with animated count-up and trend indicator.
 *
 * @param {string} title - Metric label
 * @param {string|number} value - Current value
 * @param {string} description - Additional context
 * @param {'up'|'down'|'neutral'} trend - Trend direction
 * @param {string} trendValue - Trend percentage (e.g. "+12%")
 * @param {React.ReactNode} icon - Optional icon element
 * @param {boolean} loading - Show skeleton
 * @param {string} className - Additional classes
 */
export default function StatsCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon,
  loading = false,
  className,
  onClick,
}) {
  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-8 w-20" />
          <Skeleton className="mt-2 h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const trendColors = {
    up: "text-emerald-500",
    down: "text-rose-500",
    neutral: "text-muted-foreground",
  };

  const TrendIcon = trend === "up" ? ArrowUpIcon : trend === "down" ? ArrowDownIcon : MinusIcon;

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-lg cursor-default",
        onClick && "cursor-pointer hover:border-primary/20",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {React.isValidElement(icon) ? (
                icon
              ) : (
                React.createElement(icon, { className: "h-5 w-5" })
              )}
            </div>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <p className="mt-2 text-2xl font-bold tracking-tight">
            {typeof value === 'object' && value !== null && value.$$typeof ? value : String(value ?? '')}
          </p>
          {(description || trendValue) && (
            <div className="mt-2 flex items-center gap-2">
              {trendValue && (
                <span className={cn("flex items-center gap-0.5 font-medium", trendColors[trend])}>
                  <TrendIcon className="h-3 w-3" />
                  {typeof trendValue === 'object' && trendValue !== null && trendValue.$$typeof ? trendValue : String(trendValue ?? '')}
                </span>
              )}
              {description && (
                <span className="text-muted-foreground">{String(description ?? '')}</span>
              )}
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
