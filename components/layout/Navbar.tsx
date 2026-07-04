"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FileSearch } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { duration, easeOut, hoverScale } from "@/lib/motion";

const sectionLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it Works", href: "/#how-it-works" },
] as const;

export function Navbar() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      initial={reduceMotion ? false : { y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: duration.normal, ease: easeOut }}
      className="sticky top-0 z-50 w-full glass-strong"
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-accent-light">
            <FileSearch className="size-4 text-accent-dark" />
          </div>
          <span className="text-sm font-semibold text-text-primary">Resume Analyzer</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {sectionLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-text-dark transition-colors hover:text-accent-dark after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-accent-dark after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden text-sm font-medium text-text-dark transition-colors hover:text-accent-dark sm:inline"
          >
            Sign in
          </Link>
          <motion.div
            whileHover={reduceMotion ? undefined : hoverScale}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: duration.fast, ease: easeOut }}
          >
            <Button
              nativeButton={false}
              render={<Link href="/login" />}
              variant="brand"
              className="h-9 px-4"
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
