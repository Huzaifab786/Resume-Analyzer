"use client";

import { motion, useReducedMotion } from "framer-motion";

import { duration, easeOut, hoverLift } from "@/lib/motion";
import { cn } from "@/lib/utils";

type HoverLiftProps = {
  children: React.ReactNode;
  className?: string;
};

export function HoverLift({ children, className }: HoverLiftProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : hoverLift}
      transition={{ duration: duration.fast, ease: easeOut }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
