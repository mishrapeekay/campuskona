/**
 * Shadow elevation tokens
 *
 * Modern soft-depth shadows. Use shadow-black/5 for subtle dark-mode compatible shadows.
 * Tailwind classes: shadow-sm, shadow, shadow-md, shadow-lg, shadow-xl
 */

export const shadows = {
  none: "none",
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.03)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
  DEFAULT: "0 2px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
  md: "0 4px 8px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.15)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.04)",
};
