import { createClient } from '@/lib/supabase/server';
import { DEPARTMENT_LABELS } from '@/lib/types';
import type { Profile } from '@/lib/types';
import CreateMemberForm from '@/components/CreateMemberForm';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single<Profile>();

  const isAdmin = profile?.department === 'admin';
  const { data: team } = isAdmin
    ? await supabase.from('profiles').select('*').order('department')
    : { data: null };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-muted">Your account, and system-wide settings if you&apos;re an admin.</p>
      </div>

      <div className="panel mb-6 p-5">
        <p className="mb-4 text-sm font-semibold text-ink">Your account</p>
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-muted">Name</dt>
          <dd className="text-ink">{profile?.name}</dd>
          <dt className="text-muted">Email</dt>
          <dd className="text-ink">{profile?.email}</dd>
          <dt className="text-muted">Department</dt>
          <dd className="text-ink">{DEPARTMENT_LABELS[profile?.department ?? 'logistics']}</dd>
        </dl>
      </div>

      {isAdmin && (
        <div className="mb-6">
          <CreateMemberForm />
        </div>
      )}

      {isAdmin && (
        <div className="panel p-5">
          <p className="mb-4 text-sm font-semibold text-ink">Team members</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Department</th>
              </tr>
            </thead>
            <tbody>
              {(team ?? []).map((member) => (
                <tr key={member.id} className="border-b border-border last:border-0">
                  <td className="py-2 text-ink">{member.name}</td>
                  <td className="py-2 text-muted">{member.email}</td>
                  <td className="py-2 text-muted">{DEPARTMENT_LABELS[member.department as keyof typeof DEPARTMENT_LABELS]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
