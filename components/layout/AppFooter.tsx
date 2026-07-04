import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border px-8 py-6">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-text-muted">
          <span>© {new Date().getFullYear()} Resume Analyzer. All rights reserved.</span>
          <span className="hidden text-border sm:inline">|</span>
          <span className="hidden sm:inline">Trusted by job seekers everywhere</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/login"
            className="text-sm text-text-secondary transition-colors hover:text-accent-dark"
          >
            Privacy Policy
          </Link>
          <Link
            href="/login"
            className="text-sm text-text-secondary transition-colors hover:text-accent-dark"
          >
            Terms of Service
          </Link>
          <Link
            href="/login"
            className="text-sm text-text-secondary transition-colors hover:text-accent-dark"
          >
            Help Center
          </Link>
        </div>
      </div>
    </footer>
  );
}
