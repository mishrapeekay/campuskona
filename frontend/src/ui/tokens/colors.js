/**
 * Color tokens — CSS variable references
 *
 * All colors resolve via CSS custom properties defined in index.css.
 * This allows light/dark mode switching without JS.
 *
 * Usage: className="bg-primary text-primary-foreground"
 * Or via JS: colors.primary → "hsl(var(--primary))"
 */

export const colors = {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",

  card: "hsl(var(--card))",
  cardForeground: "hsl(var(--card-foreground))",

  popover: "hsl(var(--popover))",
  popoverForeground: "hsl(var(--popover-foreground))",

  primary: "hsl(var(--primary))",
  primaryForeground: "hsl(var(--primary-foreground))",

  secondary: "hsl(var(--secondary))",
  secondaryForeground: "hsl(var(--secondary-foreground))",

  muted: "hsl(var(--muted))",
  mutedForeground: "hsl(var(--muted-foreground))",

  accent: "hsl(var(--accent))",
  accentForeground: "hsl(var(--accent-foreground))",

  destructive: "hsl(var(--destructive))",
  destructiveForeground: "hsl(var(--destructive-foreground))",

  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",

  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
};

/** Role-specific accent colors (always the same in light/dark) */
export const roleColors = {
  admin: "#7C3AED",
  teacher: "#2563EB",
  student: "#10B981",
  parent: "#F59E0B",
  accountant: "#6366F1",
  librarian: "#EC4899",
  transport: "#14B8A6",
  principal: "#4F46E5",
  superAdmin: "#DC2626",
};
