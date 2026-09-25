import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileProvider } from '@/lib/profile-context';
import Sidebar from '@/components/Sidebar';
import type { Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) redirect('/login');

  const isUserDim =
    profile.department === 'admin' ||
    user.email === 'bsabt76@gmail.com' ||
    user.user_metadata?.role === 'ocvp_dim';

  const enrichedProfile: Profile = {
    ...profile,
    department: isUserDim ? 'dim' : profile.department,
    role: isUserDim
      ? 'ocvp_dim'
      : (user.user_metadata?.role || (profile.department === 'admin' ? 'ocvp' : 'oc_member')),
    oc_department:
      user.user_metadata?.oc_department ||
      (profile.department === 'pr_marketing' ? 'marketing' : (profile.department as any))
  };

  return (
    <ProfileProvider profile={enrichedProfile}>
      <div className="flex min-h-screen bg-paper">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
        </main>
      </div>
    </ProfileProvider>
  );
}
