/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import {
  ApplicationBoard,
  applicationBoardSchema,
} from "@/components/job-copilot/application-board";
import {
  GeneratedContentPanel,
  generatedContentPanelSchema,
} from "@/components/job-copilot/generated-content-panel";
import {
  JobSummaryCard,
  jobSummaryCardSchema,
} from "@/components/job-copilot/job-summary-card";
import {
  MissingSkillsPanel,
  missingSkillsPanelSchema,
} from "@/components/job-copilot/missing-skills-panel";
import {
  ProfileCard,
  profileCardSchema,
} from "@/components/job-copilot/profile-card";
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";
import {
  getUserProfile,
  getUserResumes,
  createOrUpdateProfile,
  createResume,
  getProfileSummary,
} from "@/services/profile-service";
import {
  analyzeJobDescription,
  createApplication,
  generateContent,
  listApplications,
  updateApplication,
} from "@/services/job-copilot";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  {
    name: "countryPopulation",
    description:
      "A tool to get population statistics by country with advanced filtering options",
    tool: getCountryPopulations,
    inputSchema: z.object({
      continent: z.string().optional(),
      sortBy: z.enum(["population", "growthRate"]).optional(),
      limit: z.number().optional(),
      order: z.enum(["asc", "desc"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        countryCode: z.string(),
        countryName: z.string(),
        continent: z.enum([
          "Asia",
          "Africa",
          "Europe",
          "North America",
          "South America",
          "Oceania",
        ]),
        population: z.number(),
        year: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "globalPopulation",
    description:
      "A tool to get global population trends with optional year range filtering",
    tool: getGlobalPopulationTrend,
    inputSchema: z.object({
      startYear: z.number().optional(),
      endYear: z.number().optional(),
    }),
    outputSchema: z.array(
      z.object({
        year: z.number(),
        population: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "analyzeJobDescription",
    description:
      "Analyze a job description and candidate profile to extract role details and fit score",
    tool: analyzeJobDescription,
    inputSchema: z.object({
      jobDescription: z.string().describe("Full job description text"),
      candidateProfile: z
        .string()
        .optional()
        .describe("Candidate profile or resume summary"),
    }),
    outputSchema: z.object({
      title: z.string(),
      company: z.string(),
      location: z.string().nullable().optional(),
      employment_type: z.string().nullable().optional(),
      salary_range: z.string().nullable().optional(),
      summary: z.string().nullable().optional(),
      responsibilities: z.array(z.string()),
      required_skills: z.array(z.string()),
      preferred_skills: z.array(z.string()),
      fit_score: z.number(),
      missing_skills: z.array(z.string()),
      match_rationale: z.string().nullable().optional(),
    }),
  },
  {
    name: "generateContent",
    description:
      "Generate tailored resume bullets, cover letter paragraphs, and interview talking points",
    tool: generateContent,
    inputSchema: z.object({
      jobDescription: z.string().describe("Full job description text"),
      candidateProfile: z
        .string()
        .optional()
        .describe("Candidate profile or resume summary"),
    }),
    outputSchema: z.object({
      resume_bullets: z.array(z.string()),
      cover_letter_paragraphs: z.array(z.string()),
      talking_points: z.array(z.string()),
    }),
  },
  {
    name: "listApplications",
    description: "List all tracked job applications",
    tool: listApplications,
    inputSchema: z.object({}),
    outputSchema: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        company: z.string(),
        location: z.string().nullable().optional(),
        url: z.string().nullable().optional(),
        stage: z.string(),
        notes: z.string().nullable().optional(),
        created_at: z.string(),
        updated_at: z.string(),
      }),
    ),
  },
  {
    name: "createApplication",
    description: "Create a new job application entry",
    tool: createApplication,
    inputSchema: z.object({
      title: z.string(),
      company: z.string(),
      location: z.string().optional(),
      url: z.string().optional(),
      stage: z.string().optional(),
      notes: z.string().optional(),
    }),
    outputSchema: z.object({
      id: z.number(),
      title: z.string(),
      company: z.string(),
      location: z.string().nullable().optional(),
      url: z.string().nullable().optional(),
      stage: z.string(),
      notes: z.string().nullable().optional(),
      created_at: z.string(),
      updated_at: z.string(),
    }),
  },
  {
    name: "updateApplication",
    description: "Update an application status or details",
    tool: updateApplication,
    inputSchema: z.object({
      id: z.number(),
      title: z.string().optional(),
      company: z.string().optional(),
      location: z.string().optional(),
      url: z.string().optional(),
      stage: z.string().optional(),
      notes: z.string().optional(),
    }),
    outputSchema: z.object({
      id: z.number(),
      title: z.string(),
      company: z.string(),
      location: z.string().nullable().optional(),
      url: z.string().nullable().optional(),
      stage: z.string(),
      notes: z.string().nullable().optional(),
      created_at: z.string(),
      updated_at: z.string(),
    }),
  },
  {
    name: "getUserProfile",
    description: "Get the current user's profile including bio, skills, and experience",
    tool: async () => {
      // For demo, using a fixed user ID. In production, get from auth context
      const userId = "demo-user";
      return await getUserProfile(userId);
    },
    inputSchema: z.object({}),
    outputSchema: z.object({
      id: z.string(),
      user_id: z.string(),
      full_name: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
      location: z.string().optional().nullable(),
      linkedin_url: z.string().optional().nullable(),
      portfolio_url: z.string().optional().nullable(),
      years_of_experience: z.number().optional().nullable(),
      current_title: z.string().optional().nullable(),
      bio: z.string().optional().nullable(),
      skills: z.array(z.string()),
      created_at: z.string(),
      updated_at: z.string(),
    }).nullable(),
  },
  {
    name: "updateUserProfile",
    description: "Create or update the user's profile with bio, skills, experience, and contact info",
    tool: async (input: {
      full_name?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin_url?: string;
      portfolio_url?: string;
      years_of_experience?: number;
      current_title?: string;
      bio?: string;
      skills?: string[];
    }) => {
      const userId = "demo-user";
      return await createOrUpdateProfile(userId, input);
    },
    inputSchema: z.object({
      full_name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
      linkedin_url: z.string().optional(),
      portfolio_url: z.string().optional(),
      years_of_experience: z.number().optional(),
      current_title: z.string().optional(),
      bio: z.string().optional(),
      skills: z.array(z.string()).optional(),
    }),
    outputSchema: z.object({
      id: z.string(),
      user_id: z.string(),
      full_name: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
      location: z.string().optional().nullable(),
      linkedin_url: z.string().optional().nullable(),
      portfolio_url: z.string().optional().nullable(),
      years_of_experience: z.number().optional().nullable(),
      current_title: z.string().optional().nullable(),
      bio: z.string().optional().nullable(),
      skills: z.array(z.string()),
      created_at: z.string(),
      updated_at: z.string(),
    }).nullable(),
  },
  {
    name: "getUserResumes",
    description: "Get all resumes for the current user",
    tool: async () => {
      const userId = "demo-user";
      return await getUserResumes(userId);
    },
    inputSchema: z.object({}),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        user_id: z.string(),
        profile_id: z.string().optional().nullable(),
        name: z.string(),
        content: z.string(),
        skills: z.array(z.string()),
        experience_years: z.number().optional().nullable(),
        is_primary: z.boolean(),
        created_at: z.string(),
        updated_at: z.string(),
      })
    ),
  },
  {
    name: "addResume",
    description: "Add a new resume for the user",
    tool: async (input: {
      name: string;
      content: string;
      skills?: string[];
      experience_years?: number;
      is_primary?: boolean;
    }) => {
      const userId = "demo-user";
      return await createResume(userId, input);
    },
    inputSchema: z.object({
      name: z.string().describe("Resume name or version (e.g., 'Software Engineer Resume')"),
      content: z.string().describe("Full resume text content"),
      skills: z.array(z.string()).optional().describe("Array of skills from resume"),
      experience_years: z.number().optional().describe("Years of experience"),
      is_primary: z.boolean().optional().describe("Set as primary resume"),
    }),
    outputSchema: z.object({
      id: z.string(),
      user_id: z.string(),
      profile_id: z.string().optional().nullable(),
      name: z.string(),
      content: z.string(),
      skills: z.array(z.string()),
      experience_years: z.number().optional().nullable(),
      is_primary: z.boolean(),
      created_at: z.string(),
      updated_at: z.string(),
    }).nullable(),
  },
  {
    name: "getProfileSummary",
    description: "Get a formatted summary of user's profile and primary resume for job matching",
    tool: async () => {
      const userId = "demo-user";
      return { summary: await getProfileSummary(userId) };
    },
    inputSchema: z.object({}),
    outputSchema: z.object({
      summary: z.string().describe("Formatted profile and resume summary"),
    }),
  },
  // Add more tools here
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  {
    name: "JobSummaryCard",
    description:
      "Shows a job summary with role details, fit score, and key skills.",
    component: JobSummaryCard,
    propsSchema: jobSummaryCardSchema,
  },
  {
    name: "MissingSkillsPanel",
    description:
      "Highlights missing skills with suggested actions to close gaps.",
    component: MissingSkillsPanel,
    propsSchema: missingSkillsPanelSchema,
  },
  {
    name: "GeneratedContentPanel",
    description:
      "Displays tailored resume bullets, cover letter paragraphs, and interview talking points.",
    component: GeneratedContentPanel,
    propsSchema: generatedContentPanelSchema,
  },
  {
    name: "ApplicationBoard",
    description:
      "Kanban board view of job applications across pipeline stages.",
    component: ApplicationBoard,
    propsSchema: applicationBoardSchema,
  },
  {
    name: "ProfileCard",
    description:
      "Displays user profile with contact info, skills, experience, and resumes.",
    component: ProfileCard,
    propsSchema: profileCardSchema,
  },
  // Add more components here
];
