/**
 * Typography tokens
 *
 * Font: Inter (already loaded via Google Fonts in index.css)
 * Scale follows the target spec: Page Title 28-32px, Section 18-20px, Body 14-15px, Meta 12px
 */

export const fontFamily = {
  sans: [
    "Inter",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ].join(", "),
  mono: [
    "JetBrains Mono",
    "Fira Code",
    "ui-monospace",
    "SFMono-Regular",
    "monospace",
  ].join(", "),
};

export const fontSize = {
  xs: ["0.75rem", { lineHeight: "1rem" }],       // 12px — meta, captions
  sm: ["0.8125rem", { lineHeight: "1.25rem" }],   // 13px — compact body
  base: ["0.875rem", { lineHeight: "1.375rem" }], // 14px — body text
  lg: ["1rem", { lineHeight: "1.5rem" }],          // 16px — large body
  xl: ["1.125rem", { lineHeight: "1.75rem" }],     // 18px — section title
  "2xl": ["1.25rem", { lineHeight: "1.75rem" }],   // 20px — section title
  "3xl": ["1.5rem", { lineHeight: "2rem" }],       // 24px — page subtitle
  "4xl": ["1.75rem", { lineHeight: "2.25rem" }],   // 28px — page title
  "5xl": ["2rem", { lineHeight: "2.5rem" }],       // 32px — hero title
};

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

/** Pre-composed typography styles for direct use */
export const typography = {
  h1: { fontSize: "2rem", fontWeight: "600", lineHeight: "2.5rem", letterSpacing: "-0.025em" },
  h2: { fontSize: "1.5rem", fontWeight: "600", lineHeight: "2rem", letterSpacing: "-0.02em" },
  h3: { fontSize: "1.25rem", fontWeight: "600", lineHeight: "1.75rem" },
  h4: { fontSize: "1.125rem", fontWeight: "500", lineHeight: "1.75rem" },
  bodyLarge: { fontSize: "1rem", fontWeight: "400", lineHeight: "1.5rem" },
  body: { fontSize: "0.875rem", fontWeight: "400", lineHeight: "1.375rem" },
  bodySmall: { fontSize: "0.8125rem", fontWeight: "400", lineHeight: "1.25rem" },
  label: { fontSize: "0.875rem", fontWeight: "500", lineHeight: "1.25rem" },
  caption: { fontSize: "0.75rem", fontWeight: "400", lineHeight: "1rem" },
};
