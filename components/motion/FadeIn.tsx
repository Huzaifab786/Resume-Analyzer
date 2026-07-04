"use client";

import { motion, useReducedMotion } from "framer-motion";

import { duration, easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "none";
};

export function FadeIn({
  children,
  delay = 0,
  className,
  direction = "up",
}: FadeInProps) {
  const reduceMotion = useReducedMotion();

  const offset =
    direction === "up" ? 16 : direction === "down" ? -16 : 0;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: duration.normal, delay, ease: easeOut }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
