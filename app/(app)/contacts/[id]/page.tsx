import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContactDetailHeader from '@/components/ContactDetailHeader';
import ActivityLog from '@/components/ActivityLog';
import type { Contact, Log } from '@/lib/types';

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: contact } = await supabase
    .from('contacts')
    .select('*, owner:profiles!owner_id(id, name), hiddenBy:profiles!hidden_by(id, name)')
    .eq('id', params.id)
    .single();

  if (!contact) notFound();

  const { data: logs } = await supabase
    .from('logs')
    .select('*, user:profiles(id, name)')
    .eq('contact_id', params.id)
    .order('occurred_at', { ascending: false });

  return (
    <div>
      <ContactDetailHeader contact={contact as Contact} />
      <h2 className="mb-3 text-sm font-semibold text-ink">Activity &amp; interactions</h2>
      <ActivityLog contactId={params.id} logs={(logs ?? []) as Log[]} />
    </div>
  );
}
