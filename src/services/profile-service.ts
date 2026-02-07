import { supabase, UserProfile, Resume } from '@/lib/supabase';

// ========== User Profile Functions ==========

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function createOrUpdateProfile(
  userId: string,
  profileData: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        user_id: userId,
        ...profileData,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting profile:', error);
    throw error;
  }

  return data;
}

// ========== Resume Functions ==========

export async function getUserResumes(userId: string): Promise<Resume[]> {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching resumes:', error);
    return [];
  }

  return data || [];
}

export async function getPrimaryResume(userId: string): Promise<Resume | null> {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .single();

  if (error) {
    console.error('Error fetching primary resume:', error);
    return null;
  }

  return data;
}

export async function createResume(
  userId: string,
  resumeData: {
    name: string;
    content: string;
    skills?: string[];
    experience_years?: number;
    is_primary?: boolean;
    profile_id?: string;
  }
): Promise<Resume | null> {
  // If setting as primary, unset other primary resumes first
  if (resumeData.is_primary) {
    await supabase
      .from('resumes')
      .update({ is_primary: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('resumes')
    .insert({
      user_id: userId,
      ...resumeData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating resume:', error);
    throw error;
  }

  return data;
}

export async function updateResume(
  resumeId: string,
  userId: string,
  updates: Partial<Omit<Resume, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Resume | null> {
  // If setting as primary, unset other primary resumes first
  if (updates.is_primary) {
    await supabase
      .from('resumes')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .neq('id', resumeId);
  }

  const { data, error } = await supabase
    .from('resumes')
    .update(updates)
    .eq('id', resumeId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating resume:', error);
    throw error;
  }

  return data;
}

export async function deleteResume(resumeId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting resume:', error);
    return false;
  }

  return true;
}

// ========== Helper Functions ==========

export async function getProfileSummary(userId: string): Promise<string> {
  const profile = await getUserProfile(userId);
  const resume = await getPrimaryResume(userId);

  if (!profile && !resume) {
    return '';
  }

  let summary = '';

  if (profile) {
    if (profile.current_role) summary += `Current Role: ${profile.current_role}\n`;
    if (profile.years_of_experience) summary += `Experience: ${profile.years_of_experience} years\n`;
    if (profile.bio) summary += `\n${profile.bio}\n`;
    if (profile.skills?.length) summary += `\nSkills: ${profile.skills.join(', ')}\n`;
  }

  if (resume) {
    summary += `\n--- Resume: ${resume.name} ---\n${resume.content}`;
  }

  return summary.trim();
}
