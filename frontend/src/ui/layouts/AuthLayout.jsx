import { motion } from "framer-motion";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

/**
 * Auth layout — centered card with animated gradient background.
 * Used for Login, Register, Forgot Password, etc.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Animated gradient background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <AcademicCapIcon className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold">SchoolMS</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-card p-8 shadow-xl shadow-black/5">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          School Management System
        </p>
      </motion.div>
    </div>
  );
}
