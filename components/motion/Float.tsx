"use client";

import { motion, useReducedMotion } from "framer-motion";

import { floatAnimation, floatTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

type FloatProps = {
  children: React.ReactNode;
  className?: string;
};

export function Float({ children, className }: FloatProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={reduceMotion ? undefined : floatAnimation}
      transition={reduceMotion ? undefined : floatTransition}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
