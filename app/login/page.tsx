import Link from "next/link";

import { AuthForm } from "@/components/auth/AuthForm";
import { Navbar } from "@/components/layout/Navbar";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-8 py-16">
        <AuthForm callbackError={params.error} />
      </main>
      <footer className="border-t border-border px-8 py-6">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} Resume Analyzer. All rights reserved.
          </p>
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
              Contact Support
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
