# Supabase Integration Setup

This project uses Supabase to store user profiles and resumes for enhanced job matching.

## Setup Instructions

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Note your project URL and anon key from Settings → API

### 2. Run Database Migrations
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema.sql` and run it
4. This creates the `user_profiles` and `resumes` tables

### 3. Configure Environment Variables
Add to your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. (Optional) Configure Authentication
The current setup uses a simple `user_id` string. For production:
- Set up Supabase Auth (Email, OAuth, etc.)
- Update RLS policies to use `auth.uid()`
- Modify profile service to use authenticated user

## Database Schema

### `user_profiles`
Stores user information and skills:
- `id` (UUID) - Primary key
- `user_id` (TEXT) - User identifier
- `full_name`, `email`, `phone`, `location`
- `linkedin_url`, `portfolio_url`
- `years_of_experience`, `current_role`
- `bio` - Professional summary
- `skills` (TEXT[]) - Array of skills

### `resumes`
Stores multiple resumes per user:
- `id` (UUID) - Primary key
- `user_id` (TEXT) - User identifier
- `profile_id` (UUID) - Link to user profile
- `name` - Resume name/version
- `content` - Full resume text
- `skills` (TEXT[]) - Parsed skills
- `experience_years` - Years of experience
- `is_primary` (BOOLEAN) - Default resume

## Usage

### Create/Update Profile
```typescript
import { createOrUpdateProfile } from '@/services/profile-service';

await createOrUpdateProfile('user-123', {
  full_name: 'Jane Doe',
  skills: ['React', 'TypeScript', 'Python'],
  years_of_experience: 5,
  bio: 'Full-stack developer...',
});
```

### Add a Resume
```typescript
import { createResume } from '@/services/profile-service';

await createResume('user-123', {
  name: 'Software Engineer Resume',
  content: 'Full resume text...',
  skills: ['React', 'Node.js', 'AWS'],
  is_primary: true,
});
```

### Get Profile Summary for Job Analysis
```typescript
import { getProfileSummary } from '@/services/profile-service';

const summary = await getProfileSummary('user-123');
// Use this as candidateProfile in analyzeJobDescription
```

## Next Steps

1. **Add Profile Management UI**
   - Create profile form component
   - Resume upload/editor component
   - Skills management interface

2. **Integrate with Job Analysis**
   - Auto-fetch user profile when analyzing jobs
   - Use stored skills for fit score calculation
   - Track which resumes work best for different roles

3. **Enhanced Features**
   - Multiple resume versions (technical, managerial, etc.)
   - Skill gap tracking over time
   - Job recommendation based on profile

## Security Notes

- RLS policies are configured to allow users to only access their own data
- Currently uses `current_setting('app.current_user_id')` - update for your auth system
- For production: implement proper authentication with Supabase Auth
