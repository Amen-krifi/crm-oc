import { createClient } from '@/lib/supabase/server';
import { getTasks, getResources, getAnnouncements } from '@/lib/store/committee-store';
import OcvpHubComponent from '@/components/ocvp/OcvpHubComponent';
import type { Contact, Log, Profile } from '@/lib/types';

export default async function OcvpLogisticsPage() {
  const supabase = createClient();

  // Load team members, contacts and logs
  const { data: membersData } = await supabase
    .from('profiles')
    .select('*')
    .or('department.eq.logistics,department.eq.admin');

  const { data: contactsData } = await supabase
    .from('contacts')
    .select('*')
    .eq('department', 'logistics');

  const { data: logsData } = await supabase
    .from('logs')
    .select('*')
    .order('occurred_at', { ascending: false });

  const contacts = (contactsData ?? []) as Contact[];
  const logs = (logsData ?? []) as Log[];
  const members = (membersData ?? []) as Profile[];

  const confirmed = contacts.filter((c) => c.status === 'confirmed').length;
  const inDiscussion = contacts.filter((c) => c.status === 'in_discussion' || c.status === 'contacted').length;

  const targetKpis = [
    { label: 'Venue & Vendor Contacts', value: contacts.length, hint: 'Suppliers & partners' },
    { label: 'Confirmed Deliverables', value: confirmed, hint: 'Contracts signed' },
    { label: 'Active In-Discussion', value: inDiscussion, hint: 'Quotes & walkthroughs' }
  ];

  const tasks = getTasks('logistics');
  const resources = getResources('logistics');
  const announcements = getAnnouncements('logistics');

  return (
    <OcvpHubComponent
      dept="logistics"
      vpTitle="OCVP Logistics & Venue Operations"
      vpSubtitle="Supervise auditorium AV setups, floor plans, catering logistics, vendor negotiations, and emergency shift rotations."
      targetKpis={targetKpis}
      teamMembers={members.filter((m) => m.department === 'logistics')}
      contacts={contacts}
      logs={logs}
      initialTasks={tasks}
      initialResources={resources}
      initialAnnouncements={announcements}
    />
  );
}
