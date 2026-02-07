# Testing Supabase Profile Integration

## Prerequisites
✅ Supabase tables created
✅ Environment variables set
✅ Frontend built successfully

## Test Flow

### 1. Start the App
```bash
npm run dev
```

Navigate to: http://localhost:3000/chat

### 2. Test Profile Creation
Try these prompts in the chat:

**Create a profile:**
```
Create my profile:
- Name: John Doe
- Current Role: Senior Software Engineer
- Experience: 5 years
- Location: San Francisco, CA
- Skills: React, TypeScript, Python, AWS, Docker
- Bio: Full-stack engineer with experience building scalable web applications
```

**View your profile:**
```
Show me my profile
```

The AI should:
1. Call `updateUserProfile` tool
2. Save to Supabase
3. Render `ProfileCard` component with your info

### 3. Test Resume Management

**Add a resume:**
```
Add a resume named "Software Engineer Resume" with this content:

JOHN DOE
Senior Software Engineer

EXPERIENCE:
- Built React applications serving 1M+ users
- Architected microservices on AWS
- Led team of 5 engineers

SKILLS: React, TypeScript, Python, Node.js, AWS, Docker, PostgreSQL
```

**View resumes:**
```
Show my resumes
```

### 4. Test Job Analysis with Profile

**Analyze a job (should auto-use your profile):**
```
Analyze this job:

Senior Frontend Engineer at TechCorp
Requirements:
- 5+ years React experience
- TypeScript expert
- AWS deployment experience
- Team leadership

I want to see my fit score
```

The AI should:
1. Call `analyzeJobDescription` 
2. Auto-fetch your profile from Supabase
3. Calculate fit score based on YOUR skills
4. Show missing skills panel

### 5. Verify in Supabase

Go to your Supabase dashboard:
1. Navigate to Table Editor
2. Check `user_profiles` table - should see your profile
3. Check `resumes` table - should see your resume

## Expected Tool Calls

When testing, you should see these tools being invoked:

1. **Profile Management:**
   - `updateUserProfile` - Create/update profile
   - `getUserProfile` - Fetch profile
   - `getUserResumes` - List resumes
   - `addResume` - Create new resume
   - `getProfileSummary` - Get formatted summary

2. **Automatic Integration:**
   - `analyzeJobDescription` auto-fetches profile if not provided
   - `generateContent` auto-fetches profile if not provided

## Troubleshooting

### Profile not saving?
- Check Supabase URL/key in `.env.local`
- Check browser console for errors
- Verify tables exist in Supabase dashboard

### AI not using profile?
- Make sure profile exists (create one first)
- Check that `demo-user` ID matches across calls
- Look for console logs about profile fetching

### Components not rendering?
- Check that ProfileCard is registered in `src/lib/tambo.ts`
- Verify build completed successfully
- Check browser console for React errors

## What's Working

✅ Profile CRUD operations via Supabase
✅ Resume management (multiple resumes per user)
✅ Auto-fetch profile for job analysis
✅ ProfileCard component renders user data
✅ All tools registered with Tambo AI

## Next Enhancement Ideas

- **Authentication**: Replace "demo-user" with real auth
- **Profile Editor UI**: Direct form instead of chat-only
- **Resume Parser**: Extract skills automatically from resume text
- **Version Control**: Track changes to profiles/resumes over time
- **Share Profiles**: Generate shareable profile links
