"use client";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import * as React from "react";
import { z } from "zod";

const cardVariants = cva(
  "w-full rounded-xl border border-border bg-card text-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        subtle: "bg-muted/30",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export const jobSummaryCardSchema = z.object({
  title: z.string().describe("Job title"),
  company: z.string().describe("Company name"),
  location: z.string().optional().describe("Location or remote"),
  employmentType: z.string().optional().describe("Employment type"),
  salaryRange: z.string().optional().describe("Compensation range"),
  fitScore: z.number().min(0).max(100).describe("Fit score 0-100"),
  summary: z.string().optional().describe("Short summary of the role"),
  topSkills: z
    .array(z.string())
    .optional()
    .describe("Top skills required for the role"),
  responsibilities: z
    .array(z.string())
    .optional()
    .describe("Key responsibilities"),
  variant: z.enum(["default", "subtle"]).optional(),
  className: z.string().optional(),
});

export type JobSummaryCardProps = z.infer<typeof jobSummaryCardSchema>;

export function JobSummaryCard({
  title,
  company,
  location,
  employmentType,
  salaryRange,
  fitScore,
  summary,
  topSkills,
  responsibilities,
  variant,
  className,
}: JobSummaryCardProps) {
  return (
    <div className={cn(cardVariants({ variant }), className)}>
      <div className="p-6 space-y-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{company}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-muted-foreground">Fit Score</p>
              <p className="text-2xl font-semibold text-primary">{fitScore}%</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {location && (
              <span className="rounded-full bg-muted px-2 py-1">{location}</span>
            )}
            {employmentType && (
              <span className="rounded-full bg-muted px-2 py-1">
                {employmentType}
              </span>
            )}
            {salaryRange && (
              <span className="rounded-full bg-muted px-2 py-1">
                {salaryRange}
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, Math.max(0, fitScore))}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {summary ?? "Summary is being prepared based on the JD."}
          </p>
        </div>

        {topSkills && topSkills.length > 0 && (
          <div>
            <p className="text-sm font-medium">Top skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {topSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border px-2 py-1 text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {responsibilities && responsibilities.length > 0 && (
          <div>
            <p className="text-sm font-medium">Key responsibilities</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {responsibilities.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
