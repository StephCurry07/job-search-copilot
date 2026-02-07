"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { components, tools } from "@/lib/tambo";
import { TamboProvider, type InitialTamboThreadMessage } from "@tambo-ai/react";

const SYSTEM_INSTRUCTIONS: InitialTamboThreadMessage = {
  id: "system-welcome-message",
  role: "assistant",
  content: [{
    type: "text" as const,
    text: `# Job Search Copilot

I'm your AI assistant for navigating your job search journey. I can help you:

## 👤 **Manage Your Profile**
Store and update your professional information:
- Create/update your profile (bio, skills, experience, contact info)
- Add multiple resumes and mark your primary one
- View your complete profile anytime

## 📋 **Analyze Job Descriptions**
Share a job posting and I'll:
- Extract key details (title, company, requirements)
- Calculate your fit score based on your stored profile
- Identify missing skills and suggest actions

## ✍️ **Generate Tailored Content**
I can create:
- Resume bullets highlighting relevant achievements
- Cover letter paragraphs customized to the role
- Interview talking points to showcase your strengths

## 📊 **Track Applications**
Keep your pipeline organized:
- Create application entries
- View your kanban board across stages (Interested → Applied → Interviewing → Offer/Rejected)
- Update statuses and add notes

### How to get started:
1. **Set up your profile** - Tell me about your experience, skills, and background (I'll save it for future job matches)
2. **Share a job description** - Paste the full text or key details (I'll automatically use your profile to analyze fit)
3. **Track applications** - Ask me to "track this job" or "show my applications"

Ready to land your next opportunity? Let's go! 🚀`,
  }],
};

/**
 * Home page component that renders the Tambo chat interface.
 *
 * @remarks
 * The `NEXT_PUBLIC_TAMBO_URL` environment variable specifies the URL of the Tambo server.
 * You do not need to set it if you are using the default Tambo server.
 * It is only required if you are running the API server locally.
 *
 * @see {@link https://github.com/tambo-ai/tambo/blob/main/CONTRIBUTING.md} for instructions on running the API server locally.
 */
export default function Home() {
  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      initialMessages={[SYSTEM_INSTRUCTIONS]}
    >
      <div className="h-screen">
        <MessageThreadFull className="max-w-4xl mx-auto"/>
      </div>
    </TamboProvider>
  );
}
