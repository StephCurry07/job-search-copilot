"use client";

import { cn } from "@/lib/utils";
import { z } from "zod";

export const profileCardSchema = z.object({
  profile: z.object({
    full_name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin_url: z.string().optional(),
    portfolio_url: z.string().optional(),
    years_of_experience: z.number().optional(),
    current_title: z.string().optional(),
    bio: z.string().optional(),
    skills: z.array(z.string()),
  }).describe("User profile data"),
  resumes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    is_primary: z.boolean(),
    skills: z.array(z.string()),
    experience_years: z.number().optional(),
  })).optional().describe("User's resumes"),
  className: z.string().optional(),
});

export type ProfileCardProps = z.infer<typeof profileCardSchema>;

export function ProfileCard({ profile, resumes, className }: ProfileCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">{profile.full_name || "Your Profile"}</h3>
          {profile.current_title && (
            <p className="text-sm text-muted-foreground mt-1">{profile.current_title}</p>
          )}
        </div>
        {profile.years_of_experience && (
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{profile.years_of_experience}</div>
            <div className="text-xs text-muted-foreground">years exp</div>
          </div>
        )}
      </div>

      {profile.bio && (
        <p className="text-sm text-muted-foreground mb-4">{profile.bio}</p>
      )}

      {/* Contact Info */}
      <div className="space-y-2 mb-4 text-sm">
        {profile.email && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">📧</span>
            <span>{profile.email}</span>
          </div>
        )}
        {profile.phone && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">📱</span>
            <span>{profile.phone}</span>
          </div>
        )}
        {profile.location && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">📍</span>
            <span>{profile.location}</span>
          </div>
        )}
        {profile.linkedin_url && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">💼</span>
            <a 
              href={profile.linkedin_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              LinkedIn Profile
            </a>
          </div>
        )}
        {profile.portfolio_url && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">🌐</span>
            <a 
              href={profile.portfolio_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Portfolio
            </a>
          </div>
        )}
      </div>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resumes */}
      {resumes && resumes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-2">Resumes ({resumes.length})</h4>
          <div className="space-y-2">
            {resumes.map((resume) => (
              <div 
                key={resume.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-muted/40"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{resume.name}</span>
                  {resume.is_primary && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {resume.skills.length} skills
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
