/**
 * Framer Motion animation presets
 *
 * Usage:
 *   import { fadeIn } from '@/ui/motion/transitions';
 *   <motion.div {...fadeIn}>content</motion.div>
 */

/** Subtle fade-in with slight upward shift — default page/card entrance */
export const fadeIn = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: "easeOut" },
};

/** Fade + scale — modals, dialogs, popovers */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2, ease: "easeOut" },
};

/** Slide from right — sidesheets, slide-over panels */
export const slideInRight = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: { type: "spring", damping: 25, stiffness: 300 },
};

/** Slide from left — sidebar expand */
export const slideInLeft = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
  transition: { type: "spring", damping: 25, stiffness: 300 },
};

/** Slide down — dropdown menus, accordions */
export const slideDown = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.15, ease: "easeOut" },
};

/** Stagger children — list items, grid cards */
export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.05 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

/** Reduced motion variant — respects prefers-reduced-motion */
export const reducedMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.01 },
};

/** Spring presets for interactive elements */
export const spring = {
  gentle: { type: "spring", damping: 20, stiffness: 200 },
  snappy: { type: "spring", damping: 25, stiffness: 400 },
  bouncy: { type: "spring", damping: 15, stiffness: 300 },
};

/** Button tap scale */
export const tapScale = {
  whileTap: { scale: 0.98 },
  transition: { type: "spring", damping: 20, stiffness: 400 },
};
