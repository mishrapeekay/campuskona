import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  LogOutIcon,
} from "lucide-react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { cn } from "@/ui/lib/utils";
import { Avatar, AvatarFallback } from "@/ui/primitives/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/ui/primitives/tooltip";
import { ScrollArea } from "@/ui/primitives/scroll-area";
import { Separator } from "@/ui/primitives/separator";
import { getFilteredNavigation } from "@/ui/config/navigation";
import { logout } from "../../store/slices/authSlice";

/**
 * Modern collapsible sidebar with config-driven navigation.
 *
 * @param {boolean} collapsed - Whether sidebar is in icon-only mode
 * @param {function} onToggleCollapse - Toggle collapsed state
 * @param {boolean} mobileOpen - Whether sidebar is open on mobile
 * @param {function} onMobileClose - Close sidebar on mobile
 */
export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, tenantFeatures } = useSelector((state) => state.auth);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Translation helper
  const translateNav = (name) => {
    // Map names to keys or use default
    const keyMap = {
      // Sections
      'Overview': 'nav.section_overview',
      'Academics': 'nav.section_academics',
      'Management': 'nav.section_management',
      'Student Portal': 'nav.section_student_portal',
      'Parent Portal': 'nav.section_parent_portal',
      'Partner Portal': 'nav.section_partner_portal',
      'Reports & Compliance': 'nav.section_reports_compliance',
      'Super Admin': 'nav.section_super_admin',
      'System': 'nav.section_system',

      // Items
      'Dashboard': 'nav.dashboard',
      'Students': 'nav.students',
      'Staff': 'nav.staff',
      'Attendance': 'nav.attendance',
      'Timetable': 'nav.timetable',
      'Assignments': 'nav.assignments',
      'Examinations': 'nav.examinations',
      'Finance': 'nav.finance',
      'Communication': 'nav.communication',
      'Transport': 'nav.transport',
      'Library': 'nav.library',
      'Admissions': 'nav.admissions',
      'Hostel': 'nav.hostel',
      'HR & Payroll': 'nav.hrPayroll',
      'Reports': 'nav.reports',
      'DPDP Compliance': 'nav.compliance',
      'Approvals': 'nav.approvals',
      'Settings': 'nav.settings',
      'My Profile': 'common.profile',
      'My Grades': 'nav.nav_grades',
      'Achievements': 'nav.achievements',
      'My Fees': 'nav.nav_fees',
      'Notices': 'nav.notices',
      'Academic Years': 'nav.academic_years',
      'Classes': 'nav.classes',
      'Subjects': 'nav.subjects',
      'Lesson Plans': 'nav.lesson_plans',
      'Syllabus Coverage': 'nav.syllabus',
      'Mark Attendance': 'nav.mark_attendance',
      'Leave Management': 'nav.leave_mgmt',
      'View Timetable': 'nav.view_timetable',
      'Manage Timetable': 'nav.manage_timetable',
      'AI Generator': 'nav.ai_generator',
      'All Assignments': 'nav.all_assignments',
      'Create Assignment': 'nav.create_assignment',
      'Mark Entry': 'nav.mark_entry',
      'Results': 'nav.results',
      'Fee Collection': 'nav.fee_collection',
      'Fee Categories': 'nav.fee_categories',
      'Fee Structures': 'nav.fee_structures',
      'Expenses': 'nav.expenses',
      'Notice Board': 'nav.notices',
      'Events': 'nav.events',
      'Route Management': 'nav.routes',
      'Allocation': 'nav.allocation',
      'Book Catalog': 'nav.catalog',
      'Issue & Return': 'nav.issue_return',
      'Applications': 'nav.applications',
      'Enquiries': 'nav.enquiries',
      'Onboarding Verifications': 'nav.onboarding',
      'Rooms': 'nav.rooms',
      'Allocations': 'nav.allocations',
      'Departments': 'nav.departments',
      'Payroll': 'nav.payroll',
      'Build Report': 'nav.build_report',
      'Generated': 'nav.generated_reports',
      'Compliance Hub': 'nav.compliance_hub',
      'Audit Logs': 'nav.audit_logs',
      'Fee Ledger': 'nav.fee_ledger',
      'Pay Online': 'nav.pay_online',
      'Consent Management': 'nav.consent_mgmt',
      'Data Rights': 'nav.data_rights',
      'Onboarding Review': 'nav.onboarding_review',
      'Grievances': 'nav.grievances',
      'School Health Score': 'nav.analytics',
      'Investor Dashboard': 'nav.investor_dashboard',
      'Growth Metrics': 'nav.growth',
      'Tenants': 'nav.tenants',
      'Analytics': 'nav.analytics',
      'Fees & Payments': 'nav.finance',
      'Report Cards': 'nav.examinations',
      'Privacy & Consent': 'nav.compliance',
    };
    return t(keyMap[name] || name, name);
  };

  const navigation = useMemo(
    () => getFilteredNavigation(user?.user_type, tenantFeatures),
    [user?.user_type, tenantFeatures]
  );

  const isActive = (path) => location.pathname.startsWith(path);

  const toggleMenu = (name) => {
    setExpandedMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2" onClick={onMobileClose}>
          <AcademicCapIcon className="h-8 w-8 text-primary shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold whitespace-nowrap overflow-hidden text-sidebar-foreground"
              >
                SchoolMS
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navigation.map((section) => (
            <div key={section.section}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-section-label">
                  {translateNav(section.section)}
                </p>
              )}
              {collapsed && <Separator className="mb-2 bg-sidebar-border" />}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.name}
                    item={item}
                    collapsed={collapsed}
                    isActive={isActive}
                    expanded={
                      expandedMenus[item.name] !== undefined
                        ? expandedMenus[item.name]
                        : isActive(item.href)
                    }
                    onToggle={() => toggleMenu(item.name)}
                    onNavigate={onMobileClose}
                    pathname={location.pathname}
                    translateNav={translateNav}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse Toggle (desktop only) */}
      <div className="hidden lg:block border-t border-sidebar-border p-2">
        <button
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-hover-bg transition-colors"
        >
          {collapsed ? (
            <ChevronsRightIcon className="h-4 w-4" />
          ) : (
            <ChevronsLeftIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* User Info */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-medium truncate text-sidebar-foreground">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-sidebar-muted truncate">
                  {user?.user_type?.replace(/_/g, " ")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-lg p-1.5 text-sidebar-muted hover:text-destructive hover:bg-sidebar-hover-bg transition-colors"
              title="Sign out"
            >
              <LogOutIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}

function SidebarItem({
  item,
  collapsed,
  isActive,
  expanded,
  onToggle,
  onNavigate,
  pathname,
  translateNav,
}) {
  const Icon = item.icon;
  const active = isActive(item.href);
  const hasSubItems = item.subItems && item.subItems.length > 0;

  const linkContent = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-sidebar-active-bg text-sidebar-active-text font-medium border-l-2 border-primary ml-0"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-hover-bg",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", active ? "text-primary" : "text-sidebar-muted")} />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex-1 truncate whitespace-nowrap overflow-hidden"
          >
            {translateNav(item.name)}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && hasSubItems && (
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            expanded && "rotate-180"
          )}
        />
      )}
    </div>
  );

  const wrappedContent = collapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>
        {hasSubItems ? (
          <button onClick={onToggle} className="w-full">
            {linkContent}
          </button>
        ) : (
          <Link to={item.href} onClick={onNavigate}>
            {linkContent}
          </Link>
        )}
      </TooltipTrigger>
      <TooltipContent side="right" className="font-medium">
        {translateNav(item.name)}
      </TooltipContent>
    </Tooltip>
  ) : hasSubItems ? (
    <button onClick={onToggle} className="w-full">
      {linkContent}
    </button>
  ) : (
    <Link to={item.href} onClick={onNavigate}>
      {linkContent}
    </Link>
  );

  return (
    <div>
      {wrappedContent}
      {/* Sub-items */}
      <AnimatePresence>
        {!collapsed && expanded && hasSubItems && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="ml-8 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
              {item.subItems.map((sub) => (
                <Link
                  key={sub.href}
                  to={sub.href}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-sm transition-colors",
                    pathname === sub.href
                      ? "text-sidebar-active-text font-medium bg-sidebar-active-bg"
                      : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-hover-bg"
                  )}
                >
                  {translateNav(sub.name)}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
