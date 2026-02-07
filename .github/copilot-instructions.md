# GitHub Copilot Instructions

This is a **Job Search Copilot** application built with Tambo AI - an AI-powered assistant that helps analyze job descriptions, generate tailored content, and track applications through generative UI.

## Build, Test, and Lint Commands

### Frontend (Next.js)
```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
```

### Backend (FastAPI)
```bash
cd backend
source .venv/bin/activate  # Activate virtual environment
uvicorn main:app --reload  # Start server on localhost:8000

# Or with uv
uv run uvicorn main:app --reload
```

## Architecture Overview

This is a **dual-stack application**:

### Frontend: Next.js 15 + Tambo AI
- **App Router** architecture with TypeScript and React 19
- **Tambo AI SDK** enables AI to dynamically generate and control React components
- **Chat interface** at `/chat` where AI renders components based on conversation

### Backend: FastAPI + SQLModel + Supabase
- **FastAPI REST API** for job analysis and application tracking
- **SQLite** for job applications (backend/jobcopilot.db)
- **Supabase** for user profiles and resumes (cloud PostgreSQL)
- Optional OpenAI integration for enhanced LLM-based analysis

### Core Flow
1. User sends message → Tambo AI agent decides which **tool** to call
2. Tool executes (calls backend API or service) → returns structured data
3. AI decides which **component** to render with that data
4. Component appears in chat with live, interactive UI

## Key Conventions

### Component Registration System
All AI-controllable components must be registered in **`src/lib/tambo.ts`**:

```typescript
export const components: TamboComponent[] = [
  {
    name: "ComponentName",           // Must match usage
    description: "Clear description", // Helps AI decide when to use it
    component: ComponentRef,
    propsSchema: zodSchema,          // Zod schema for type safety
  },
];
```

**When adding new components:**
1. Create component in `src/components/tambo/` or `src/components/job-copilot/`
2. Define Zod schema for props
3. Type props with `z.infer<typeof schema>`
4. Register in `src/lib/tambo.ts` components array

### Tool Registration System
External functions/APIs are registered as **tools** in **`src/lib/tambo.ts`**:

```typescript
export const tools: TamboTool[] = [
  {
    name: "toolName",
    description: "What this tool does",
    tool: functionReference,
    inputSchema: z.object({ ... }),
    outputSchema: z.object({ ... }),
  },
];
```

**When adding new tools:**
1. Implement function in `src/services/`
2. Define Zod schemas for inputs AND outputs
3. Register in `src/lib/tambo.ts` tools array

### Provider Setup
`TamboProvider` must wrap the app (configured in `src/app/layout.tsx`):
- Provides API key from environment
- Injects registered components and tools
- Enables streaming architecture

### Backend API Patterns
- All endpoints use `/api/` prefix
- Job analysis endpoints: `/api/analyze_jd`, `/api/generate_content`
- Application CRUD: `/api/applications` (GET, POST, PATCH)
- Use `ALLOWED_STAGES` constant for valid application stages

### Styling Guidelines
- Use **Tailwind CSS** classes exclusively
- Support dark mode via CSS variables (check existing components)
- Components should accept `variant` and `size` props when applicable
- Follow existing patterns in `src/components/tambo/` for consistency

### TypeScript Requirements
- Strict mode enabled - all code must be fully typed
- Use Zod schemas for runtime validation
- Prefer `z.infer<typeof schema>` over manual type definitions
- No `any` types unless absolutely necessary

## Environment Variables

### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_TAMBO_API_KEY=       # Required: Tambo AI API key
NEXT_PUBLIC_JOB_API_URL=         # Backend URL (default: http://localhost:8000)
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anonymous key
```

### Backend (`.env`)
```bash
DATABASE_URL=sqlite:///./jobcopilot.db  # Database connection
OPENAI_API_KEY=                          # Optional: For LLM-enhanced analysis
OPENAI_MODEL=gpt-4o-mini                # Optional: Model to use
OPENAI_BASE_URL=                        # Optional: Custom endpoint
```

## Important File Locations

- **Component & Tool Registry**: `src/lib/tambo.ts` (CENTRAL CONFIG)
- **Supabase Client**: `src/lib/supabase.ts`
- **Profile Service**: `src/services/profile-service.ts` (user profiles & resumes)
- **Job Copilot Components**: `src/components/job-copilot/`
- **Tambo UI Components**: `src/components/tambo/`
- **API Services**: `src/services/`
- **Backend**: `backend/main.py`
- **Chat Interface**: `src/app/chat/`
- **Supabase Schema**: `supabase-schema.sql`

## Tambo AI CLI

Use the Tambo CLI for adding pre-built components:
```bash
npx tambo add graph      # Add graph component
npx tambo help           # See all commands
npx tambo init           # Initialize Tambo in new project
```

## Testing

- No automated test framework configured
- Manual testing via development servers
- Verify AI can invoke components and tools correctly
- Check backend endpoints with `curl` or `test_api.sh`

## Resources

- **Tambo Docs**: https://docs.tambo.co
- **Tambo LLM Context**: https://docs.tambo.co/llms.txt
- **Project Guide**: See `JOB_COPILOT_GUIDE.md` for user-facing features
