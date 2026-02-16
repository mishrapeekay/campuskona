/**
 * Border radius tokens
 *
 * Primary radius controlled by --radius CSS variable (0.75rem = 12px).
 * Tailwind classes: rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl
 */

export const radius = {
  none: "0px",
  sm: "calc(var(--radius) - 4px)",   // 8px
  md: "calc(var(--radius) - 2px)",   // 10px
  DEFAULT: "var(--radius)",           // 12px
  lg: "var(--radius)",                // 12px
  xl: "calc(var(--radius) + 4px)",   // 16px
  "2xl": "calc(var(--radius) + 8px)", // 20px
  full: "9999px",
};
