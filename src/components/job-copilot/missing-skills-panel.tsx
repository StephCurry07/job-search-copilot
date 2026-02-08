"use client";

import { cn } from "@/lib/utils";
import { z } from "zod";

export const missingSkillsPanelSchema = z.object({
  missingSkills: z.array(z.string()).default([]).describe("Missing skills"),
  suggestions: z
    .array(z.string())
    .optional()
    .default([])
    .describe("Suggested learning or actions"),
  notes: z.string().optional().describe("Additional notes"),
  className: z.string().optional(),
});

export type MissingSkillsPanelProps = z.infer<typeof missingSkillsPanelSchema>;

export function MissingSkillsPanel({
  missingSkills,
  suggestions,
  notes,
  className,
}: MissingSkillsPanelProps) {
  const skills = missingSkills || [];
  
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Missing skills</h3>
          <p className="text-sm text-muted-foreground">
            Focus on closing these gaps for a stronger fit.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-destructive/10 px-2 py-1 text-xs text-destructive"
            >
              {skill}
            </span>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">
            No critical gaps detected.
          </span>
        )}
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-medium">Suggestions</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {suggestions.map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {notes && (
        <div className="mt-4 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
          {notes}
        </div>
      )}
    </div>
  );
}
