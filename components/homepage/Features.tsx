"use client";

import { FileText, Search, Sparkles, Target } from "lucide-react";
import Link from "next/link";

import { FadeIn } from "@/components/motion/FadeIn";
import { HoverLift } from "@/components/motion/HoverLift";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

const features = [
  {
    icon: Target,
    title: "Match Score",
    description:
      "Get a 0-100 compatibility score based on your resume and the specific job description.",
  },
  {
    icon: Search,
    title: "Skills Gap Analysis",
    description:
      "Identify missing hard and soft skills required by the employer before you apply.",
  },
  {
    icon: FileText,
    title: "ATS Keywords",
    description:
      "Extract critical industry keywords to ensure your resume passes automated filters.",
  },
  {
    icon: Sparkles,
    title: "One-Click Resume",
    description:
      "Regenerate bullet points and sections tailored specifically for the job you're targeting.",
  },
] as const;

export function Features() {
  return (
    <section id="features" className="relative bg-background px-8 py-16 md:py-24">
      <div className="mx-auto max-w-[1440px]">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-2xl font-semibold text-text-primary md:text-3xl">
            Professional tools for modern job seekers
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-text-secondary">
            Everything you need to understand your fit and improve your resume for each role.
          </p>
        </FadeIn>

        <Stagger className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <HoverLift className="h-full">
                <div className="glass group h-full rounded-2xl p-6 shadow-card transition-shadow hover:shadow-card-hover">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-accent-light transition-colors group-hover:bg-accent">
                    <feature.icon className="size-5 text-accent-dark transition-colors group-hover:text-accent-foreground" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="mb-4 text-sm font-medium text-text-secondary">
                    {feature.description}
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center text-sm font-medium text-accent transition-all hover:translate-x-0.5 hover:text-accent-dark"
                  >
                    Learn more →
                  </Link>
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
