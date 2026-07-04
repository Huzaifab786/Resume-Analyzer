import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function BoostScoreCta() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-accent p-6 text-accent-foreground shadow-card">
      <div className="relative z-10">
        <h2 className="text-lg font-semibold">Boost Your Score</h2>
        <p className="mt-2 text-sm text-accent-foreground/90">
          Our AI analyzed your recent activity. Tailoring your professional
          summary could increase your average score by up to 15%.
        </p>
        <Button
          nativeButton={false}
          render={<Link href="/analyze" />}
          variant="secondary"
          className="mt-5 h-10 bg-surface text-text-primary hover:bg-surface-secondary"
        >
          Improve Resume
        </Button>
      </div>
      <Sparkles
        className="pointer-events-none absolute -right-2 -bottom-2 size-24 text-accent-foreground/15"
        aria-hidden
      />
    </section>
  );
}
