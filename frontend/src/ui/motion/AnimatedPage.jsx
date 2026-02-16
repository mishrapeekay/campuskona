import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

const pageTransition = {
  duration: 0.2,
  ease: "easeOut",
};

/**
 * Wraps page content with a subtle fade-in entrance animation.
 * Use at the top level of each page component.
 *
 * Usage:
 *   <AnimatedPage>
 *     <YourPageContent />
 *   </AnimatedPage>
 */
export default function AnimatedPage({ children, className }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
