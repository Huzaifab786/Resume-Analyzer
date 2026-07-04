"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Float } from "@/components/motion/Float";
import { Badge } from "@/components/ui/badge";
import { duration, easeOut } from "@/lib/motion";

const skills = [
  { label: "React", matched: true },
  { label: "TypeScript", matched: true },
  { label: "Node.js", matched: true },
  { label: "GraphQL", matched: false },
  { label: "AWS", matched: false },
] as const;

type AnimatedBarProps = {
  width: string;
  colorClass: string;
  delay?: number;
};

function AnimatedBar({ width, colorClass, delay = 0 }: AnimatedBarProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface-tertiary">
      <motion.div
        initial={reduceMotion ? false : { width: 0 }}
        whileInView={{ width }}
        viewport={{ once: true }}
        transition={{ duration: duration.slow, delay, ease: easeOut }}
        className={`h-full rounded-full ${colorClass}`}
      />
    </div>
  );
}

export function HeroPreview() {
  return (
    <Float className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div className="glass overflow-hidden rounded-2xl shadow-card">
        <div className="glass-subtle border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-error" />
            <div className="size-2.5 rounded-full bg-warning" />
            <div className="size-2.5 rounded-full bg-success" />
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted">Match Score</p>
              <p className="text-3xl font-bold text-success">85%</p>
            </div>
            <div className="flex size-20 items-center justify-center rounded-full border-4 border-success bg-success-lightest">
              <span className="text-lg font-bold text-success-foreground">85</span>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-text-primary">Skills Analysis</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill.label}
                  className={
                    skill.matched
                      ? "border-transparent bg-success-lightest text-success-foreground"
                      : "border-transparent bg-warning-light text-warning-foreground"
                  }
                >
                  {skill.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Experience Match</span>
              <span className="font-medium text-text-primary">92%</span>
            </div>
            <AnimatedBar width="92%" colorClass="bg-accent" delay={0.2} />
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">ATS Keywords</span>
              <span className="font-medium text-text-primary">78%</span>
            </div>
            <AnimatedBar width="78%" colorClass="bg-info" delay={0.4} />
          </div>
        </div>
      </div>
    </Float>
  );
}
