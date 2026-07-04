"use client";

import { BarChart3, Download, FileText, Upload } from "lucide-react";

import { FadeIn } from "@/components/motion/FadeIn";
import { HoverLift } from "@/components/motion/HoverLift";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

const steps = [
  {
    number: 1,
    icon: Upload,
    title: "Upload Resume",
    description: "Drag and drop your current PDF resume to get started.",
  },
  {
    number: 2,
    icon: FileText,
    title: "Paste Job Description",
    description: "Enter the description of the role you're targeting today.",
  },
  {
    number: 3,
    icon: BarChart3,
    title: "Get Match Report",
    description: "See exactly where you stand with detailed AI analysis.",
  },
  {
    number: 4,
    icon: Download,
    title: "Download Resume",
    description: "Get your optimized PDF, perfectly tailored for the ATS.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-surface-secondary px-8 py-16 md:py-24">
      <div className="mx-auto max-w-[1440px]">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-2xl font-semibold text-text-primary md:text-3xl">
            A 4-step workflow to land your dream job
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-text-secondary">
            From upload to tailored resume in minutes — no guesswork, just clear next steps.
          </p>
        </FadeIn>

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <StaggerItem key={step.number}>
              <HoverLift className="h-full">
                <div className="glass group h-full rounded-2xl p-6 shadow-card transition-shadow hover:shadow-card-hover">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-accent-light transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <step.icon className="size-5 text-accent-dark transition-colors group-hover:text-accent-foreground" />
                  </div>
                  <p className="mb-1 text-xs font-medium text-accent">Step {step.number}</p>
                  <h3 className="mb-2 text-base font-semibold text-text-primary">{step.title}</h3>
                  <p className="text-sm font-medium text-text-secondary">{step.description}</p>
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
