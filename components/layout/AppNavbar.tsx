"use client";

import { FileSearch, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Analyze", href: "/analyze" },
  { label: "History", href: "/history" },
] as const;

type AppNavbarProps = {
  userEmail?: string | null;
};

export function AppNavbar({ userEmail }: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-strong">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-accent-light">
            <FileSearch className="size-4 text-accent-dark" />
          </div>
          <span className="text-sm font-semibold text-text-primary">Resume Analyzer</span>
        </Link>

        <nav className="flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm font-medium transition-colors",
                  isActive
                    ? "text-accent after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:bg-accent"
                    : "text-text-dark hover:text-accent-dark",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {userEmail ? (
            <span className="hidden max-w-[140px] truncate text-xs text-text-muted sm:inline">
              {userEmail}
            </span>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="text-text-dark hover:text-text-primary"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
