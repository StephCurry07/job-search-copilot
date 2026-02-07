import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  years_of_experience?: number;
  current_role?: string;
  bio?: string;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  profile_id?: string;
  name: string;
  content: string;
  skills: string[];
  experience_years?: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}
