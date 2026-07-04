"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";

import { HeroBackground } from "@/components/homepage/HeroBackground";
import { HeroPreview } from "@/components/homepage/HeroPreview";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";
import { duration, easeOut, hoverScale } from "@/lib/motion";

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-background px-8 py-16 md:py-24">
      <HeroBackground />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          <FadeIn delay={0.1}>
            <div className="glass-subtle inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5">
              <Sparkles className="size-3.5 text-accent-dark" />
              <span className="text-xs font-medium text-text-secondary">
                AI Resume Intelligence
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl lg:text-[48px]">
              Know your fit{" "}
              <span className="text-accent-dark">before</span> you apply
            </h1>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="max-w-lg text-base font-medium leading-relaxed text-text-secondary">
              Get instant AI resume analysis, match scores, and a tailored PDF resume to beat the
              ATS in seconds. Stop guessing and start landing interviews.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="flex flex-wrap items-center gap-3">
              <motion.div
                whileHover={reduceMotion ? undefined : hoverScale}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: duration.fast, ease: easeOut }}
              >
                <Button
                  nativeButton={false}
                  render={<Link href="/login" />}
                  variant="brand"
                  size="lg"
                  className="h-11 px-6"
                >
                  Analyze My Resume
                </Button>
              </motion.div>
              <motion.div
                whileHover={reduceMotion ? undefined : hoverScale}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: duration.fast, ease: easeOut }}
              >
                <Button
                  nativeButton={false}
                  render={<Link href="#how-it-works" />}
                  variant="outline"
                  size="lg"
                  className="glass h-11 border-border px-6 text-text-primary hover:bg-surface-secondary/80"
                >
                  See how it works
                </Button>
              </motion.div>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.5}>
          <HeroPreview />
        </FadeIn>
      </div>
    </section>
  );
}
