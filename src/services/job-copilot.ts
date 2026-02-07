import { getProfileSummary } from './profile-service';

export type JobAnalysis = {
  title: string;
  company: string;
  location?: string | null;
  employment_type?: string | null;
  salary_range?: string | null;
  summary?: string | null;
  responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
  fit_score: number;
  missing_skills: string[];
  match_rationale?: string | null;
};

export type GeneratedContent = {
  resume_bullets: string[];
  cover_letter_paragraphs: string[];
  talking_points: string[];
};

export type Application = {
  id: number;
  title: string;
  company: string;
  location?: string | null;
  url?: string | null;
  stage: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_JOB_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return (await response.json()) as T;
}

export async function analyzeJobDescription(input: {
  jobDescription: string;
  candidateProfile?: string;
}): Promise<JobAnalysis> {
  // Auto-fetch profile if candidateProfile not provided
  let profile = input.candidateProfile;
  if (!profile) {
    try {
      const userId = "demo-user"; // In production, get from auth context
      profile = await getProfileSummary(userId);
    } catch (error) {
      console.log("No profile found, analyzing without candidate data");
    }
  }

  return apiFetch<JobAnalysis>("/api/analyze_jd", {
    method: "POST",
    body: JSON.stringify({
      job_description: input.jobDescription,
      candidate_profile: profile,
    }),
  });
}

export async function generateContent(input: {
  jobDescription: string;
  candidateProfile?: string;
}): Promise<GeneratedContent> {
  // Auto-fetch profile if candidateProfile not provided
  let profile = input.candidateProfile;
  if (!profile) {
    try {
      const userId = "demo-user"; // In production, get from auth context
      profile = await getProfileSummary(userId);
    } catch (error) {
      console.log("No profile found, generating generic content");
    }
  }

  return apiFetch<GeneratedContent>("/api/generate_content", {
    method: "POST",
    body: JSON.stringify({
      job_description: input.jobDescription,
      candidate_profile: profile,
    }),
  });
}

export async function listApplications(): Promise<Application[]> {
  return apiFetch<Application[]>("/api/applications");
}

export async function createApplication(input: {
  title: string;
  company: string;
  location?: string;
  url?: string;
  stage?: string;
  notes?: string;
}): Promise<Application> {
  return apiFetch<Application>("/api/applications", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateApplication(input: {
  id: number;
  title?: string;
  company?: string;
  location?: string;
  url?: string;
  stage?: string;
  notes?: string;
}): Promise<Application> {
  const { id, ...payload } = input;
  return apiFetch<Application>(`/api/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
