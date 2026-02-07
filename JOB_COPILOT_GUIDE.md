# Job Search Copilot - User Guide

A Tambo AI-powered job search assistant that helps you analyze job descriptions, generate tailored content, and track your applications through an interactive chat interface.

## 🚀 Features

### 1. **Job Description Analysis**
Paste any job posting and the AI will:
- Extract key details (title, company, location, salary, employment type)
- Parse responsibilities and required/preferred skills
- Calculate a fit score based on your profile
- Identify skill gaps with actionable suggestions

### 2. **Content Generation**
Get AI-generated, job-specific:
- **Resume bullets** - Achievement-focused statements tailored to the role
- **Cover letter paragraphs** - Compelling introduction and value proposition
- **Interview talking points** - Key themes to highlight in conversations

### 3. **Application Tracking**
Manage your job search pipeline:
- Track applications across 5 stages: Interested → Applied → Interviewing → Offer → Rejected
- View all applications in a kanban board
- Add notes and URLs for each job
- Update statuses as you progress

## 🎯 Getting Started

### Prerequisites
- **Backend**: Python FastAPI server running on `http://localhost:8000`
- **Frontend**: Next.js app running on `http://localhost:3000`
- **Tambo API Key**: Set in `.env.local` as `NEXT_PUBLIC_TAMBO_API_KEY`
- **(Optional) OpenAI API Key**: For enhanced LLM-based analysis, set `OPENAI_API_KEY` in backend `.env`

### Running the App

1. **Start the Backend**:
```bash
cd backend
source .venv/bin/activate  # or `uv run` if using uv
uvicorn main:app --reload
```

2. **Start the Frontend**:
```bash
npm run dev
```

3. **Open the Chat**: Navigate to `http://localhost:3000/chat`

## 💬 Usage Examples

### Example 1: Analyze a Job Description

**User**: "Here's a job I'm interested in:
```
Senior Software Engineer at TechCorp
Location: San Francisco, CA (Hybrid)
Salary: $150k-$200k

Responsibilities:
- Design and build scalable web applications
- Lead technical architecture decisions
- Mentor junior engineers
- Collaborate with product teams

Required Skills:
- 5+ years experience with Python and FastAPI
- Strong React/TypeScript skills
- Experience with AWS, Docker, Kubernetes
- SQL and database design

Preferred:
- GraphQL experience
- CI/CD pipeline management
```

My background: 4 years as a full-stack developer with Python, React, and PostgreSQL."

**AI Response**:
The AI will call the `analyzeJobDescription` tool and render:
- **JobSummaryCard**: Shows the role details, your 70% fit score, and top skills
- **MissingSkillsPanel**: Highlights gaps like "FastAPI", "Kubernetes" with suggestions

---

### Example 2: Generate Tailored Content

**User**: "Can you help me write resume bullets and a cover letter intro for this role?"

**AI Response**:
The AI calls `generateContent` and renders:
- **GeneratedContentPanel** with:
  - 3 resume bullets highlighting relevant Python/React achievements
  - Cover letter paragraphs explaining your fit
  - Interview talking points (e.g., "Discuss your experience scaling web apps")

---

### Example 3: Track an Application

**User**: "Track this job for me. I just applied today."

**AI Response**:
The AI calls `createApplication` with stage "Applied" and confirms:
- "✅ Added 'Senior Software Engineer at TechCorp' to your pipeline."

**User**: "Show me my applications."

**AI Response**:
The AI calls `listApplications` and renders:
- **ApplicationBoard**: A kanban view showing all your tracked jobs organized by stage

---

### Example 4: Update Application Status

**User**: "I got an interview for the TechCorp role! Update it."

**AI Response**:
The AI calls `updateApplication` with stage "Interviewing" and confirms:
- "🎉 Moved 'Senior Software Engineer at TechCorp' to Interviewing stage."

## 🧩 Components Overview

The AI dynamically renders these React components during the conversation:

| Component | Purpose | When Used |
|-----------|---------|-----------|
| **JobSummaryCard** | Displays role details, fit score, top skills, responsibilities | After analyzing a JD |
| **MissingSkillsPanel** | Shows skill gaps and learning suggestions | When fit score < 100% |
| **GeneratedContentPanel** | Presents resume bullets, cover letter, talking points | After content generation |
| **ApplicationBoard** | Kanban view of all applications by stage | When listing applications |

## 🔧 Technical Architecture

### Backend (`/backend/main.py`)
- **FastAPI** REST API with SQLModel/SQLite database
- **Endpoints**:
  - `POST /api/analyze_jd` - Analyze job description + candidate profile
  - `POST /api/generate_content` - Generate tailored content
  - `GET /api/applications` - List all applications
  - `POST /api/applications` - Create new application
  - `PATCH /api/applications/{id}` - Update application

### Frontend (`/src`)
- **Tambo AI React SDK** for generative UI
- **Components** (`/src/components/job-copilot/`):
  - `job-summary-card.tsx`
  - `missing-skills-panel.tsx`
  - `generated-content-panel.tsx`
  - `application-board.tsx`
- **Services** (`/src/services/job-copilot.ts`):
  - API client functions wrapping backend calls
- **Registry** (`/src/lib/tambo.ts`):
  - Registers components and tools with Tambo

### How It Works
1. User sends a message in the chat
2. Tambo AI agent decides which **tool** to call (e.g., `analyzeJobDescription`)
3. Tool executes and returns structured data
4. AI decides which **component** to render with that data
5. Component appears in the chat with live, interactive UI

## 🎨 Customization

### Add More Job Boards
Modify `tools` in `/src/lib/tambo.ts` to add integrations with LinkedIn, Indeed, etc.

### Enhance Analysis
Add an LLM provider API key in backend `.env`:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

### Extend Stages
Update `ALLOWED_STAGES` in `backend/main.py` and `applicationBoardSchema` in `application-board.tsx`.

## 🐛 Troubleshooting

### Backend not responding?
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

### Frontend can't connect to backend?
Check `NEXT_PUBLIC_JOB_API_URL` in `.env.local` matches backend URL.

### Components not rendering?
Verify all components are registered in `/src/lib/tambo.ts` with matching names and schemas.

## 📚 Resources

- [Tambo AI Docs](https://docs.tambo.co)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Next.js Docs](https://nextjs.org/docs)

---

**Built for hackathons. Powered by Tambo AI.** 🎯
