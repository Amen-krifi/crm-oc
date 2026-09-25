import { createClient } from '@/lib/supabase/server';
import { getTasks, getResources, getAnnouncements } from '@/lib/store/committee-store';
import OcvpHubComponent from '@/components/ocvp/OcvpHubComponent';
import type { Contact, Log, Profile } from '@/lib/types';

export default async function OcvpSalesPage() {
  const supabase = createClient();

  const { data: membersData } = await supabase
    .from('profiles')
    .select('*')
    .or('department.eq.sales,department.eq.admin');

  const { data: contactsData } = await supabase
    .from('contacts')
    .select('*')
    .eq('department', 'sales');

  const { data: logsData } = await supabase
    .from('logs')
    .select('*')
    .order('occurred_at', { ascending: false });

  const contacts = (contactsData ?? []) as Contact[];
  const logs = (logsData ?? []) as Log[];
  const members = (membersData ?? []) as Profile[];

  const confirmedSponsors = contacts.filter((c) => c.status === 'confirmed').length;
  const activeLeads = contacts.filter((c) => c.status === 'in_discussion' || c.status === 'contacted').length;

  const targetKpis = [
    { label: 'Total Corporate Leads', value: contacts.length, hint: 'Target: 50 accounts' },
    { label: 'Confirmed Partnerships', value: confirmedSponsors, hint: 'MOU / contract signed' },
    { label: 'Negotiations Ongoing', value: activeLeads, hint: 'High-value pitches' }
  ];

  const tasks = getTasks('sales');
  const resources = getResources('sales');
  const announcements = getAnnouncements('sales');

  return (
    <OcvpHubComponent
      dept="sales"
      vpTitle="OCVP Sales & Corporate Partnerships"
      vpSubtitle="Drive corporate sponsorship revenue, track lead outreach velocity, review pitch decks, and manage contract deliverables."
      targetKpis={targetKpis}
      teamMembers={members.filter((m) => m.department === 'sales')}
      contacts={contacts}
      logs={logs}
      initialTasks={tasks}
      initialResources={resources}
      initialAnnouncements={announcements}
    />
  );
}
