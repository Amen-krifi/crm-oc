import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTasks } from '@/lib/store/committee-store';
import DimCommandCenter from '@/components/dim/DimCommandCenter';
import type { Contact, Log, Profile } from '@/lib/types';
import { isDIM } from '@/lib/auth';

export default async function DimPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) redirect('/login');

  // Verify access: user is DIM or admin
  const userIsDim = isDIM(profile) || profile.department === 'admin' || user.email === 'bsabt76@gmail.com';
  if (!userIsDim) {
    redirect('/dashboard');
  }

  // Load all contacts, profiles, and logs
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('*')
    .order('name');

  const { data: contactsData } = await supabase
    .from('contacts')
    .select('*, owner:profiles!owner_id(id, name)')
    .order('created_at', { ascending: false });

  const { data: logsData } = await supabase
    .from('logs')
    .select('*')
    .order('occurred_at', { ascending: false });

  const tasks = getTasks();

  return (
    <DimCommandCenter
      currentUser={profile}
      profiles={(profilesData ?? []) as Profile[]}
      contacts={(contactsData ?? []) as Contact[]}
      logs={(logsData ?? []) as Log[]}
      tasks={tasks}
    />
  );
}
