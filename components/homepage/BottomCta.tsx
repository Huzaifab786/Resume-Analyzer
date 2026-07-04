"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";
import { duration, easeOut, hoverScale } from "@/lib/motion";

export function BottomCta() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-8 py-16">
      <div className="mx-auto max-w-[1440px]">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl bg-text-darkest px-8 py-12 md:px-16 md:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-accent/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -right-20 size-64 rounded-full bg-info/15 blur-3xl"
            />

            <div className="glass-dark relative rounded-2xl px-8 py-12 text-center md:px-16 md:py-16">
              <h2 className="text-2xl font-semibold text-surface md:text-3xl">
                Ready to land your next interview?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-text-muted">
                Join job seekers who use AI-powered analysis to understand their fit and tailor
                their resume for every application.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
                    className="glass-subtle h-11 border-border-muted px-6 text-surface hover:bg-surface/10"
                  >
                    See how it works
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
