import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/ui/primitives/command";
import {
  HomeIcon,
  UsersIcon,
  ClipboardListIcon,
  BookOpenIcon,
  CalendarIcon,
  SettingsIcon,
  FileTextIcon,
  GraduationCapIcon,
  SearchIcon,
  WalletIcon,
} from "lucide-react";

const navigationItems = [
  { label: "Dashboard", icon: HomeIcon, path: "/dashboard", shortcut: "D" },
  { label: "Students", icon: UsersIcon, path: "/students", shortcut: "S" },
  { label: "Attendance", icon: ClipboardListIcon, path: "/attendance" },
  { label: "Assignments", icon: BookOpenIcon, path: "/assignments" },
  { label: "Timetable", icon: CalendarIcon, path: "/timetable" },
  { label: "Examinations", icon: GraduationCapIcon, path: "/examinations" },
  { label: "Finance", icon: WalletIcon, path: "/finance" },
  { label: "Reports", icon: FileTextIcon, path: "/reports" },
  { label: "Settings", icon: SettingsIcon, path: "/settings" },
];

/**
 * Command palette (Ctrl+K / Cmd+K) for quick navigation and search.
 * Wire into DashboardLayout as a global component.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSelect = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, students, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.path}
              onSelect={() => handleSelect(item.path)}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => handleSelect("/students/new")} className="cursor-pointer">
            <UsersIcon className="mr-2 h-4 w-4" />
            <span>Add New Student</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/attendance/mark")} className="cursor-pointer">
            <ClipboardListIcon className="mr-2 h-4 w-4" />
            <span>Mark Attendance</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/assignments/create")} className="cursor-pointer">
            <BookOpenIcon className="mr-2 h-4 w-4" />
            <span>Create Assignment</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/** Trigger button for the command palette — use in Header */
export function CommandPaletteTrigger({ className }) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground ${className || ""}`}
      onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
    >
      <SearchIcon className="h-4 w-4" />
      <span className="hidden md:inline">Search...</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:inline-flex">
        <span className="text-xs">Ctrl</span>K
      </kbd>
    </button>
  );
}
