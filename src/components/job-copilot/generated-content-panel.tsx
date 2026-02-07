"use client";

import { cn } from "@/lib/utils";
import { z } from "zod";

export const generatedContentPanelSchema = z.object({
  resumeBullets: z.array(z.string()).describe("Tailored resume bullets"),
  coverLetterParagraphs: z
    .array(z.string())
    .describe("Cover letter paragraphs"),
  talkingPoints: z.array(z.string()).describe("Interview talking points"),
  className: z.string().optional(),
});

export type GeneratedContentPanelProps = z.infer<
  typeof generatedContentPanelSchema
>;

export function GeneratedContentPanel({
  resumeBullets,
  coverLetterParagraphs,
  talkingPoints,
  className,
}: GeneratedContentPanelProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <h3 className="text-lg font-semibold">Tailored content</h3>
      <p className="text-sm text-muted-foreground">
        Use these drafts to update your resume, cover letter, and interview prep.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <section className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <h4 className="text-sm font-semibold">Resume bullets</h4>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            {resumeBullets.map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <h4 className="text-sm font-semibold">Cover letter</h4>
          <div className="mt-2 space-y-2 text-sm text-muted-foreground">
            {coverLetterParagraphs.map((item, index) => (
              <p key={`${item}-${index}`}>{item}</p>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <h4 className="text-sm font-semibold">Interview talking points</h4>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            {talkingPoints.map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
