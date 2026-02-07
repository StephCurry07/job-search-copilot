"use client";

import { cn } from "@/lib/utils";
import { z } from "zod";

const stageSchema = z.enum([
  "Interested",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
]);

export const applicationBoardSchema = z.object({
  columns: z.array(
    z.object({
      stage: stageSchema,
      items: z.array(
        z.object({
          id: z.number(),
          title: z.string(),
          company: z.string(),
          location: z.string().optional(),
          url: z.string().optional(),
          notes: z.string().optional(),
          updatedAt: z.string().optional(),
        }),
      ),
    }),
  ),
  lastUpdated: z.string().optional(),
  className: z.string().optional(),
});

export type ApplicationBoardProps = z.infer<typeof applicationBoardSchema>;

export function ApplicationBoard({
  columns,
  lastUpdated,
  className,
}: ApplicationBoardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Applications board</h3>
          <p className="text-sm text-muted-foreground">
            Track your pipeline across every stage.
          </p>
        </div>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground">{lastUpdated}</span>
        )}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-5">
        {columns.map((column) => (
          <div
            key={column.stage}
            className="rounded-lg border border-border/60 bg-muted/30 p-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{column.stage}</h4>
              <span className="text-xs text-muted-foreground">
                {column.items.length}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {column.items.length === 0 ? (
                <div className="rounded-md border border-dashed border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
                  No roles here yet.
                </div>
              ) : (
                column.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md border border-border bg-background p-3"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-foreground">
                        {item.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.company}
                        {item.location ? ` • ${item.location}` : ""}
                      </div>
                    </div>
                    {item.notes && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {item.notes}
                      </p>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs font-medium text-primary"
                      >
                        View posting
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
