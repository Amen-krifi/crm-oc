import { createClient } from '@/lib/supabase/server';
import ContactTable from '@/components/ContactTable';
import type { Contact, Department } from '@/lib/types';

export default async function MyContactsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();

  const { data } = await supabase
    .from('contacts')
    .select('*, owner:profiles!owner_id(id, name)')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">My Contacts</h1>
        <p className="text-sm text-muted">Contacts you personally own and are tracking outreach for.</p>
      </div>
      <ContactTable contacts={(data ?? []) as Contact[]} department={profile?.department as Department} />
    </div>
  );
}
