import { useState, useEffect, createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { cn } from "@/ui/lib/utils";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { CommandPalette } from "@/ui/composites";

/**
 * Density context for role-aware spacing.
 * Admin → compact, Student → comfortable, default for everyone else.
 */
const DensityContext = createContext("default");
export const useDensity = () => useContext(DensityContext);

const densityMap = {
  SCHOOL_ADMIN: "compact",
  SUPER_ADMIN: "compact",
  PRINCIPAL: "compact",
  ACCOUNTANT: "compact",
  STUDENT: "comfortable",
  TEACHER: "default",
  PARENT: "default",
  PARTNER: "default",
  LIBRARIAN: "default",
  TRANSPORT_MANAGER: "default",
};

const densityStyles = {
  compact: "gap-3 p-4 text-[13px]",
  default: "gap-4 p-6 text-sm",
  comfortable: "gap-5 p-6 text-[15px]",
};

/**
 * Main dashboard layout — orchestrates Sidebar + Header + Content.
 * Replaces the old MainLayout.jsx.
 */
export default function DashboardLayout() {
  const { user } = useSelector((state) => state.auth);
  const density = densityMap[user?.user_type] || "default";

  // Sidebar collapse state (desktop)
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });

  // Mobile sidebar open state
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <DensityContext.Provider value={density}>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Main content area */}
        <div
          className={cn(
            "flex flex-col min-h-screen transition-[margin-left] duration-300 ease-out",
            collapsed ? "lg:ml-16" : "lg:ml-64"
          )}
        >
          {/* Header */}
          <Header onMobileMenuOpen={() => setMobileOpen(true)} />

          {/* Page Content */}
          <main
            className={cn(
              "flex-1",
              densityStyles[density]
            )}
          >
            <Outlet />
          </main>
        </div>

        {/* Global Command Palette */}
        <CommandPalette />
      </div>
    </DensityContext.Provider>
  );
}
