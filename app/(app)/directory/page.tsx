import { createClient } from '@/lib/supabase/server';
import ContactTable from '@/components/ContactTable';
import type { Contact, Department } from '@/lib/types';

// Route access is also enforced in middleware.ts (admin/board only).
export default async function DirectoryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();

  const { data } = await supabase
    .from('contacts')
    .select('*, owner:profiles!owner_id(id, name), hiddenBy:profiles!hidden_by(id, name)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">All Directory</h1>
        <p className="text-sm text-muted">Every contact across Logistics, Sales, and PR/Marketing.</p>
      </div>
      <ContactTable
        contacts={(data ?? []) as Contact[]}
        department={profile?.department as Department}
        showDepartmentColumn
        showDepartmentFilter
      />
    </div>
  );
}
