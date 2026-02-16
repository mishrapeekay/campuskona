import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  MenuIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  LanguagesIcon, // Added icon
} from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { Button } from "@/ui/primitives/button";
import { Avatar, AvatarFallback } from "@/ui/primitives/avatar";
import { Separator } from "@/ui/primitives/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/ui/primitives/dropdown-menu";
import { CommandPaletteTrigger } from "@/ui/composites/CommandPalette";
import { Breadcrumbs } from "../../components/common";
import NotificationCenter from "../../components/layout/NotificationCenter";
import TenantSelector from "../../components/TenantSelector";
import { logout } from "../../store/slices/authSlice";
import { useTheme } from "../../contexts/ThemeContext";
import { SUPPORTED_LANGUAGES } from "../../i18n";

/**
 * Modern sticky header with command palette trigger, notifications, and user menu.
 *
 * @param {function} onMobileMenuOpen - Open mobile sidebar
 */
export default function Header({ onMobileMenuOpen }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMobileMenuOpen}
      >
        <MenuIcon className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Tenant Selector */}
      <div className="hidden lg:block">
        <TenantSelector />
      </div>

      {/* Breadcrumbs */}
      <div className="hidden md:block flex-1">
        <Breadcrumbs />
      </div>

      {/* Spacer for mobile */}
      <div className="flex-1 md:hidden" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Command Palette Trigger */}
        <CommandPaletteTrigger />

        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <LanguagesIcon className="h-4 w-4" />
              <span className="sr-only">Change language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('common.language', 'Language')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {SUPPORTED_LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={i18n.language === lang.code ? "bg-accent font-medium" : ""}
              >
                <span className="mr-2">{lang.native}</span>
                <span className="text-[10px] text-muted-foreground uppercase">{lang.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              {theme === "dark" ? (
                <MoonIcon className="h-4 w-4" />
              ) : theme === "light" ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MonitorIcon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <SunIcon className="mr-2 h-4 w-4" />
              {t('settings.light', 'Light')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <MoonIcon className="mr-2 h-4 w-4" />
              {t('settings.dark', 'Dark')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("auto")}>
              <MonitorIcon className="mr-2 h-4 w-4" />
              {t('settings.auto', 'System')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <NotificationCenter />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  {t('common.profile', 'Profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  {t('common.settings', 'Settings')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              {t('common.logout', 'Sign out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
