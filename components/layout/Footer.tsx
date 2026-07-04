"use client";

import Link from "next/link";

import { FadeIn } from "@/components/motion/FadeIn";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Analyze", href: "/login" },
  ],
  resources: [
    { label: "Help Center", href: "/login" },
    { label: "Resume Guide", href: "/login" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/login" },
    { label: "Terms of Service", href: "/login" },
  ],
  connect: [
    { label: "LinkedIn", href: "/login" },
    { label: "Twitter", href: "/login" },
  ],
} as const;

type FooterColumnProps = {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
};

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-text-primary">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-text-secondary transition-colors hover:text-accent-dark"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="glass-strong border-t border-border">
      <div className="mx-auto max-w-[1440px] px-8 py-12">
        <FadeIn>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FooterColumn title="Product" links={footerLinks.product} />
            <FooterColumn title="Resources" links={footerLinks.resources} />
            <FooterColumn title="Legal" links={footerLinks.legal} />
            <FooterColumn title="Connect" links={footerLinks.connect} />
          </div>
        </FadeIn>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} Resume Analyzer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
