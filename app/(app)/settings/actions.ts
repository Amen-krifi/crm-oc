'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Department, Profile } from '@/lib/types';

export interface CreateMemberResult {
  error?: string;
  success?: boolean;
}

/**
 * Admin-only: provisions a login (auth.users) for a new team member.
 * The `handle_new_user` trigger in supabase/schema.sql picks up the
 * name/department metadata and creates the matching `profiles` row
 * automatically, the same way it does for self-service sign-up.
 */
export async function createTeamMember(formData: FormData): Promise<CreateMemberResult> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const department = String(formData.get('department') ?? '') as Department;

  if (!name || !email || !password || !department) {
    return { error: 'All fields are required.' };
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  // Re-check admin status server-side — the client-side gate is only UX,
  // this is the real enforcement since the admin client bypasses RLS.
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in.' };

  const { data: requester } = await supabase
    .from('profiles')
    .select('department')
    .eq('id', user.id)
    .single<Pick<Profile, 'department'>>();

  if (requester?.department !== 'admin') {
    return { error: 'Only Admin/Board can create accounts.' };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Admin client is not configured.' };
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, department }
  });

  if (error) return { error: error.message };

  revalidatePath('/settings');
  return { success: true };
}
