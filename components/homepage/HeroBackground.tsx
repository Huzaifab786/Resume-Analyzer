"use client";

export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-0 size-96 rounded-full bg-accent-muted/40 blur-3xl" />
      <div className="absolute -right-24 top-1/4 size-80 rounded-full bg-accent-light/60 blur-3xl dark:bg-accent-muted/30" />
      <div className="absolute bottom-0 left-1/3 size-64 rounded-full bg-info-lightest/50 blur-3xl dark:bg-info-light/20" />
    </div>
  );
}
